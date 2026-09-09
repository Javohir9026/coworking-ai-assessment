export const USER_ROLES = ['MEMBER', 'ADMIN'] as const

export type UserRole = (typeof USER_ROLES)[number]

export interface User {
  id: string
  email: string
  fullName: string
  role: UserRole
  createdAt: string
  updatedAt: string
}
