<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

const auth = useAuthStore()
async function logout(): Promise<void> {
  auth.clearSession()
  await navigateTo('/login')
}
</script>

<template>
  <div class="app-shell">
    <header class="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <nav
        class="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8"
      >
        <NuxtLink
          to="/resources"
          class="flex items-center gap-2 font-black tracking-tight text-slate-950"
          ><span class="grid h-8 w-8 place-items-center rounded-xl bg-indigo-600 text-sm text-white"
            >C</span
          >Coworking</NuxtLink
        >
        <div class="flex flex-wrap items-center gap-1 text-sm">
          <NuxtLink
            to="/resources"
            class="rounded-lg px-3 py-2 font-medium text-slate-600 transition hover:bg-indigo-50 hover:text-indigo-700"
            >Spaces</NuxtLink
          >
          <NuxtLink
            to="/reservations"
            class="rounded-lg px-3 py-2 font-medium text-slate-600 transition hover:bg-indigo-50 hover:text-indigo-700"
            >My bookings</NuxtLink
          >
          <button type="button" class="btn-secondary ml-1 px-3 py-2" @click="logout">
            Sign out
          </button>
        </div>
      </nav>
    </header>
    <slot />
  </div>
</template>
