<script setup lang="ts">
import { useResourceStore } from '~/stores/resource'
import type { Resource } from '~/types/resource'

definePageMeta({ layout: 'member' })

const resourceStore = useResourceStore()
const validationMessage = ref<string | null>(null)
const successMessage = ref<string | null>(null)

const enabledResources = computed(() => resourceStore.items.filter((resource: Resource) => resource.operationalStatus === 'enabled'))
const disabledResources = computed(() => resourceStore.items.filter((resource: Resource) => resource.operationalStatus === 'disabled'))

function formatCents(amount: number, currency: string): string {
  const absolute = Math.abs(amount)
  const wholeUnits = Math.trunc(absolute / 100).toLocaleString('en-US')
  const cents = String(absolute % 100).padStart(2, '0')
  const prefix = amount < 0 ? '-' : ''
  return currency === 'USD' ? `${prefix}$${wholeUnits}.${cents}` : `${prefix}${currency} ${wholeUnits}.${cents}`
}

function beginReservation(resource: Resource): void {
  if (resource.operationalStatus === 'disabled') {
    validationMessage.value = `${resource.name} is currently disabled and cannot be reserved.`
    successMessage.value = null
    return
  }
  resourceStore.select(resource)
  validationMessage.value = null
  successMessage.value = `${resource.name} selected. Choose your reservation time next.`
  navigateTo(`/resources/${resource.id}/reserve`)
}

onMounted(resourceStore.fetchResources)
</script>

<template>
  <main class="mx-auto max-w-6xl px-6 py-10">
    <header class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p class="text-sm font-semibold text-indigo-600">Member booking</p>
        <h1 class="mt-1 text-3xl font-bold text-slate-900">Find a workspace</h1>
        <p class="mt-2 text-slate-600">All prices are shown per hour. Availability is confirmed by the server when you reserve.</p>
      </div>
      <button type="button" class="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50" :disabled="resourceStore.isLoading" @click="resourceStore.fetchResources">
        Refresh catalog
      </button>
    </header>

    <p v-if="validationMessage" class="mt-6 rounded-lg bg-amber-50 p-3 text-sm text-amber-800" role="alert">{{ validationMessage }}</p>
    <p v-if="successMessage" class="mt-6 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700" role="status">{{ successMessage }}</p>
    <p v-if="resourceStore.errorMessage" class="mt-6 rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">
      {{ resourceStore.errorMessage }} <button type="button" class="ml-2 font-semibold underline" @click="resourceStore.fetchResources">Try again</button>
    </p>

    <section v-if="resourceStore.isLoading" class="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-label="Loading resources">
      <div v-for="skeleton in 6" :key="skeleton" class="h-52 animate-pulse rounded-xl bg-slate-100" />
    </section>

    <section v-else-if="resourceStore.items.length === 0 && !resourceStore.errorMessage" class="mt-8 rounded-xl border border-dashed border-slate-300 p-10 text-center">
      <p class="text-lg font-semibold text-slate-800">No workspaces are available yet</p>
      <p class="mt-2 text-sm text-slate-600">Please check back shortly or ask an administrator to add a resource.</p>
    </section>

    <section v-else class="mt-8">
      <h2 class="text-lg font-bold text-slate-900">Available now</h2>
      <div v-if="enabledResources.length" class="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <article v-for="resource in enabledResources" :key="resource.id" class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div class="flex items-start justify-between gap-3"><h3 class="text-lg font-bold text-slate-900">{{ resource.name }}</h3><span class="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800">Active</span></div>
          <dl class="mt-5 space-y-2 text-sm text-slate-600"><div class="flex justify-between gap-3"><dt>Type</dt><dd class="font-medium text-slate-800">{{ resource.type.replace('_', ' ') }}</dd></div><div class="flex justify-between gap-3"><dt>Capacity</dt><dd class="font-medium text-slate-800">{{ resource.capacity }} people</dd></div></dl>
          <p class="mt-5 text-xl font-bold text-slate-900">{{ formatCents(resource.hourlyPriceMinor, resource.currency) }}<span class="text-sm font-normal text-slate-500"> / hour</span></p>
          <button type="button" class="mt-5 w-full rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-700" @click="beginReservation(resource)">Reserve</button>
        </article>
      </div>

      <div v-if="disabledResources.length" class="mt-8">
        <h2 class="text-lg font-bold text-slate-900">Unavailable workspaces</h2>
        <div class="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <article v-for="resource in disabledResources" :key="resource.id" class="rounded-xl border border-slate-200 bg-slate-50 p-5 opacity-75">
            <div class="flex items-start justify-between gap-3"><h3 class="text-lg font-bold text-slate-700">{{ resource.name }}</h3><span class="rounded-full bg-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700">Disabled</span></div>
            <p class="mt-3 text-sm text-slate-600">{{ resource.type.replace('_', ' ') }} · {{ resource.capacity }} people</p>
            <p class="mt-4 text-lg font-bold text-slate-700">{{ formatCents(resource.hourlyPriceMinor, resource.currency) }} / hour</p>
            <button type="button" disabled class="mt-5 w-full cursor-not-allowed rounded-lg bg-slate-300 px-4 py-2 font-semibold text-slate-600">Reservations unavailable</button>
          </article>
        </div>
      </div>
    </section>
  </main>
</template>
