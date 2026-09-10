<script setup lang="ts">
import { useApiClient } from '~/services/api-client'
import type { Resource } from '~/types/resource'

definePageMeta({ layout: 'member' })
const route = useRoute()
const item = ref<Resource | null>(null)
const error = ref<string | null>(null)

onMounted(async () => {
  try { item.value = await useApiClient().request<Resource>(`/resources/${route.params.id}`) }
  catch (caught: unknown) { error.value = caught instanceof Error ? caught.message : 'Resource could not be loaded.' }
})
</script>

<template>
  <main class="page-wrap max-w-4xl">
    <NuxtLink to="/resources" class="text-sm font-semibold text-indigo-700 hover:text-indigo-900">← Back to spaces</NuxtLink>
    <p v-if="error" class="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">{{ error }}</p>
    <div v-else-if="!item" class="mt-5 h-72 animate-pulse rounded-2xl bg-slate-200" />
    <article v-else class="surface mt-5 overflow-hidden">
      <div class="bg-gradient-to-br from-indigo-600 to-violet-700 p-7 text-white sm:p-10">
        <UiStatusBadge :value="item.operationalStatus" />
        <h1 class="mt-5 text-3xl font-black tracking-tight sm:text-4xl">{{ item.name }}</h1>
        <p class="mt-3 max-w-xl text-indigo-100">A focused, comfortable workspace for your next productive session.</p>
      </div>
      <div class="grid gap-6 p-7 sm:grid-cols-3 sm:p-10">
        <div><p class="section-kicker">Workspace type</p><p class="mt-2 font-bold capitalize">{{ item.type.replace('_', ' ') }}</p></div>
        <div><p class="section-kicker">Capacity</p><p class="mt-2 font-bold">{{ item.capacity }} {{ item.capacity === 1 ? 'person' : 'people' }}</p></div>
        <div><p class="section-kicker">Hourly price</p><p class="mt-2 text-xl font-black">{{ formatUzs(item.hourlyPriceMinor) }}</p></div>
      </div>
      <div class="border-t border-slate-200 bg-slate-50 p-6 sm:px-10"><NuxtLink v-if="item.operationalStatus === 'enabled'" :to="`/resources/${item.id}/reserve`" class="btn-primary w-full sm:w-auto">Choose reservation time</NuxtLink><p v-else class="font-medium text-slate-500">This space is temporarily unavailable for new reservations.</p></div>
    </article>
  </main>
</template>
