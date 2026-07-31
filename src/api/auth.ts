import { apiClient } from './client'
import type { LoginResponse, ModuleMenuItem, User } from '../types'

export interface LoginRequest {
  email: string
  password: string
}

export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  return apiClient<LoginResponse>('/api/v1/auth/login', {
    method: 'POST',
    body: credentials,
  })
}

export async function logout(): Promise<void> {
  await apiClient<void>('/api/v1/auth/logout', { method: 'POST' })
}

export async function getMe(): Promise<User> {
  return apiClient<User>('/api/v1/auth/me')
}

export async function getMenu(): Promise<ModuleMenuItem[]> {
  return apiClient<ModuleMenuItem[]>('/api/v1/auth/menu')
}
