import { apiClient } from './client'
import { buildQueryString } from '../lib/queryParams'
import type { PageParams } from './pagination'
import type { CreateUserRequest, PagedResult, UpdateUserRequest, UserAccount } from '../types'

export interface UserListParams extends PageParams {
  isActive?: boolean
}

export async function getUsers(params: UserListParams = {}): Promise<PagedResult<UserAccount>> {
  const qs = buildQueryString({
    isActive: params.isActive,
    page: params.page,
    pageSize: params.pageSize,
  })
  return apiClient<PagedResult<UserAccount>>(`/api/v1/users${qs}`)
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

/** Baja lógica (IsActive = false). */
export async function deactivateUser(id: number): Promise<void> {
  await apiClient<void>(`/api/v1/users/${id}/deactivate`, { method: 'POST' })
}

/** Baja física (borrado permanente). */
export async function deleteUser(id: number): Promise<void> {
  await apiClient<void>(`/api/v1/users/${id}`, { method: 'DELETE' })
}
