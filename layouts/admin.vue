<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

const auth = useAuthStore()
async function logout(): Promise<void> {
  auth.clearSession()
  await navigateTo('/login')
}
</script>

<template>
  <div class="min-h-screen bg-slate-50">
    <header class="border-b bg-white">
      <nav class="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-4">
        <NuxtLink to="/admin/dashboard" class="font-bold text-slate-900">Coworking Admin</NuxtLink>
        <div class="flex flex-wrap items-center gap-3 text-sm">
          <NuxtLink to="/admin/dashboard" class="text-slate-600 hover:text-indigo-700">Dashboard</NuxtLink>
          <NuxtLink to="/admin/resources" class="text-slate-600 hover:text-indigo-700">Resources</NuxtLink>
          <NuxtLink to="/admin/reservations" class="text-slate-600 hover:text-indigo-700">Reservations</NuxtLink>
          <NuxtLink to="/admin/payments" class="text-slate-600 hover:text-indigo-700">Payments</NuxtLink>
          <NuxtLink to="/admin/audit" class="text-slate-600 hover:text-indigo-700">Audit & ledger</NuxtLink>
          <button type="button" class="rounded-lg border border-slate-300 px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-50" @click="logout">Logout</button>
        </div>
      </nav>
    </header>
    <slot />
  </div>
</template>
