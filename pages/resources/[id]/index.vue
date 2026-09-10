<script setup lang="ts">
import { useApiClient } from '~/services/api-client'
import type { Resource } from '~/types/resource'
definePageMeta({ layout: 'member' })
const route = useRoute(); const item = ref<Resource | null>(null); const error = ref<string | null>(null)
onMounted(async () => { try { item.value = await useApiClient().request<Resource>(`/resources/${route.params.id}`) } catch (caught: unknown) { error.value = caught instanceof Error ? caught.message : 'Resource could not be loaded.' } })
</script>
<template><main class="mx-auto max-w-3xl px-6 py-10"><NuxtLink to="/resources" class="text-indigo-700">← Catalog</NuxtLink><p v-if="error" class="mt-5 rounded bg-red-50 p-3 text-red-700">{{ error }}</p><div v-else-if="!item" class="mt-5 h-40 animate-pulse rounded bg-slate-100"/><article v-else class="mt-5 rounded-xl border p-6"><h1 class="text-3xl font-bold">{{ item.name }}</h1><dl class="mt-5 space-y-2"><div>Type: {{ item.type }}</div><div>Capacity: {{ item.capacity }}</div><div>Price: {{ formatUzs(item.hourlyPriceMinor) }} / hour</div><div>Status: {{ item.operationalStatus }}</div></dl><NuxtLink v-if="item.operationalStatus === 'enabled'" :to="`/resources/${item.id}/reserve`" class="mt-6 inline-block rounded bg-indigo-600 px-4 py-2 text-white">Reserve</NuxtLink></article></main></template>
