<script setup lang="ts">
import { useReservationsStore } from '~/stores/reservations'
definePageMeta({ layout: 'member' })
const store = useReservationsStore()
const page = ref(1)
const items = computed(() => store.items)
function changePage(nextPage: number): void {
  page.value = nextPage
  store.fetchMine(nextPage)
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
        </div>
      </article>
      <UiPagination
        :page="store.meta.page"
        :total="store.meta.total"
        :page-size="store.meta.pageSize"
        @update:page="changePage"
      />
    </div>
  </main>
</template>
