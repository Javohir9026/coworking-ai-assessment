import { defineStore } from 'pinia'
import type { LedgerEntry } from '~/types/ledger'
import type { Payment } from '~/types/payment'

interface PaymentsState {
  items: Payment[]
  selected: Payment | null
  ledgerEntries: LedgerEntry[]
}

export const usePaymentsStore = defineStore('payments', {
  state: (): PaymentsState => ({ items: [], selected: null, ledgerEntries: [] })
})
