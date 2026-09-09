import { defineStore } from 'pinia'
import type { AuditLogEntry, AuditLogFilters } from '~/types/audit'

interface AuditState {
  entries: AuditLogEntry[]
  filters: AuditLogFilters
}

export const useAuditStore = defineStore('audit', {
  state: (): AuditState => ({ entries: [], filters: {} })
})
