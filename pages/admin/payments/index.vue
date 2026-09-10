<script setup lang="ts">
import { useApiClient } from '~/services/api-client'
import type { Payment } from '~/types/payment'
definePageMeta({ layout: 'admin' })
const items = ref<Payment[]>([]); const loading = ref(true); const error = ref<string | null>(null)
async function load(): Promise<void> { loading.value = true; error.value = null; try { items.value = await useApiClient().request<Payment[]>('/admin/payments') } catch (caught: unknown) { error.value = caught instanceof Error ? caught.message : 'Payment attempts could not be loaded.' } finally { loading.value = false } }
onMounted(load)
</script>
<template><main class="page-wrap"><div class="flex justify-between"><h1 class="text-3xl font-black">Payment attempts</h1><button class="btn-secondary" @click="load">Refresh</button></div><p v-if="error" class="mt-4 rounded-xl bg-red-50 p-3 text-red-700">{{ error }}</p><div v-if="loading" class="mt-6 h-32 animate-pulse rounded-2xl bg-slate-200"/><p v-else-if="!items.length" class="surface-muted mt-6 p-8 text-center">No payment attempts yet.</p><div v-else class="table-shell mt-6"><table class="w-full text-left text-sm"><thead class="table-head"><tr><th class="p-3">Created</th><th>Workspace</th><th>Member</th><th>Status</th><th>Amount</th></tr></thead><tbody><tr v-for="payment in items" :key="payment.id" class="border-t"><td class="p-3">{{ new Date(payment.createdAt).toLocaleString() }}</td><td><NuxtLink :to="`/admin/payments/${payment.id}`" class="font-semibold text-indigo-700">{{ payment.resourceName }}</NuxtLink></td><td>{{ payment.memberName }}</td><td><UiStatusBadge :value="payment.status"/></td><td>{{ formatUzs(payment.amountMinor) }}</td></tr></tbody></table></div></main></template>
