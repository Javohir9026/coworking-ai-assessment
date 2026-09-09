import type { AuditLogEntry } from '~/types/audit'
import type { DashboardSummary, ReservationsByStatusPoint, SuccessfulPaymentsByDayPoint } from '~/types/dashboard'
import type { LedgerEntry } from '~/types/ledger'
import type { Reservation } from '~/types/reservation'
import type { Resource } from '~/types/resource'
import type { User } from '~/types/user'

const now = '2026-09-10T08:00:00.000Z'
export const mockUsers: Record<'member' | 'admin', User> = {
  member: { id: 'usr-member-demo', email: 'member@coworking.test', fullName: 'Mock Member', role: 'MEMBER', createdAt: now, updatedAt: now },
  admin: { id: 'usr-admin-demo', email: 'admin@coworking.test', fullName: 'Mock Administrator', role: 'ADMIN', createdAt: now, updatedAt: now }
}
export const mockResources: Resource[] = [
  { id: 'desk-1', name: 'Focus Desk A1', type: 'desk', capacity: 1, hourlyPriceMinor: 1200, currency: 'USD', operationalStatus: 'enabled', createdAt: now, updatedAt: now },
  { id: 'room-1', name: 'Orion Meeting Room', type: 'meeting_room', capacity: 8, hourlyPriceMinor: 4500, currency: 'USD', operationalStatus: 'enabled', createdAt: now, updatedAt: now },
  { id: 'office-1', name: 'Private Office North', type: 'private_office', capacity: 4, hourlyPriceMinor: 6000, currency: 'USD', operationalStatus: 'enabled', createdAt: now, updatedAt: now },
  { id: 'desk-2', name: 'Window Desk B4', type: 'desk', capacity: 1, hourlyPriceMinor: 1500, currency: 'USD', operationalStatus: 'disabled', createdAt: now, updatedAt: now }
]
export const mockReservations: Reservation[] = [{ id: 'res-demo-1', resourceId: 'room-1', memberId: 'usr-member-demo', startAt: '2026-09-12T09:00:00.000Z', endAt: '2026-09-12T11:00:00.000Z', status: 'pending', totalPriceMinor: 9000, currency: 'USD', rejectionReason: null, createdAt: now, updatedAt: now, statusHistory: [] }]
export const mockDashboard: DashboardSummary = { totalResources: 4, totalReservations: 1, confirmedReservations: 0, successfulPaymentAmountMinor: 0, currency: 'USD', dateRange: { from: '2026-09-01T00:00:00.000Z', to: '2026-09-30T23:59:59.999Z' } }
export const mockStatusPoints: ReservationsByStatusPoint[] = [{ status: 'pending', count: 1 }]
export const mockPaymentPoints: SuccessfulPaymentsByDayPoint[] = []
export const mockAuditLogs: AuditLogEntry[] = [{ id: 'audit-demo-1', actorId: 'usr-admin-demo', action: 'RESOURCE_CREATED', targetType: 'resource', targetId: 'room-1', metadata: { source: 'mock' }, before: null, after: { operationalStatus: 'enabled' }, createdAt: now }]
export const mockLedger: LedgerEntry[] = []
