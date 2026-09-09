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
      <nav class="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <NuxtLink to="/resources" class="font-bold text-slate-900">Coworking</NuxtLink>
        <div class="flex items-center gap-4 text-sm">
          <NuxtLink to="/resources" class="text-slate-600 hover:text-indigo-700">Resources</NuxtLink>
          <NuxtLink to="/reservations" class="text-slate-600 hover:text-indigo-700">My reservations</NuxtLink>
          <button type="button" class="rounded-lg border border-slate-300 px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-50" @click="logout">Logout</button>
        </div>
      </nav>
    </header>
    <slot />
  </div>
</template>
