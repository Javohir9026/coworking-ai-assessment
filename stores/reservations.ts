import { defineStore } from 'pinia'
import { useApiClient } from '~/services/api-client'
import type { Reservation } from '~/types/reservation'

interface CreateReservationPayload { resourceId: string; startAt: string; endAt: string }

export const useReservationsStore = defineStore('reservations', () => {
  const items = ref<Reservation[]>([])
  const isLoading = ref(false); const errorMessage = ref<string | null>(null); const successMessage = ref<string | null>(null)
  async function fetchMine(): Promise<void> { isLoading.value = true; errorMessage.value = null; try { items.value = await useApiClient().request<Reservation[]>('/reservations') } catch (error: unknown) { items.value = []; errorMessage.value = error instanceof Error ? error.message : 'Reservations could not be loaded.' } finally { isLoading.value = false } }
  async function fetchOne(id: string): Promise<Reservation> { return useApiClient().request<Reservation>(`/reservations/${id}`) }
  async function create(payload: CreateReservationPayload): Promise<Reservation> { isLoading.value = true; errorMessage.value = null; try { const item = await useApiClient().request<Reservation>('/reservations', { method: 'POST', body: payload }); items.value.unshift(item); successMessage.value = 'Reservation request created. Await administrator approval.'; return item } catch (error: unknown) { errorMessage.value = error instanceof Error ? error.message : 'Reservation could not be created.'; throw error } finally { isLoading.value = false } }
  async function simulatePayment(reservationId: string, outcome: 'success' | 'failed'): Promise<Reservation> { const result = await useApiClient().request<{ reservation: Reservation }>('/payments/simulate', { method: 'POST', body: { reservationId, outcome } }); const index = items.value.findIndex((entry: Reservation) => entry.id === reservationId); if (index >= 0) items.value[index] = result.reservation; return result.reservation }
  return { items, isLoading, errorMessage, successMessage, fetchMine, fetchOne, create, simulatePayment }
})
