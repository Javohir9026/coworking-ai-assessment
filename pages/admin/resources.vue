<script setup lang="ts">
import { useApiClient } from '~/services/api-client'
import type { Resource } from '~/types/resource'

definePageMeta({ layout: 'admin' })
const items = ref<Resource[]>([])
const name = ref('')
const type = ref<Resource['type']>('desk')
const capacity = ref(1)
const hourlyPriceMinor = ref(25000)
const editing = ref<Resource | null>(null)
const loading = ref(true)
const saving = ref(false)
const error = ref<string | null>(null)
const success = ref<string | null>(null)
const page = ref(1)
const pageSize = 10
const paginatedItems = computed(() =>
  items.value.slice((page.value - 1) * pageSize, page.value * pageSize)
)
async function load(): Promise<void> {
  loading.value = true
  error.value = null
  try {
    items.value = await useApiClient().request<Resource[]>('/admin/resources')
    page.value = 1
  } catch (caught: unknown) {
    items.value = []
    error.value = caught instanceof Error ? caught.message : 'Resources could not be loaded.'
  } finally {
    loading.value = false
  }
}
function reset(): void {
  name.value = ''
  type.value = 'desk'
  capacity.value = 1
  hourlyPriceMinor.value = 25000
  editing.value = null
}
function edit(item: Resource): void {
  editing.value = item
  name.value = item.name
  type.value = item.type
  capacity.value = item.capacity
  hourlyPriceMinor.value = item.hourlyPriceMinor
  error.value = null
}
async function submit(): Promise<void> {
  if (
    !name.value.trim() ||
    capacity.value < 1 ||
    !Number.isInteger(hourlyPriceMinor.value) ||
    hourlyPriceMinor.value < 0
  ) {
    error.value = 'Name, positive capacity, and an integer hourly price are required.'
    return
  }
  saving.value = true
  error.value = null
  try {
    const api = useApiClient()
    const body = {
      name: name.value.trim(),
      type: type.value,
      capacity: capacity.value,
      hourlyPriceMinor: hourlyPriceMinor.value
    }
    if (editing.value) {
      const updated = await api.request<Resource>(`/resources/${editing.value.id}`, {
        method: 'PATCH',
        body
      })
      Object.assign(editing.value, updated)
      success.value = 'Resource updated.'
    } else {
      items.value.push(await api.request<Resource>('/resources', { method: 'POST', body }))
      success.value = 'Resource created.'
    }
    reset()
  } catch (caught: unknown) {
    error.value = caught instanceof Error ? caught.message : 'Resource could not be saved.'
  } finally {
    saving.value = false
  }
}
async function toggle(item: Resource): Promise<void> {
  saving.value = true
  error.value = null
  try {
    const updated = await useApiClient().request<Resource>(
      `/resources/${item.id}/${item.operationalStatus === 'enabled' ? 'disable' : 'enable'}`,
      { method: 'PATCH' }
    )
    Object.assign(item, updated)
    success.value = `${item.name} is now ${updated.operationalStatus}.`
  } catch (caught: unknown) {
    error.value = caught instanceof Error ? caught.message : 'Resource status could not be changed.'
  } finally {
    saving.value = false
  }
}
onMounted(load)
</script>
<template>
  <main class="mx-auto max-w-6xl px-6 py-10">
    <div class="flex justify-between">
      <h1 class="text-3xl font-bold">Resource management</h1>
      <button class="rounded border px-4" :disabled="loading" @click="load">Refresh</button>
    </div>
    <p v-if="error" class="mt-4 rounded bg-red-50 p-3 text-red-700">{{ error }}</p>
    <p v-if="success" class="mt-4 rounded bg-emerald-50 p-3 text-emerald-700">{{ success }}</p>
    <form class="mt-6 grid gap-3 rounded border p-4 sm:grid-cols-5" @submit.prevent="submit">
      <input v-model="name" class="rounded border p-2" placeholder="Resource name" /><select
        v-model="type"
        class="rounded border p-2"
      >
        <option value="desk">Desk</option>
        <option value="meeting_room">Meeting room</option>
        <option value="private_office">Private office</option></select
      ><input v-model.number="capacity" class="rounded border p-2" type="number" min="1" /><input
        v-model.number="hourlyPriceMinor"
        class="rounded border p-2"
        type="number"
        min="0"
        placeholder="UZS/hour"
      />
      <div class="flex gap-2">
        <button class="rounded bg-indigo-600 px-4 py-2 text-white" :disabled="saving">
          {{ editing ? 'Update' : 'Create' }}</button
        ><button v-if="editing" type="button" class="rounded border px-3" @click="reset">
          Cancel
        </button>
      </div>
    </form>
    <div v-if="loading" class="mt-6 h-32 animate-pulse rounded bg-slate-100" />
    <p v-else-if="!items.length" class="mt-6 rounded border border-dashed p-8 text-center">
      No resources found.
    </p>
    <div v-else class="mt-6 overflow-x-auto rounded border">
      <table class="w-full text-left">
        <thead>
          <tr>
            <th class="p-3">Name</th>
            <th>Type</th>
            <th>Price</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in paginatedItems" :key="item.id" class="border-t">
            <td class="p-3 py-3">{{ item.name }}</td>
            <td>{{ item.type }}</td>
            <td>{{ formatUzs(item.hourlyPriceMinor) }}</td>
            <td>{{ item.operationalStatus }}</td>
            <td class="space-x-3">
              <button class="text-indigo-700" :disabled="saving" @click="edit(item)">Edit</button
              ><button class="text-indigo-700" :disabled="saving" @click="toggle(item)">
                {{ item.operationalStatus === 'enabled' ? 'Disable' : 'Enable' }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <UiPagination v-model:page="page" :total="items.length" :page-size="pageSize" />
    </div>
  </main>
</template>
