import { apiClient } from './client'
import type { Customer, CreateCustomerRequest, UpdateCustomerRequest } from '../types'

export async function getCustomers(isActive?: boolean): Promise<Customer[]> {
  const qs = isActive === undefined ? '' : `?isActive=${isActive}`
  return apiClient<Customer[]>(`/api/v1/customers${qs}`)
}

export async function createCustomer(request: CreateCustomerRequest): Promise<Customer> {
  return apiClient<Customer>('/api/v1/customers', { method: 'POST', body: request })
}

export async function updateCustomer(id: number, request: UpdateCustomerRequest): Promise<Customer> {
  return apiClient<Customer>(`/api/v1/customers/${id}`, { method: 'PUT', body: request })
}

export async function deleteCustomer(id: number): Promise<void> {
  await apiClient<void>(`/api/v1/customers/${id}`, { method: 'DELETE' })
}
