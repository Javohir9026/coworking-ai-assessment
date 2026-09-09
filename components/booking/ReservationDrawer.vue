<script setup lang="ts">
import type { Resource } from '~/types/resource'

interface ReservationPayload {
  resourceId: string
  startAt: string
  endAt: string
}

const props = defineProps<{ resource: Resource | null; isSubmitting?: boolean; requestError?: string | null }>()
const emit = defineEmits<{ submit: [payload: ReservationPayload]; close: [] }>()

const startLocal = ref('')
const endLocal = ref('')
const validationMessage = ref<string | null>(null)
const successMessage = ref<string | null>(null)
const remainingSeconds = ref(5 * 60)
let timer: ReturnType<typeof setInterval> | undefined

const estimatedHours = computed(() => {
  if (!startLocal.value || !endLocal.value) return 0
  const durationMs = new Date(endLocal.value).getTime() - new Date(startLocal.value).getTime()
  return durationMs > 0 ? Math.ceil(durationMs / (60 * 60 * 1000)) : 0
})
const estimatedTotalCents = computed(() => (props.resource === null ? 0 : estimatedHours.value * props.resource.hourlyPriceMinor))
const formattedEstimate = computed(() => {
  const amount = estimatedTotalCents.value
  return `$${Math.trunc(amount / 100).toLocaleString('en-US')}.${String(amount % 100).padStart(2, '0')}`
})
const isEmpty = computed(() => props.resource === null)

function submit(): void {
  if (props.resource === null) {
    validationMessage.value = 'Select an active workspace before creating a reservation.'
    return
  }
  if (!startLocal.value || !endLocal.value) {
    validationMessage.value = 'Start and end times are required.'
    return
  }
  const startAt = new Date(startLocal.value)
  const endAt = new Date(endLocal.value)
  if (Number.isNaN(startAt.getTime()) || Number.isNaN(endAt.getTime()) || endAt.getTime() <= startAt.getTime()) {
    validationMessage.value = 'End time must be later than start time.'
    return
  }
  validationMessage.value = null
  successMessage.value = 'Times validated. Sending your reservation request…'
  emit('submit', { resourceId: props.resource.id, startAt: startAt.toISOString(), endAt: endAt.toISOString() })
}

onMounted(() => { timer = setInterval(() => { remainingSeconds.value = Math.max(0, remainingSeconds.value - 1) }, 1000) })
onBeforeUnmount(() => { if (timer) clearInterval(timer) })
</script>

<template>
  <aside class="fixed inset-y-0 right-0 z-30 w-full max-w-md overflow-y-auto bg-white p-6 shadow-2xl" aria-label="Create reservation">
    <div class="flex items-start justify-between gap-4"><div><p class="text-sm font-semibold text-indigo-600">Reservation</p><h2 class="text-xl font-bold text-slate-900">Choose your time</h2></div><button type="button" class="text-slate-500 hover:text-slate-900" @click="emit('close')">Close</button></div>
    <p v-if="isEmpty" class="mt-6 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">No workspace is selected. Return to the catalog to choose an active one.</p>
    <div v-else class="mt-6 rounded-lg bg-indigo-50 p-4"><p class="font-semibold text-indigo-950">{{ resource?.name }}</p><p class="mt-1 text-sm text-indigo-800">Temporary hold: {{ Math.floor(remainingSeconds / 60) }}:{{ String(remainingSeconds % 60).padStart(2, '0') }} remaining</p></div>
    <p v-if="validationMessage" class="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800" role="alert">{{ validationMessage }}</p>
    <p v-if="requestError" class="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">{{ requestError }}</p>
    <p v-if="successMessage" class="mt-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700" role="status">{{ successMessage }}</p>
    <form class="mt-6 space-y-4" @submit.prevent="submit"><label class="block text-sm font-medium text-slate-700">Start time (local)<input v-model="startLocal" type="datetime-local" class="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2"></label><label class="block text-sm font-medium text-slate-700">End time (local)<input v-model="endLocal" type="datetime-local" class="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2"></label><div class="rounded-lg bg-slate-50 p-4 text-sm"><div class="flex justify-between"><span>Billable hours</span><strong>{{ estimatedHours }}</strong></div><div class="mt-2 flex justify-between text-base"><span>Estimated total</span><strong>{{ formattedEstimate }}</strong></div><p class="mt-2 text-xs text-slate-500">Estimate uses whole hours and integer cents. The server price is final.</p></div><button type="submit" class="w-full rounded-lg bg-indigo-600 px-4 py-2.5 font-semibold text-white disabled:bg-indigo-300" :disabled="isSubmitting || isEmpty"><span v-if="isSubmitting">Creating reservation…</span><span v-else>Request reservation</span></button></form>
  </aside>
</template>
