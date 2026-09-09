import { defineStore } from 'pinia'
import type {
  DashboardSummary,
  ReservationsByStatusPoint,
  SuccessfulPaymentsByDayPoint
} from '~/types/dashboard'

interface DashboardState {
  summary: DashboardSummary | null
  reservationsByStatus: ReservationsByStatusPoint[]
  successfulPaymentsByDay: SuccessfulPaymentsByDayPoint[]
}

export const useDashboardStore = defineStore('dashboard', {
  state: (): DashboardState => ({
    summary: null,
    reservationsByStatus: [],
    successfulPaymentsByDay: []
  })
})
