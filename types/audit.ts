export interface AuditLogEntry {
  id: string
  actorId: string | 'system'
  action: string
  targetType: string
  targetId: string
  metadata: Record<string, unknown>
  before: Record<string, unknown> | null
  after: Record<string, unknown> | null
  createdAt: string
}

export interface AuditLogFilters {
  action?: string
  targetType?: string
}
