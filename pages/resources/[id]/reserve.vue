<script setup lang="ts">
import { useResourceStore } from '~/stores/resource'
import { useReservationsStore } from '~/stores/reservations'
import { useApiClient } from '~/services/api-client'
import type { Resource } from '~/types/resource'
import type { Reservation } from '~/types/reservation'

definePageMeta({ layout: 'member' })
const route = useRoute()
const resources = useResourceStore()
const reservations = useReservationsStore()
const resource = ref<Resource | null>(null)
const createdId = ref<string | null>(null)
const createdReservation = ref<Reservation | null>(null)
const refreshingStatus = ref(false)
const canContinueToPayment = computed(() => createdReservation.value?.status === 'awaiting_payment')
let statusTimer: ReturnType<typeof setInterval> | null = null

onMounted(async () => {
  if (!resources.items.length) await resources.fetchResources()
  resource.value = resources.items.find((item: Resource) => item.id === route.params.id) ?? null
  if (!resource.value)
    resource.value = await useApiClient().request<Resource>(`/resources/${route.params.id}`)
})

async function create(payload: {
  resourceId: string
  startAt: string
  endAt: string
}): Promise<void> {
  try {
    const hold = await reservations.createHold(payload)
    const reservation = await reservations.create({ ...payload, holdKey: hold.holdKey })
    createdId.value = reservation.id
    createdReservation.value = reservation
    statusTimer = setInterval(refreshStatus, 10_000)
  } catch {
    // The store exposes a safe, user-facing error message in the reservation drawer.
  }
}

async function refreshStatus(): Promise<void> {
  if (!createdId.value) return
  refreshingStatus.value = true
  try {
    createdReservation.value = await reservations.fetchOne(createdId.value)
  } finally {
    refreshingStatus.value = false
  }
}

onUnmounted(() => {
  if (statusTimer) clearInterval(statusTimer)
})
</script>

<template>
  <main class="page-wrap max-w-5xl">
    <NuxtLink to="/resources" class="text-sm font-semibold text-indigo-700"
      >Back to catalog</NuxtLink
    >
    <BookingReservationDrawer
      v-if="!createdId"
      :resource="resource"
      :is-submitting="reservations.isLoading"
      :request-error="reservations.errorMessage"
      @submit="create"
      @close="navigateTo('/resources')"
    />
    <section v-else class="surface mt-10 p-8">
      <p class="section-kicker">Booking submitted</p>
      <h1 class="mt-2 text-2xl font-black">Reservation created</h1>
      <p class="mt-2 text-slate-600">{{ reservations.successMessage }}</p>

      <div v-if="canContinueToPayment" class="mt-5">
        <p class="mb-3 text-sm text-emerald-700">
          Your reservation has been approved. You can continue to payment.
        </p>
        <NuxtLink :to="`/reservations/${createdId}/pay`" class="btn-primary"
          >Continue to payment</NuxtLink
        >
      </div>
      <div v-else class="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
        <p class="font-semibold text-amber-900">Waiting for administrator approval</p>
        <p class="mt-1 text-sm text-amber-800">
          Payment becomes available after an administrator approves this reservation. This page
          checks the status automatically.
        </p>
        <button class="btn-primary mt-4 cursor-not-allowed opacity-50" type="button" disabled>
          Continue to payment
        </button>
        <button
          class="ml-3 text-sm font-semibold text-indigo-700 disabled:opacity-50"
          type="button"
          :disabled="refreshingStatus"
          @click="refreshStatus"
        >
          {{ refreshingStatus ? 'Checking…' : 'Check status' }}
        </button>
      </div>
    </section>
  </main>
</template>
