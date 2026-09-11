<script setup lang="ts">
interface Option {
  label: string
  value: string
}

const props = defineProps<{
  modelValue: string
  options: readonly Option[]
  label: string
}>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const open = ref(false)
const root = ref<HTMLElement | null>(null)
const selected = computed(() => props.options.find((option) => option.value === props.modelValue))

function choose(value: string): void {
  emit('update:modelValue', value)
  open.value = false
}
function onDocumentPointerDown(event: PointerEvent): void {
  if (root.value && !root.value.contains(event.target as Node)) open.value = false
}
function onEscape(event: KeyboardEvent): void {
  if (event.key === 'Escape') open.value = false
}

onMounted(() => {
  document.addEventListener('pointerdown', onDocumentPointerDown)
  document.addEventListener('keydown', onEscape)
})
onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onDocumentPointerDown)
  document.removeEventListener('keydown', onEscape)
})
</script>

<template>
  <div ref="root" class="relative">
    <button
      :aria-expanded="open"
      :aria-label="props.label"
      class="flex w-full items-center justify-between rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-left text-sm font-semibold text-slate-700 shadow-sm transition hover:border-indigo-300 focus:border-indigo-500"
      type="button"
      @click="open = !open"
    >
      <span>{{ selected?.label }}</span>
      <svg
        :class="['h-4 w-4 fill-none stroke-indigo-600 stroke-2 transition-transform', open ? 'rotate-180' : '']"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </button>
    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="-translate-y-1 opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="translate-y-0 opacity-100"
      leave-to-class="-translate-y-1 opacity-0"
    >
      <div v-if="open" class="absolute z-30 mt-2 w-full overflow-hidden rounded-xl border border-indigo-100 bg-white p-1 shadow-xl shadow-slate-900/15">
        <button
          v-for="option in options"
          :key="option.value"
          :class="[
            'flex w-full items-center rounded-lg px-3 py-2.5 text-left text-sm font-medium transition',
            option.value === modelValue
              ? 'bg-indigo-600 text-white'
              : 'text-slate-700 hover:bg-indigo-50 hover:text-indigo-800'
          ]"
          type="button"
          @click="choose(option.value)"
        >
          {{ option.label }}
        </button>
      </div>
    </Transition>
  </div>
</template>
