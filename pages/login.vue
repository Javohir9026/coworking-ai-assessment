<script setup lang="ts">
import { z } from 'zod'

definePageMeta({ layout: 'default' })

const auth = useAuthStore()
const email = ref('')
const password = ref('')
const validationError = ref<string | null>(null)
const successMessage = ref<string | null>(null)
const submitted = ref(false)

const credentialsSchema = z.object({
  email: z.string().email('Enter a valid email address.'),
  password: z.string().min(1, 'Password is required.')
})

const demoUsers = [
  { label: 'Member demo', email: 'member@cowork.uz', password: 'DemoPass123!' },
  { label: 'Admin demo', email: 'admin@cowork.uz', password: 'DemoPass123!' }
] as const

const isEmpty = computed(() => !submitted.value && email.value.length === 0 && password.value.length === 0)

function fillDemoAccount(account: (typeof demoUsers)[number]): void {
  email.value = account.email
  password.value = account.password
  validationError.value = null
}

async function submit(): Promise<void> {
  submitted.value = true
  successMessage.value = null
  const parsed = credentialsSchema.safeParse({ email: email.value, password: password.value })
  if (!parsed.success) {
    validationError.value = parsed.error.issues[0]?.message ?? 'Check the form fields.'
    return
  }

  validationError.value = null
  try {
    await auth.login(parsed.data)
    successMessage.value = 'Signed in successfully. Redirecting…'
    await navigateTo(auth.isAdministrator ? '/admin/dashboard' : '/resources')
  } catch {
    // The store supplies a user-safe error message for the failure state.
  }
}
</script>

<template>
  <main class="mx-auto flex min-h-screen max-w-md items-center px-6 py-12">
    <section class="w-full rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
      <p class="text-sm font-semibold text-indigo-600">Coworking reservation</p>
      <h1 class="mt-2 text-2xl font-bold text-slate-900">Sign in</h1>
      <p class="mt-2 text-sm text-slate-600">Use a seeded assessment account or enter credentials.</p>

      <div class="mt-5 flex gap-2">
        <button v-for="account in demoUsers" :key="account.email" type="button" class="rounded-lg border border-indigo-200 px-3 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-50" @click="fillDemoAccount(account)">
          {{ account.label }}
        </button>
      </div>

      <p v-if="isEmpty" class="mt-4 rounded-lg bg-slate-50 p-3 text-sm text-slate-600" role="status">
        Choose a demo account or enter credentials to begin.
      </p>
      <p v-if="validationError" class="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800" role="alert">{{ validationError }}</p>
      <p v-if="auth.errorMessage" class="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">{{ auth.errorMessage }}</p>
      <p v-if="successMessage" class="mt-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700" role="status">{{ successMessage }}</p>

      <form class="mt-5 space-y-4" @submit.prevent="submit">
        <label class="block text-sm font-medium text-slate-700">Email
          <input v-model.trim="email" type="email" autocomplete="email" class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" :aria-invalid="Boolean(validationError)">
        </label>
        <label class="block text-sm font-medium text-slate-700">Password
          <input v-model="password" type="password" autocomplete="current-password" class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" :aria-invalid="Boolean(validationError)">
        </label>
        <button type="submit" class="w-full rounded-lg bg-indigo-600 px-4 py-2.5 font-semibold text-white disabled:cursor-not-allowed disabled:bg-indigo-300" :disabled="auth.isLoading">
          <span v-if="auth.isLoading">Signing in…</span><span v-else>Sign in</span>
        </button>
      </form>
    </section>
  </main>
</template>
