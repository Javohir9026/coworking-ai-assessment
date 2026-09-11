<script setup lang="ts">
import { useApiClient } from '~/services/api-client'
import type {
  DashboardSummary,
  ReservationsByStatusPoint,
  SuccessfulPaymentsByDayPoint
} from '~/types/dashboard'

definePageMeta({ layout: 'admin' })

const summary = ref<DashboardSummary | null>(null)
const statusPoints = ref<ReservationsByStatusPoint[]>([])
const paymentPoints = ref<SuccessfulPaymentsByDayPoint[]>([])
const from = ref('')
const to = ref('')
const loading = ref(true)
const error = ref<string | null>(null)
let filterTimer: ReturnType<typeof setTimeout> | undefined
const maxStatusCount = computed(() =>
  Math.max(1, ...statusPoints.value.map((point: ReservationsByStatusPoint) => point.count))
)
const maxPaymentAmount = computed(() =>
  Math.max(1, ...paymentPoints.value.map((point: SuccessfulPaymentsByDayPoint) => point.amountMinor))
)

function query(): string {
  if (!from.value && !to.value) return ''
  if (!from.value || !to.value) throw new Error('Choose both range dates or clear both fields.')
  if (from.value > to.value) throw new Error('The start date must not be after the end date.')
  return `?from=${encodeURIComponent(from.value)}&to=${encodeURIComponent(to.value)}`
}

async function refresh(): Promise<void> {
  loading.value = true
  error.value = null
  try {
    const api = useApiClient()
    const suffix = query()
    const [a, b, c] = await Promise.all([
      api.request<DashboardSummary>(`/admin/dashboard${suffix}`),
      api.request<ReservationsByStatusPoint[]>(`/admin/dashboard/reservations-by-status${suffix}`),
      api.request<SuccessfulPaymentsByDayPoint[]>(`/admin/dashboard/payments-by-day${suffix}`)
    ])
    summary.value = a
    statusPoints.value = b
    paymentPoints.value = c
  } catch (caught: unknown) {
    summary.value = null
    error.value = caught instanceof Error ? caught.message : 'Dashboard could not be loaded.'
  } finally {
    loading.value = false
  }
}
function scheduleRefresh(): void {
  if (filterTimer) clearTimeout(filterTimer)
  if ((from.value && !to.value) || (!from.value && to.value)) return
  filterTimer = setTimeout(() => void refresh(), 250)
}
function setDateRange(days: number | null): void {
  if (days === null) {
    from.value = ''
    to.value = ''
    return
  }
  const end = new Date()
  const start = new Date(end)
  start.setDate(end.getDate() - (days - 1))
  const asInputDate = (value: Date) => value.toISOString().slice(0, 10)
  from.value = asInputDate(start)
  to.value = asInputDate(end)
}
watch([from, to], scheduleRefresh)
onMounted(refresh)
onBeforeUnmount(() => {
  if (filterTimer) clearTimeout(filterTimer)
})
</script>

<template>
  <main class="mx-auto max-w-6xl px-6 py-10">
    <header class="flex flex-wrap items-center justify-between gap-4">
      <h1 class="text-3xl font-bold">Operations dashboard</h1>
      <div class="surface flex flex-wrap items-end gap-3 p-3">
        <label class="text-sm font-semibold text-slate-700">From
          <span class="date-field"><input v-model="from" type="date" aria-label="From" /></span>
        </label>
        <label class="text-sm font-semibold text-slate-700">To
          <span class="date-field"><input v-model="to" type="date" aria-label="To" /></span>
        </label>
        <div class="flex flex-wrap gap-1" aria-label="Quick date filters">
          <button class="filter-chip" type="button" @click="setDateRange(7)">7 days</button>
          <button class="filter-chip" type="button" @click="setDateRange(30)">30 days</button>
          <button class="filter-chip" type="button" @click="setDateRange(null)">All time</button>
        </div>
      </div>
    </header>
    <p v-if="error" class="mt-5 rounded bg-red-50 p-3 text-red-700">{{ error }}</p>
    <div v-if="loading" class="mt-8 h-32 animate-pulse rounded bg-slate-100" />
    <template v-else-if="summary">
      <p class="mt-5 text-sm text-slate-600">
        Range:
        {{
          summary.dateRange.from === 'all'
            ? 'All recorded data'
            : `${summary.dateRange.from} – ${summary.dateRange.to}`
        }}
      </p>
      <section class="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <article
          v-for="metric in [
            { label: 'Resources', value: summary.totalResources },
            { label: 'Reservations', value: summary.totalReservations },
            { label: 'Confirmed', value: summary.confirmedReservations },
            { label: 'Revenue', value: formatUzs(summary.successfulPaymentAmountMinor) }
          ]"
          :key="metric.label"
          class="rounded border p-5"
        >
          <p>{{ metric.label }}</p>
          <strong class="text-2xl">{{ metric.value }}</strong>
        </article>
      </section>
      <section class="mt-8 grid gap-6 lg:grid-cols-2">
        <article class="surface p-5">
          <div class="flex items-center justify-between"><h2 class="font-bold">Reservations by status</h2><span class="text-xs text-slate-500">Live totals</span></div>
          <div class="mt-6 space-y-4">
            <div v-for="point in statusPoints" :key="point.status" class="grid grid-cols-[115px_1fr_auto] items-center gap-3 text-sm">
              <span class="capitalize text-slate-600">{{ point.status.replace('_', ' ') }}</span>
              <div class="h-2.5 overflow-hidden rounded-full bg-slate-100"><div class="h-full rounded-full bg-indigo-600 transition-all duration-500" :style="{ width: `${(point.count / maxStatusCount) * 100}%` }" /></div>
              <strong>{{ point.count }}</strong>
            </div>
          </div>
        </article>
        <article class="surface p-5">
          <div class="flex items-center justify-between"><h2 class="font-bold">Successful payments by day</h2><span class="text-xs text-slate-500">UZS</span></div>
          <p v-if="!paymentPoints.length">No successful payments in range.</p>
          <div v-else class="mt-6 flex h-52 items-end gap-3 border-b border-slate-200 px-2">
            <div v-for="point in paymentPoints" :key="point.date" class="flex h-full min-w-12 flex-1 flex-col justify-end text-center">
              <span class="mb-2 text-xs font-semibold text-emerald-700">{{ formatUzs(point.amountMinor) }}</span>
              <div class="rounded-t-lg bg-emerald-500 transition-all duration-500" :style="{ height: `${Math.max(6, (point.amountMinor / maxPaymentAmount) * 100)}%` }" />
              <span class="mt-2 whitespace-nowrap text-[11px] text-slate-500">{{ point.date.slice(5) }}</span>
            </div>
          </div>
        </article>
      </section>
    </template>
  </main>
</template>
