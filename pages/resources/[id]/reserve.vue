<script setup lang="ts">
import { useResourceStore } from '~/stores/resource'
import { useReservationsStore } from '~/stores/reservations'
import type { Resource } from '~/types/resource'
definePageMeta({ layout: 'member' })
const route = useRoute(); const resources = useResourceStore(); const reservations = useReservationsStore(); const resource = ref<Resource | null>(null); const createdId = ref<string | null>(null)
onMounted(async () => { if (!resources.items.length) await resources.fetchResources(); resource.value = resources.items.find((item: Resource) => item.id === route.params.id) ?? null })
async function create(payload: { resourceId: string; startAt: string; endAt: string }): Promise<void> { const hold = await reservations.createHold(payload); const reservation = await reservations.create({ ...payload, holdKey: hold.holdKey }); createdId.value = reservation.id }
</script>
<template><main class="mx-auto max-w-5xl px-6 py-10"><NuxtLink to="/resources" class="text-indigo-700">← Back to catalog</NuxtLink><ReservationDrawer v-if="!createdId" :resource="resource" :is-submitting="reservations.isLoading" :request-error="reservations.errorMessage" @submit="create" @close="navigateTo('/resources')" /><section v-else class="mt-10 rounded-xl border p-8"><h1 class="text-2xl font-bold">Reservation created</h1><p class="mt-2">{{ reservations.successMessage }}</p><NuxtLink :to="`/reservations/${createdId}/pay`" class="mt-5 inline-block rounded bg-indigo-600 px-4 py-2 text-white">Continue to payment</NuxtLink></section></main></template>
