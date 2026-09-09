import type { ReservationStatus } from './reservation'

export interface DashboardSummary {
  totalResources: number
  totalReservations: number
  confirmedReservations: number
  successfulPaymentAmountMinor: number
  currency: string
  dateRange: { from: string; to: string }
}

export interface ReservationsByStatusPoint {
  status: ReservationStatus
  count: number
}

export interface SuccessfulPaymentsByDayPoint {
  date: string
  amountMinor: number
  currency: string
}
