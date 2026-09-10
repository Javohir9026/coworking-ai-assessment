<script setup lang="ts">
import { useApiClient } from '~/services/api-client'
import type { Reservation } from '~/types/reservation'

definePageMeta({ layout: 'admin' })
const route = useRoute()
const item = ref<Reservation | null>(null)
const error = ref<string | null>(null)
onMounted(async () => { try { item.value = await useApiClient().request<Reservation>(`/reservations/${route.params.id}`) } catch (caught: unknown) { error.value = caught instanceof Error ? caught.message : 'Reservation could not be loaded.' } })
</script>

<template><main class="page-wrap max-w-4xl"><NuxtLink to="/admin/reservations" class="text-sm font-semibold text-indigo-700">Back to bookings</NuxtLink><p v-if="error" class="mt-5 rounded-xl bg-red-50 p-3 text-red-700">{{ error }}</p><div v-else-if="!item" class="mt-5 h-40 animate-pulse rounded-2xl bg-slate-200"/><article v-else class="surface mt-5 p-6"><p class="section-kicker">Reservation details</p><h1 class="mt-2 text-2xl font-black">{{ item.resourceName }}</h1><p class="mt-2 text-slate-600">Booked by {{ item.memberName }}<span v-if="item.memberEmail"> · {{ item.memberEmail }}</span></p><div class="mt-5"><UiStatusBadge :value="item.status" /></div><h2 class="mt-7 font-bold">Status history</h2><ul class="mt-3 space-y-3"><li v-for="entry in item.statusHistory" :key="entry.id" class="rounded-xl bg-slate-50 p-3 text-sm">{{ entry.fromStatus ?? 'created' }} → {{ entry.toStatus }} · {{ new Date(entry.createdAt).toLocaleString() }}<span v-if="entry.reason"> — {{ entry.reason }}</span></li></ul></article></main></template>
