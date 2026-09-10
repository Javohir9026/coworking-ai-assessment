<script setup lang="ts">
import { useApiClient } from '~/services/api-client'
import type { Reservation } from '~/types/reservation'
definePageMeta({ layout: 'admin' })
const route = useRoute(); const item = ref<Reservation | null>(null); const error = ref<string | null>(null)
onMounted(async () => { try { item.value = await useApiClient().request<Reservation>(`/reservations/${route.params.id}`) } catch (caught: unknown) { error.value = caught instanceof Error ? caught.message : 'Reservation could not be loaded.' } })
</script>
<template><main class="mx-auto max-w-4xl px-6 py-10"><NuxtLink to="/admin/reservations" class="text-indigo-700">← Reservations</NuxtLink><p v-if="error" class="mt-5 rounded bg-red-50 p-3 text-red-700">{{ error }}</p><div v-else-if="!item" class="mt-5 h-40 animate-pulse rounded bg-slate-100"/><article v-else class="mt-5 rounded border p-6"><h1 class="text-2xl font-bold">Reservation {{ item.id }}</h1><p class="mt-2">Status: {{ item.status }}</p><h2 class="mt-6 font-bold">Status history</h2><ul class="mt-2 space-y-2"><li v-for="entry in item.statusHistory" :key="entry.id">{{ entry.fromStatus ?? 'created' }} → {{ entry.toStatus }} · {{ new Date(entry.createdAt).toLocaleString() }}<span v-if="entry.reason"> — {{ entry.reason }}</span></li></ul></article></main></template>
