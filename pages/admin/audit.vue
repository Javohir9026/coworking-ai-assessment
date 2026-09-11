<script setup lang="ts">
import { useApiClient } from '~/services/api-client'
import type { AuditLogEntry } from '~/types/audit'
import type { PaginatedResult } from '~/types/api'
import type { LedgerEntry } from '~/types/ledger'
definePageMeta({ layout: 'admin' })
const logs = ref<AuditLogEntry[]>([])
const ledger = ref<LedgerEntry[]>([])
const action = ref('')
const targetType = ref('')
const loading = ref(true)
const error = ref<string | null>(null)
const selectedLog = ref<AuditLogEntry | null>(null)
let filterTimer: ReturnType<typeof setTimeout> | undefined
const logMeta = ref({ total: 0, page: 1, pageSize: 10 })
const ledgerMeta = ref({ total: 0, page: 1, pageSize: 10 })
async function loadLogs(page = logMeta.value.page) {
  loading.value = true
  try {
    const result = await useApiClient().request<PaginatedResult<AuditLogEntry>>(
      '/admin/audit-logs',
      {
        query: {
          page,
          pageSize: logMeta.value.pageSize,
          ...(action.value ? { action: action.value } : {}),
          ...(targetType.value ? { targetType: targetType.value } : {})
        }
      }
    )
    logs.value = result.items
    logMeta.value = result.meta
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'Audit records could not be loaded.'
  } finally {
    loading.value = false
  }
}
async function loadLedger(page = ledgerMeta.value.page) {
  try {
    const result = await useApiClient().request<PaginatedResult<LedgerEntry>>('/admin/ledger', {
      query: { page, pageSize: ledgerMeta.value.pageSize }
    })
    ledger.value = result.items
    ledgerMeta.value = result.meta
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'Ledger could not be loaded.'
  }
}
async function refresh() {
  await Promise.all([loadLogs(1), loadLedger(1)])
}
function csvCell(value: string): string {
  return `"${value.replaceAll('"', '""')}"`
}
function exportLogs(): void {
  const header = ['Timestamp', 'Actor', 'Action', 'Target type', 'Target', 'Metadata', 'Before', 'After']
  const rows = logs.value.map((log: AuditLogEntry) => [
    log.createdAt,
    log.actorName,
    log.action,
    log.targetType,
    log.targetName,
    JSON.stringify(log.metadata),
    JSON.stringify(log.before),
    JSON.stringify(log.after)
  ])
  const csv = [header, ...rows].map((row) => row.map(csvCell).join(',')).join('\n')
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url
  link.download = 'audit-logs.csv'
  link.click()
  URL.revokeObjectURL(url)
}
function pretty(value: Record<string, unknown> | null): string {
  return value === null ? 'No value recorded.' : JSON.stringify(value, null, 2)
}
function scheduleFilter(): void {
  if (filterTimer) clearTimeout(filterTimer)
  filterTimer = setTimeout(() => void loadLogs(1), 250)
}
watch([action, targetType], scheduleFilter)
onMounted(refresh)
onBeforeUnmount(() => {
  if (filterTimer) clearTimeout(filterTimer)
})
</script>
<template>
  <main class="page-wrap">
    <h1 class="text-3xl font-black">Ledger & audit trail</h1>
    <div class="mt-5 flex flex-wrap gap-3">
      <input v-model="action" class="field max-w-xs" placeholder="Filter action" /><input
        v-model="targetType"
        class="field max-w-xs"
        placeholder="Filter target type"
      />
      <button class="btn-secondary" :disabled="!logs.length" @click="exportLogs">Export visible CSV</button>
    </div>
    <p v-if="error" class="mt-4 rounded-xl bg-red-50 p-3 text-red-700">{{ error }}</p>
    <div v-if="loading" class="mt-6 h-32 animate-pulse rounded-2xl bg-slate-200" />
    <template v-else
      ><section class="table-shell mt-6">
        <h2 class="border-b p-4 font-bold">Audit logs</h2>
        <table class="w-full text-left text-sm">
          <tbody>
            <tr v-if="!logs.length">
              <td colspan="5" class="p-8 text-center text-slate-600">
                No audit records match these filters.
              </td>
            </tr>
            <tr v-for="log in logs" :key="log.id" class="border-t">
              <td class="p-3">{{ new Date(log.createdAt).toLocaleString() }}</td>
              <td>{{ log.actorName }}</td>
              <td>{{ log.action }}</td>
              <td>{{ log.targetName }}</td>
              <td class="p-2 text-right">
                <button class="text-sm font-semibold text-indigo-700" @click="selectedLog = log">Details</button>
              </td>
            </tr>
          </tbody>
        </table>
        <UiPagination
          :page="logMeta.page"
          :total="logMeta.total"
          :page-size="logMeta.pageSize"
          @update:page="loadLogs"
        />
      </section>
      <section class="table-shell mt-6">
        <h2 class="border-b p-4 font-bold">Financial ledger</h2>
        <table class="w-full text-left text-sm">
          <tbody>
            <tr v-if="!ledger.length">
              <td colspan="4" class="p-8 text-center text-slate-600">
                No successful payment entries yet.
              </td>
            </tr>
            <tr v-for="entry in ledger" :key="entry.id" class="border-t">
              <td class="p-3 capitalize">{{ entry.type.replaceAll('_', ' ') }}</td>
              <td>{{ formatUzs(entry.amountMinor) }}</td>
              <td>{{ entry.paymentName }}</td>
              <td>{{ entry.memberName }}</td>
            </tr>
          </tbody>
        </table>
        <UiPagination
          :page="ledgerMeta.page"
          :total="ledgerMeta.total"
          :page-size="ledgerMeta.pageSize"
          @update:page="loadLedger"
        /></section
    ></template>
    <div v-if="selectedLog" class="fixed inset-0 z-30 grid place-items-center bg-slate-950/40 p-4">
      <section class="surface max-h-[90vh] w-full max-w-3xl overflow-y-auto p-6" role="dialog" aria-modal="true">
        <div class="flex items-center justify-between gap-4">
          <div>
            <p class="section-kicker">Audit record</p>
            <h2 class="mt-1 text-xl font-black">{{ selectedLog.action }}</h2>
          </div>
          <button class="btn-secondary" @click="selectedLog = null">Close</button>
        </div>
        <dl class="mt-5 grid gap-3 text-sm sm:grid-cols-2">
          <div><dt class="text-slate-500">Actor</dt><dd>{{ selectedLog.actorName }}</dd></div>
          <div><dt class="text-slate-500">Target</dt><dd>{{ selectedLog.targetType }}: {{ selectedLog.targetName }}</dd></div>
        </dl>
        <h3 class="mt-6 font-bold">Metadata</h3>
        <pre class="mt-2 overflow-x-auto rounded bg-slate-950 p-3 text-xs text-slate-100">{{ pretty(selectedLog.metadata) }}</pre>
        <div class="mt-5 grid gap-5 md:grid-cols-2">
          <div><h3 class="font-bold">Before</h3><pre class="mt-2 overflow-x-auto rounded bg-slate-100 p-3 text-xs">{{ pretty(selectedLog.before) }}</pre></div>
          <div><h3 class="font-bold">After</h3><pre class="mt-2 overflow-x-auto rounded bg-slate-100 p-3 text-xs">{{ pretty(selectedLog.after) }}</pre></div>
        </div>
      </section>
    </div>
  </main>
</template>
