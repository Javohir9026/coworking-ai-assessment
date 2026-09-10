export default defineNuxtConfig({
  compatibilityDate: '2026-09-09',
  devtools: { enabled: true },
  modules: ['@pinia/nuxt', '@nuxt/eslint', '@nuxtjs/tailwindcss'],
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    public: {
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3000/api',
      paymentPollingIntervalMs: Number(process.env.NUXT_PUBLIC_PAYMENT_POLLING_INTERVAL_MS ?? 3000),
      appName: process.env.NUXT_PUBLIC_APP_NAME ?? 'Coworking Reservation'
    }
  },
  typescript: {
    strict: true,
    typeCheck: true
  }
})
