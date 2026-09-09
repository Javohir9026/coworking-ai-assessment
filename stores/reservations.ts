import { defineStore } from 'pinia'
import { useApiClient } from '~/services/api-client'
import { mockReservations } from '~/services/mock-data'
import type { Reservation } from '~/types/reservation'

interface CreateReservationPayload { resourceId: string; startAt: string; endAt: string; totalPriceMinor: number; currency: string }

export const useReservationsStore = defineStore('reservations', () => {
  const items = ref<Reservation[]>([])
  const isLoading = ref(false); const errorMessage = ref<string | null>(null); const successMessage = ref<string | null>(null)
  async function fetchMine(): Promise<void> { isLoading.value = true; errorMessage.value = null; try { items.value = await useApiClient().request<Reservation[]>('/reservations') } catch { items.value = [...mockReservations]; successMessage.value = 'Showing local mock reservations because the API is unavailable.' } finally { isLoading.value = false } }
  async function create(payload: CreateReservationPayload): Promise<Reservation> { isLoading.value = true; errorMessage.value = null; try { const item = await useApiClient().request<Reservation>('/reservations', { method: 'POST', body: payload }); items.value.unshift(item); return item } catch { const item: Reservation = { id: `mock-res-${Date.now()}`, resourceId: payload.resourceId, memberId: 'usr-member-demo', startAt: payload.startAt, endAt: payload.endAt, status: 'awaiting_payment', totalPriceMinor: payload.totalPriceMinor, currency: payload.currency, rejectionReason: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), statusHistory: [] }; items.value.unshift(item); successMessage.value = 'Mock reservation created and ready for simulated payment.'; return item } finally { isLoading.value = false } }
  function markPaid(id: string): void { const item = items.value.find((entry: Reservation) => entry.id === id); if (item) { item.status = 'confirmed'; item.updatedAt = new Date().toISOString() }; successMessage.value = 'Mock payment succeeded; reservation confirmed.' }
  return { items, isLoading, errorMessage, successMessage, fetchMine, create, markPaid }
})
