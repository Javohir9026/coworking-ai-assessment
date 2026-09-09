<script setup lang="ts">
import { useReservationsStore } from '~/stores/reservations'
import type { Reservation } from '~/types/reservation'
definePageMeta({ layout: 'member' }); const route = useRoute(); const store = useReservationsStore(); const reservation = ref<Reservation | null>(null); const processing = ref(false); const error = ref<string | null>(null)
onMounted(async () => { if (!store.items.length) await store.fetchMine(); reservation.value = store.items.find((item: Reservation) => item.id === route.params.id) ?? null })
function simulate(outcome: 'success' | 'failure'): void { processing.value = true; error.value = null; setTimeout(() => { if (outcome === 'success' && reservation.value) { store.markPaid(reservation.value.id); reservation.value.status = 'confirmed' } else error.value = 'Mock payment failed. You can try again.'; processing.value = false }, 500) }
</script>
<template><main class="mx-auto max-w-5xl px-6 py-10"><SimulatedPaymentModal :reservation="reservation" :is-processing="processing" :error-message="error" @simulate="simulate" @close="navigateTo('/reservations')"/></main></template>
