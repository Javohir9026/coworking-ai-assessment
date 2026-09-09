<script setup lang="ts">
import type { Reservation } from '~/types/reservation'

type SimulationOutcome = 'success' | 'failure'

const props = defineProps<{ reservation: Reservation | null; isProcessing?: boolean; errorMessage?: string | null }>()
const emit = defineEmits<{ simulate: [outcome: SimulationOutcome]; close: [] }>()

const hasSubmitted = ref(false)
const localSuccess = ref<string | null>(null)
const validationMessage = computed(() => props.reservation === null ? 'Select a reservation to pay.' : props.reservation.status !== 'awaiting_payment' ? 'Payment can only be simulated for reservations awaiting payment.' : null)
const totalCents = computed(() => props.reservation?.totalPriceMinor ?? 0)
const commissionCents = computed(() => Math.trunc(totalCents.value / 10))
const ownerCents = computed(() => totalCents.value - commissionCents.value)
const formatCents = (amount: number): string => `$${Math.trunc(amount / 100).toLocaleString('en-US')}.${String(Math.abs(amount % 100)).padStart(2, '0')}`

function simulate(outcome: SimulationOutcome): void {
  if (validationMessage.value || hasSubmitted.value || props.isProcessing) return
  hasSubmitted.value = true
  localSuccess.value = `Simulated ${outcome} webhook queued. Waiting for server settlement.`
  emit('simulate', outcome)
}
</script>

<template>
  <div class="fixed inset-0 z-40 grid place-items-center bg-slate-950/40 p-4" role="dialog" aria-modal="true" aria-label="Simulate payment">
    <section class="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"><div class="flex justify-between gap-4"><div><p class="text-sm font-semibold text-indigo-600">Simulated payment</p><h2 class="text-xl font-bold text-slate-900">Confirm reservation payment</h2></div><button type="button" class="text-slate-500" @click="emit('close')">Close</button></div>
      <p v-if="validationMessage" class="mt-5 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">{{ validationMessage }}</p>
      <p v-else class="mt-5 text-sm text-slate-600">This sends a deterministic mock webhook. Duplicate button clicks are blocked in the UI; the API remains responsible for idempotency.</p>
      <p v-if="errorMessage" class="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">{{ errorMessage }}</p><p v-if="localSuccess" class="mt-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700" role="status">{{ localSuccess }}</p>
      <dl v-if="reservation" class="mt-5 divide-y rounded-lg border border-slate-200 text-sm"><div class="flex justify-between p-3"><dt>Total charge</dt><dd class="font-semibold">{{ formatCents(totalCents) }}</dd></div><div class="flex justify-between p-3"><dt>Platform commission (10%)</dt><dd>{{ formatCents(commissionCents) }}</dd></div><div class="flex justify-between p-3"><dt>Owner payable (90%)</dt><dd>{{ formatCents(ownerCents) }}</dd></div></dl>
      <div class="mt-6 grid gap-3 sm:grid-cols-2"><button type="button" class="rounded-lg bg-emerald-600 px-4 py-2.5 font-semibold text-white disabled:bg-emerald-300" :disabled="Boolean(validationMessage) || hasSubmitted || isProcessing" @click="simulate('success')">{{ isProcessing ? 'Processing…' : 'Trigger Success Webhook' }}</button><button type="button" class="rounded-lg bg-rose-600 px-4 py-2.5 font-semibold text-white disabled:bg-rose-300" :disabled="Boolean(validationMessage) || hasSubmitted || isProcessing" @click="simulate('failure')">Trigger Failure Webhook</button></div>
    </section>
  </div>
</template>
