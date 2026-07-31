import { apiClient } from './client'
import { buildQueryString } from '../lib/queryParams'
import type { PageParams } from './pagination'
import type { Customer, CreateCustomerRequest, PagedResult, UpdateCustomerRequest } from '../types'

export interface CustomerListParams extends PageParams {
  isActive?: boolean
}

export async function getCustomers(params: CustomerListParams = {}): Promise<PagedResult<Customer>> {
  const qs = buildQueryString({
    isActive: params.isActive,
    page: params.page,
    pageSize: params.pageSize,
  })
  return apiClient<PagedResult<Customer>>(`/api/v1/customers${qs}`)
}

export async function createCustomer(request: CreateCustomerRequest): Promise<Customer> {
  return apiClient<Customer>('/api/v1/customers', { method: 'POST', body: request })
}

export async function updateCustomer(id: number, request: UpdateCustomerRequest): Promise<Customer> {
  return apiClient<Customer>(`/api/v1/customers/${id}`, { method: 'PUT', body: request })
}

/** Baja lógica (IsActive = false). */
export async function deactivateCustomer(id: number): Promise<void> {
  await apiClient<void>(`/api/v1/customers/${id}/deactivate`, { method: 'POST' })
}

/** Baja física (borrado permanente). */
export async function deleteCustomer(id: number): Promise<void> {
  await apiClient<void>(`/api/v1/customers/${id}`, { method: 'DELETE' })
}
