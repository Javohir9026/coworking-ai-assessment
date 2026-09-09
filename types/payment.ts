export const PAYMENT_STATUSES = ['pending', 'succeeded', 'failed'] as const
export const PAYMENT_PROCESSING_STATUSES = ['received', 'processed', 'ignored', 'failed'] as const

export type PaymentStatus = (typeof PAYMENT_STATUSES)[number]
export type PaymentProcessingStatus = (typeof PAYMENT_PROCESSING_STATUSES)[number]

export interface Payment {
  id: string
  reservationId: string
  amountMinor: number
  currency: string
  status: PaymentStatus
  providerEventId: string | null
  processingStatus: PaymentProcessingStatus
  createdAt: string
  updatedAt: string
}
