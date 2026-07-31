import { apiClient } from './client'
import type { UserAccount, CreateUserRequest, UpdateUserRequest } from '../types'

export async function getUsers(): Promise<UserAccount[]> {
  return apiClient<UserAccount[]>('/api/v1/users')
}

export async function getRoles(): Promise<string[]> {
  return apiClient<string[]>('/api/v1/users/roles')
}

export async function createUser(request: CreateUserRequest): Promise<UserAccount> {
  return apiClient<UserAccount>('/api/v1/users', { method: 'POST', body: request })
}

export async function updateUser(id: number, request: UpdateUserRequest): Promise<UserAccount> {
  return apiClient<UserAccount>(`/api/v1/users/${id}`, { method: 'PUT', body: request })
}

export async function deleteUser(id: number): Promise<void> {
  await apiClient<void>(`/api/v1/users/${id}`, { method: 'DELETE' })
}
