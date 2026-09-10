<script setup lang="ts">
import { useApiClient } from '~/services/api-client'
import type { LedgerEntry } from '~/types/ledger'
import type { Payment } from '~/types/payment'
import type { PaginatedResult } from '~/types/api'

definePageMeta({ layout: 'admin' })
const route = useRoute()
const payment = ref<Payment | null>(null)
const ledger = ref<LedgerEntry[]>([])
const error = ref<string | null>(null)
onMounted(async () => {
  try {
    const api = useApiClient()
    const [payments, entries] = await Promise.all([
      api.request<PaginatedResult<Payment>>('/admin/payments', {
        query: { page: 1, pageSize: 100 }
      }),
      api.request<PaginatedResult<LedgerEntry>>('/admin/ledger', {
        query: { page: 1, pageSize: 100 }
      })
    ])
    payment.value = payments.items.find((item) => item.id === route.params.id) ?? null
    ledger.value = entries.items.filter((entry) => entry.paymentId === route.params.id)
    if (!payment.value) error.value = 'Payment was not found.'
  } catch (caught: unknown) {
    error.value = caught instanceof Error ? caught.message : 'Payment could not be loaded.'
  }
})
</script>

<template>
  <main class="page-wrap max-w-4xl">
    <NuxtLink to="/admin/payments" class="text-sm font-semibold text-indigo-700"
      >Back to payments</NuxtLink
    >
    <p v-if="error" class="mt-5 rounded-xl bg-red-50 p-3 text-red-700">{{ error }}</p>
    <div v-else-if="!payment" class="mt-5 h-40 animate-pulse rounded-2xl bg-slate-200" />
    <article v-else class="surface mt-5 p-6">
      <p class="section-kicker">Payment details</p>
      <h1 class="mt-2 text-2xl font-black">{{ payment.resourceName }}</h1>
      <p class="mt-2 text-slate-600">Member: {{ payment.memberName }}</p>
      <dl class="mt-5 grid gap-3 sm:grid-cols-3">
        <div>
          <dt class="text-sm text-slate-500">Status</dt>
          <dd class="mt-1"><UiStatusBadge :value="payment.status" /></dd>
        </div>
        <div>
          <dt class="text-sm text-slate-500">Amount</dt>
          <dd class="mt-1 font-bold">{{ formatUzs(payment.amountMinor) }}</dd>
        </div>
        <div>
          <dt class="text-sm text-slate-500">Processing</dt>
          <dd class="mt-1 font-bold capitalize">{{ payment.processingStatus }}</dd>
        </div>
      </dl>
      <h2 class="mt-7 font-bold">Immutable ledger entries</h2>
      <ul v-if="ledger.length" class="mt-3 space-y-2">
        <li v-for="entry in ledger" :key="entry.id" class="rounded-xl bg-slate-50 p-3">
          <span class="capitalize">{{ entry.type.replaceAll('_', ' ') }}</span
          ><strong class="float-right">{{ formatUzs(entry.amountMinor) }}</strong>
        </li>
      </ul>
      <p v-else class="mt-3 text-slate-600">No ledger entries for this payment.</p>
    </article>
  </main>
</template>
