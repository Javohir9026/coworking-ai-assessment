<script setup lang="ts">
type ActionName = 'approve' | 'disable' | 'edit' | 'reject'

withDefaults(
  defineProps<{
    action: ActionName
    label: string
    disabled?: boolean
  }>(),
  { disabled: false }
)

defineEmits<{ click: [] }>()

const tone = {
  approve: 'text-emerald-700 hover:bg-emerald-50 focus:ring-emerald-200',
  disable: 'text-rose-700 hover:bg-rose-50 focus:ring-rose-200',
  edit: 'text-indigo-700 hover:bg-indigo-50 focus:ring-indigo-200',
  reject: 'text-rose-700 hover:bg-rose-50 focus:ring-rose-200'
} as const
</script>

<template>
  <button
    type="button"
    :title="label"
    :aria-label="label"
    :disabled="disabled"
    class="inline-flex h-9 w-9 items-center justify-center rounded-lg transition focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-40"
    :class="tone[action]"
    @click="$emit('click')"
  >
    <svg
      v-if="action === 'edit'"
      class="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      aria-hidden="true"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M16.86 3.49a2.1 2.1 0 0 1 2.97 2.97L8.1 18.2 3 19.5l1.3-5.1L16.86 3.49Z"
      />
      <path stroke-linecap="round" d="m14.5 5.85 3.65 3.65" />
    </svg>
    <svg
      v-else-if="action === 'approve'"
      class="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      aria-hidden="true"
    >
      <path stroke-linecap="round" stroke-linejoin="round" d="m5 12 4.2 4.2L19 6.5" />
    </svg>
    <svg
      v-else-if="action === 'reject'"
      class="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      aria-hidden="true"
    >
      <path stroke-linecap="round" d="m6 6 12 12M18 6 6 18" />
    </svg>
    <svg
      v-else
      class="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="8" />
      <path stroke-linecap="round" d="m8 8 8 8" />
    </svg>
  </button>
</template>
