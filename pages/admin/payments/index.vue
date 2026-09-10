<script setup lang="ts">
import { useApiClient } from '~/services/api-client'
import type { Payment } from '~/types/payment'
definePageMeta({ layout: 'admin' })
const items = ref<Payment[]>([]); const loading = ref(true); const error = ref<string | null>(null)
async function load(): Promise<void> { loading.value = true; error.value = null; try { items.value = await useApiClient().request<Payment[]>('/admin/payments') } catch (caught: unknown) { items.value = []; error.value = caught instanceof Error ? caught.message : 'Payment attempts could not be loaded.' } finally { loading.value = false } }
onMounted(load)
</script>
<template><main class="mx-auto max-w-6xl px-6 py-10"><div class="flex justify-between"><h1 class="text-3xl font-bold">Payment attempts</h1><button class="rounded border px-4" @click="load">Refresh</button></div><p v-if="error" class="mt-4 rounded bg-red-50 p-3 text-red-700">{{ error }}</p><div v-if="loading" class="mt-6 h-32 animate-pulse rounded bg-slate-100"/><p v-else-if="!items.length" class="mt-6 rounded border border-dashed p-8 text-center">No payment attempts yet.</p><table v-else class="mt-6 w-full text-left text-sm"><thead><tr><th>Created</th><th>Status</th><th>Amount</th><th>Provider event</th><th>Processing</th></tr></thead><tbody><tr v-for="payment in items" :key="payment.id" class="border-t"><td class="py-3">{{ new Date(payment.createdAt).toLocaleString() }}</td><td>{{ payment.status }}</td><td>{{ formatUzs(payment.amountMinor) }}</td><td><NuxtLink :to="`/admin/payments/${payment.id}`" class="text-indigo-700">{{ payment.providerEventId }}</NuxtLink></td><td>{{ payment.processingStatus }}</td></tr></tbody></table></main></template>
