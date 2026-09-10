<script setup lang="ts">
import { useApiClient } from '~/services/api-client'
import type { PaginatedResult } from '~/types/api'
import type { Payment } from '~/types/payment'
definePageMeta({ layout: 'admin' })
const items = ref<Payment[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const meta = ref({ total: 0, page: 1, pageSize: 10 })
async function load(page = meta.value.page) {
  loading.value = true
  try {
    const result = await useApiClient().request<PaginatedResult<Payment>>('/admin/payments', {
      query: { page, pageSize: meta.value.pageSize }
    })
    items.value = result.items
    meta.value = result.meta
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'Payment attempts could not be loaded.'
  } finally {
    loading.value = false
  }
}
onMounted(load)
</script>
<template>
  <main class="page-wrap">
    <div class="flex justify-between">
      <h1 class="text-3xl font-black">Payment attempts</h1>
      <button class="btn-secondary" @click="load()">Refresh</button>
    </div>
    <p v-if="error" class="mt-4 rounded-xl bg-red-50 p-3 text-red-700">{{ error }}</p>
    <div v-if="loading" class="mt-6 h-32 animate-pulse rounded-2xl bg-slate-200" />
    <div v-else class="table-shell mt-6">
      <table class="w-full text-left text-sm">
        <thead class="table-head">
          <tr>
            <th class="p-3">Created</th>
            <th>Workspace</th>
            <th>Member</th>
            <th>Status</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!items.length">
            <td colspan="5" class="p-8 text-center text-slate-600">No payment attempts yet.</td>
          </tr>
          <tr v-for="payment in items" :key="payment.id" class="border-t">
            <td class="p-3">{{ new Date(payment.createdAt).toLocaleString() }}</td>
            <td>
              <NuxtLink
                :to="`/admin/payments/${payment.id}`"
                class="font-semibold text-indigo-700"
                >{{ payment.resourceName }}</NuxtLink
              >
            </td>
            <td>{{ payment.memberName }}</td>
            <td><UiStatusBadge :value="payment.status" /></td>
            <td>{{ formatUzs(payment.amountMinor) }}</td>
          </tr>
        </tbody>
      </table>
      <UiPagination
        :page="meta.page"
        :total="meta.total"
        :page-size="meta.pageSize"
        @update:page="load"
      />
    </div>
  </main>
</template>
