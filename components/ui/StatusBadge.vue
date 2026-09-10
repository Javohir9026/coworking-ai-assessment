<script setup lang="ts">
const props = defineProps<{ value: string }>()

const tone = computed(() => {
  if (['confirmed', 'success', 'enabled'].includes(props.value)) return 'bg-emerald-100 text-emerald-800 ring-emerald-600/20'
  if (['awaiting_payment', 'pending', 'approved'].includes(props.value)) return 'bg-amber-100 text-amber-800 ring-amber-600/20'
  if (['rejected', 'failed', 'disabled', 'cancelled', 'expired'].includes(props.value)) return 'bg-rose-100 text-rose-800 ring-rose-600/20'
  return 'bg-slate-100 text-slate-700 ring-slate-600/20'
})

const label = computed(() => props.value.replaceAll('_', ' '))
</script>

<template>
  <span :class="['inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold capitalize ring-1 ring-inset', tone]">
    {{ label }}
  </span>
</template>
