<script setup lang="ts">
import { useReservationsStore } from '~/stores/reservations'
import type { Reservation } from '~/types/reservation'
definePageMeta({ layout: 'member' })
const store = useReservationsStore()
const page = ref(1)
const items = computed(() => store.items)
const cancellingId = ref<string | null>(null)
const error = ref<string | null>(null)
const cancelTarget = ref<{ id: string; resourceName: string } | null>(null)
const rejectedTarget = ref<Reservation | null>(null)
function changePage(nextPage: number): void {
  page.value = nextPage
  store.fetchMine(nextPage)
}
async function cancelReservation(): Promise<void> {
  if (!cancelTarget.value) return
  const reservationId = cancelTarget.value.id
  cancellingId.value = reservationId
  error.value = null
  try {
    await store.cancelReservation(reservationId)
    cancelTarget.value = null
  } catch (caught: unknown) {
    error.value = caught instanceof Error ? caught.message : 'Reservation could not be cancelled.'
  } finally {
    cancellingId.value = null
  }
}
onMounted(() => store.fetchMine(page.value))
</script>
<template>
  <main class="page-wrap max-w-5xl">
    <div class="flex justify-between gap-4">
      <div>
        <p class="section-kicker">Member area</p>
        <h1 class="mt-1 text-3xl font-black">My bookings</h1>
      </div>
      <NuxtLink class="btn-primary" to="/resources">Book a workspace</NuxtLink>
    </div>
    <p v-if="store.errorMessage" class="mt-4 rounded-xl bg-red-50 p-3 text-red-700">
      {{ store.errorMessage }}
    </p>
    <p v-if="error" class="mt-4 rounded-xl bg-red-50 p-3 text-red-700">{{ error }}</p>
    <p v-if="store.successMessage" class="mt-4 rounded-xl bg-emerald-50 p-3 text-emerald-700">
      {{ store.successMessage }}
    </p>
    <div v-if="store.isLoading" class="mt-6 h-32 animate-pulse rounded-2xl bg-slate-200" />
    <p v-else-if="!store.items.length" class="surface-muted mt-6 p-8 text-center">
      You have no reservations yet.
    </p>
    <div v-else class="mt-6 space-y-3">
      <article
        v-for="item in items"
        :key="item.id"
        class="surface flex flex-wrap items-center justify-between gap-4 p-5"
      >
        <div>
          <h2 class="font-bold">{{ item.resourceName }}</h2>
          <p class="mt-1 text-sm text-slate-600">
            {{ new Date(item.startAt).toLocaleString() }} —
            {{ new Date(item.endAt).toLocaleString() }}
          </p>
        </div>
        <div class="flex items-center gap-3">
          <UiStatusBadge :value="item.status" /><strong>{{
            formatUzs(item.totalPriceMinor)
          }}</strong
          ><NuxtLink
            v-if="item.status === 'awaiting_payment'"
            :to="`/reservations/${item.id}/pay`"
            class="btn-primary"
            >Pay now</NuxtLink
          >
          <button
            v-if="['pending', 'approved', 'awaiting_payment'].includes(item.status)"
            class="btn-secondary"
            :disabled="cancellingId === item.id"
            type="button"
            aria-label="Cancel booking"
            @click="cancelTarget = { id: item.id, resourceName: item.resourceName }"
          >
            {{ cancellingId === item.id ? 'Cancelling…' : 'Cancel' }}
          </button>
          <span v-else-if="item.status === 'confirmed'" class="text-xs text-slate-500">
            Confirmed bookings cannot be cancelled online.
          </span>
          <button
            v-if="item.status === 'rejected'"
            class="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-rose-200 text-rose-700 transition hover:bg-rose-50"
            type="button"
            :aria-label="`View rejection reason for ${item.resourceName}`"
            :title="`View rejection reason for ${item.resourceName}`"
            @click="rejectedTarget = item"
          >
            <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
              <circle cx="12" cy="12" r="2.5" />
            </svg>
          </button>
        </div>
      </article>
      <UiPagination
        :page="store.meta.page"
        :total="store.meta.total"
        :page-size="store.meta.pageSize"
        @update:page="changePage"
      />
    </div>
    <div v-if="cancelTarget" class="fixed inset-0 z-30 grid place-items-center bg-slate-950/40 p-4">
      <section
        class="surface w-full max-w-md p-6"
        role="dialog"
        aria-modal="true"
        aria-label="Cancel booking"
      >
        <p class="section-kicker">Cancel booking</p>
        <h2 class="mt-2 text-xl font-black">Cancel {{ cancelTarget.resourceName }}?</h2>
        <p class="mt-3 text-sm text-slate-600">
          This cannot be undone. The selected workspace becomes available for a new reservation.
        </p>
        <div class="mt-6 flex justify-end gap-3">
          <button class="btn-secondary" :disabled="Boolean(cancellingId)" @click="cancelTarget = null">
            Keep booking
          </button>
          <button
            class="btn-primary bg-rose-600 hover:bg-rose-700"
            :disabled="Boolean(cancellingId)"
            @click="cancelReservation"
          >
            Cancel booking
          </button>
        </div>
      </section>
    </div>
    <div v-if="rejectedTarget" class="fixed inset-0 z-30 grid place-items-center bg-slate-950/40 p-4">
      <section
        class="surface w-full max-w-md p-6"
        role="dialog"
        aria-modal="true"
        aria-label="Rejection reason"
      >
        <p class="section-kicker text-rose-600">Booking rejected</p>
        <h2 class="mt-2 text-xl font-black">{{ rejectedTarget.resourceName }}</h2>
        <div class="mt-5 rounded-xl border border-rose-100 bg-rose-50 p-4">
          <p class="text-xs font-bold uppercase tracking-wide text-rose-700">Administrator reason</p>
          <p class="mt-2 text-sm leading-6 text-rose-950">
            {{ rejectedTarget.rejectionReason || 'No additional reason was provided.' }}
          </p>
        </div>
        <button class="btn-secondary mt-6 w-full" @click="rejectedTarget = null">Close</button>
      </section>
    </div>
  </main>
</template>
