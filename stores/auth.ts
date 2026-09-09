import { defineStore } from 'pinia'
import { useApiClient } from '~/services/api-client'
import type { User, UserRole } from '~/types/user'

interface LoginResponse {
  accessToken: string
  user: User
}

interface LoginPayload {
  email: string
  password: string
}

export const useAuthStore = defineStore('auth', () => {
  const tokenCookie = useCookie<string | null>('coworking_access_token', {
    sameSite: 'lax',
    default: () => null
  })
  const userCookie = useCookie<User | null>('coworking_user', {
    sameSite: 'lax',
    default: () => null
  })

  const accessToken = computed(() => tokenCookie.value)
  const user = computed(() => userCookie.value)
  const isLoading = ref(false)
  const errorMessage = ref<string | null>(null)
  const isAuthenticated = computed(() => accessToken.value !== null && user.value !== null)
  const isAdministrator = computed(() => user.value?.role === 'ADMIN')

  async function login(payload: LoginPayload): Promise<void> {
    isLoading.value = true
    errorMessage.value = null
    try {
      const api = useApiClient()
      const response = await api.request<LoginResponse>('/auth/login', {
        method: 'POST',
        body: payload
      })
      tokenCookie.value = response.accessToken
      userCookie.value = response.user
    } catch (error: unknown) {
      errorMessage.value = error instanceof Error ? error.message : 'Login failed. Please try again.'
      throw error
    } finally {
      isLoading.value = false
    }
  }

  function setSession(accessTokenValue: string, currentUser: User): void {
    tokenCookie.value = accessTokenValue
    userCookie.value = currentUser
  }

  function clearSession(): void {
    tokenCookie.value = null
    userCookie.value = null
    errorMessage.value = null
  }

  function hasRole(role: UserRole): boolean {
    return user.value?.role === role
  }

  return {
    accessToken,
    user,
    isLoading,
    errorMessage,
    isAuthenticated,
    isAdministrator,
    login,
    setSession,
    clearSession,
    hasRole
  }
})
