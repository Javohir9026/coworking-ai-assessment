<script setup lang="ts">
import { useReservationsStore } from '~/stores/reservations'
import type { Reservation } from '~/types/reservation'

definePageMeta({ layout: 'member' })
const route = useRoute()
const store = useReservationsStore()
const reservation = ref<Reservation | null>(null)
const processing = ref(false)
const error = ref<string | null>(null)

onMounted(async () => {
  try {
    reservation.value = await store.fetchOne(String(route.params.id))
  } catch (caught: unknown) {
    error.value = caught instanceof Error ? caught.message : 'Reservation could not be loaded.'
  }
})
async function simulate(outcome: 'success' | 'failure'): Promise<void> {
  if (!reservation.value) return
  processing.value = true
  error.value = null
  try {
    reservation.value = await store.simulatePayment(
      reservation.value.id,
      outcome === 'success' ? 'success' : 'failed'
    )
  } catch (caught: unknown) {
    error.value = caught instanceof Error ? caught.message : 'Payment simulation failed.'
  } finally {
    processing.value = false
  }
}
</script>

<template>
  <main class="page-wrap max-w-5xl">
    <PaymentSimulatedPaymentModal
      :reservation="reservation"
      :is-processing="processing"
      :error-message="error"
      @simulate="simulate"
      @close="navigateTo('/reservations')"
    />
  </main>
</template>
