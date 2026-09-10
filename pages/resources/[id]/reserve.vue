<script setup lang="ts">
import { useResourceStore } from '~/stores/resource'
import { useReservationsStore } from '~/stores/reservations'
import { useApiClient } from '~/services/api-client'
import type { Resource } from '~/types/resource'

definePageMeta({ layout: 'member' })
const route = useRoute()
const resources = useResourceStore()
const reservations = useReservationsStore()
const resource = ref<Resource | null>(null)
const createdId = ref<string | null>(null)

onMounted(async () => {
  if (!resources.items.length) await resources.fetchResources()
  resource.value = resources.items.find((item: Resource) => item.id === route.params.id) ?? null
  if (!resource.value) resource.value = await useApiClient().request<Resource>(`/resources/${route.params.id}`)
})

async function create(payload: { resourceId: string; startAt: string; endAt: string }): Promise<void> {
  const hold = await reservations.createHold(payload)
  const reservation = await reservations.create({ ...payload, holdKey: hold.holdKey })
  createdId.value = reservation.id
}
</script>

<template>
  <main class="page-wrap max-w-5xl">
    <NuxtLink to="/resources" class="text-sm font-semibold text-indigo-700">Back to catalog</NuxtLink>
    <BookingReservationDrawer v-if="!createdId" :resource="resource" :is-submitting="reservations.isLoading" :request-error="reservations.errorMessage" @submit="create" @close="navigateTo('/resources')" />
    <section v-else class="surface mt-10 p-8"><p class="section-kicker">Booking submitted</p><h1 class="mt-2 text-2xl font-black">Reservation created</h1><p class="mt-2 text-slate-600">{{ reservations.successMessage }}</p><NuxtLink :to="`/reservations/${createdId}/pay`" class="btn-primary mt-5">Continue to payment</NuxtLink></section>
  </main>
</template>
