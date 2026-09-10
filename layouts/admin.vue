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
    <header class="sticky top-0 z-20 border-b border-slate-800 bg-slate-950 text-white shadow-lg shadow-slate-950/20">
      <nav class="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <NuxtLink to="/admin/dashboard" class="flex items-center gap-2 font-black tracking-tight"><span class="grid h-8 w-8 place-items-center rounded-xl bg-indigo-500 text-sm">C</span>Operations</NuxtLink>
        <div class="flex flex-wrap items-center gap-1 text-sm">
          <NuxtLink to="/admin/dashboard" class="rounded-lg px-3 py-2 font-medium text-slate-300 transition hover:bg-white/10 hover:text-white">Overview</NuxtLink>
          <NuxtLink to="/admin/resources" class="rounded-lg px-3 py-2 font-medium text-slate-300 transition hover:bg-white/10 hover:text-white">Spaces</NuxtLink>
          <NuxtLink to="/admin/reservations" class="rounded-lg px-3 py-2 font-medium text-slate-300 transition hover:bg-white/10 hover:text-white">Bookings</NuxtLink>
          <NuxtLink to="/admin/payments" class="rounded-lg px-3 py-2 font-medium text-slate-300 transition hover:bg-white/10 hover:text-white">Payments</NuxtLink>
          <NuxtLink to="/admin/audit" class="rounded-lg px-3 py-2 font-medium text-slate-300 transition hover:bg-white/10 hover:text-white">Audit</NuxtLink>
          <button type="button" class="ml-1 rounded-lg border border-slate-700 px-3 py-2 font-medium text-slate-200 transition hover:bg-white/10" @click="logout">Sign out</button>
        </div>
      </nav>
    </header>
    <slot />
  </div>
</template>
