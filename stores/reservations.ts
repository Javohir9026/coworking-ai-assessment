import { defineStore } from 'pinia'
import type { Reservation } from '~/types/reservation'

interface ReservationsState {
  items: Reservation[]
  selected: Reservation | null
}

export const useReservationsStore = defineStore('reservations', {
  state: (): ReservationsState => ({ items: [], selected: null })
})
