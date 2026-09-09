import { defineStore } from 'pinia'
import type { User } from '~/types/user'

interface AuthState {
  accessToken: string | null
  user: User | null
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({ accessToken: null, user: null }),
  getters: {
    isAuthenticated: (state): boolean => state.accessToken !== null,
    isAdministrator: (state): boolean => state.user?.role === 'administrator'
  }
})
