import { apiClient } from './client'
import type { Category, CreateCategoryRequest, UpdateCategoryRequest, Product, CreateProductRequest } from '../types'

export async function createCategory(request: CreateCategoryRequest): Promise<Category> {
  return apiClient<Category>('/api/v1/categories', { method: 'POST', body: request })
}

export async function updateCategory(id: number, request: UpdateCategoryRequest): Promise<Category> {
  return apiClient<Category>(`/api/v1/categories/${id}`, { method: 'PUT', body: request })
}

export async function deleteCategory(id: number): Promise<void> {
  await apiClient<void>(`/api/v1/categories/${id}`, { method: 'DELETE' })
}

export async function createProduct(request: CreateProductRequest): Promise<Product> {
  return apiClient<Product>('/api/v1/products', { method: 'POST', body: request })
}
