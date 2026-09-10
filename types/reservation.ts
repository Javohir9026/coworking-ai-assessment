export const RESERVATION_STATUSES = [
  'pending',
  'approved',
  'awaiting_payment',
  'confirmed',
  'rejected',
  'cancelled',
  'expired'
] as const

export type ReservationStatus = (typeof RESERVATION_STATUSES)[number]

export const RESERVATION_STATUS_TRANSITIONS: Readonly<
  Record<ReservationStatus, readonly ReservationStatus[]>
> = {
  pending: ['approved', 'rejected', 'cancelled', 'expired'],
  approved: ['awaiting_payment', 'cancelled', 'expired'],
  awaiting_payment: ['confirmed', 'cancelled', 'expired'],
  confirmed: [],
  rejected: [],
  cancelled: [],
  expired: []
}

export interface ReservationStatusHistoryEntry {
  id: string
  fromStatus: ReservationStatus | null
  toStatus: ReservationStatus
  reason: string | null
  actorId: string | 'system'
  createdAt: string
}

export interface Reservation {
  id: string
  resourceId: string
  memberId: string
  resourceName: string
  memberName: string
  memberEmail: string | null
  startAt: string
  endAt: string
  status: ReservationStatus
  totalPriceMinor: number
  currency: string
  rejectionReason: string | null
  createdAt: string
  updatedAt: string
  statusHistory: ReservationStatusHistoryEntry[]
}
