export const RESOURCE_TYPES = ['desk', 'meeting_room', 'private_office'] as const
export const RESOURCE_OPERATIONAL_STATUSES = ['enabled', 'disabled'] as const

export type ResourceType = (typeof RESOURCE_TYPES)[number]
export type ResourceOperationalStatus = (typeof RESOURCE_OPERATIONAL_STATUSES)[number]

export interface Resource {
  id: string
  name: string
  type: ResourceType
  capacity: number
  hourlyPriceMinor: number
  currency: string
  operationalStatus: ResourceOperationalStatus
  createdAt: string
  updatedAt: string
}
