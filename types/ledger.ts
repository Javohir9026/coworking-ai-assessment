export const LEDGER_ENTRY_TYPES = ['member_charge', 'platform_commission', 'owner_payable'] as const

export type LedgerEntryType = (typeof LEDGER_ENTRY_TYPES)[number]

export interface LedgerEntry {
  id: string
  paymentId: string
  type: LedgerEntryType
  amountMinor: number
  currency: string
  createdAt: string
}
