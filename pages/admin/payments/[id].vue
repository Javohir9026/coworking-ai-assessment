<script setup lang="ts">
import { useApiClient } from '~/services/api-client'
import type { LedgerEntry } from '~/types/ledger'
import type { Payment } from '~/types/payment'

definePageMeta({ layout: 'admin' })
const route = useRoute(); const payment = ref<Payment | null>(null); const ledger = ref<LedgerEntry[]>([]); const error = ref<string | null>(null)
onMounted(async () => { try { const api = useApiClient(); const [payments, entries] = await Promise.all([api.request<Payment[]>('/admin/payments'), api.request<LedgerEntry[]>('/admin/ledger')]); payment.value = payments.find((item) => item.id === route.params.id) ?? null; ledger.value = entries.filter((entry) => entry.paymentId === route.params.id); if (!payment.value) error.value = 'Payment was not found.' } catch (caught: unknown) { error.value = caught instanceof Error ? caught.message : 'Payment could not be loaded.' } })
</script>
<template><main class="mx-auto max-w-4xl px-6 py-10"><NuxtLink to="/admin/payments" class="text-indigo-700">← Payments</NuxtLink><p v-if="error" class="mt-5 rounded bg-red-50 p-3 text-red-700">{{ error }}</p><div v-else-if="!payment" class="mt-5 h-40 animate-pulse rounded bg-slate-100"/><article v-else class="mt-5 rounded border p-6"><h1 class="text-2xl font-bold">Payment {{ payment.id }}</h1><dl class="mt-4 space-y-2"><div>Status: {{ payment.status }}</div><div>Amount: {{ formatUzs(payment.amountMinor) }}</div><div>Provider event: {{ payment.providerEventId }}</div><div>Processing: {{ payment.processingStatus }}</div></dl><h2 class="mt-6 font-bold">Immutable ledger entries</h2><p v-if="!ledger.length" class="mt-2 text-slate-600">No ledger entries for this payment.</p><ul v-else class="mt-2 space-y-2"><li v-for="entry in ledger" :key="entry.id">{{ entry.type }}: {{ formatUzs(entry.amountMinor) }}</li></ul></article></main></template>
