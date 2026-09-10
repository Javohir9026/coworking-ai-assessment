<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  page: number
  total: number
  pageSize: number
}>()

const emit = defineEmits<{
  (e: 'update:page', page: number): void
}>()

const totalPages = computed(() => Math.ceil(props.total / props.pageSize) || 1)

function prev() {
  if (props.page > 1) emit('update:page', props.page - 1)
}

function next() {
  if (props.page < totalPages.value) emit('update:page', props.page + 1)
}
</script>

<template>
  <div class="flex items-center justify-between border-t border-slate-200 px-4 py-3 sm:px-6 mt-4">
    <div class="flex flex-1 justify-between sm:hidden">
      <button @click="prev" :disabled="page <= 1" class="relative inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed">Previous</button>
      <button @click="next" :disabled="page >= totalPages" class="relative ml-3 inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed">Next</button>
    </div>
    <div class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
      <div>
        <p class="text-sm text-slate-700">
          Showing <span class="font-medium">{{ Math.min((page - 1) * pageSize + 1, total) || 0 }}</span> to <span class="font-medium">{{ Math.min(page * pageSize, total) || 0 }}</span> of <span class="font-medium">{{ total }}</span> results
        </p>
      </div>
      <div>
        <nav class="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
          <button @click="prev" :disabled="page <= 1" class="relative inline-flex items-center rounded-l-md px-2 py-2 text-slate-400 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed">
            <span class="sr-only">Previous</span>
            <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fill-rule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clip-rule="evenodd" />
            </svg>
          </button>
          <span class="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-slate-900 ring-1 ring-inset ring-slate-300 focus:z-20 focus:outline-offset-0">
            Page {{ page }} of {{ totalPages }}
          </span>
          <button @click="next" :disabled="page >= totalPages" class="relative inline-flex items-center rounded-r-md px-2 py-2 text-slate-400 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed">
            <span class="sr-only">Next</span>
            <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clip-rule="evenodd" />
            </svg>
          </button>
        </nav>
      </div>
    </div>
  </div>
</template>

