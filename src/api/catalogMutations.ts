import { apiClient } from './client'
import type {
  Brand,
  Category,
  CreateCategoryRequest,
  CreateProductRequest,
  Product,
  ProductVariant,
  UpdateCategoryRequest,
} from '../types'

export async function createCategory(request: CreateCategoryRequest): Promise<Category> {
  return apiClient<Category>('/api/v1/categories', { method: 'POST', body: request })
}

export async function updateCategory(id: number, request: UpdateCategoryRequest): Promise<Category> {
  return apiClient<Category>(`/api/v1/categories/${id}`, { method: 'PUT', body: request })
}

/** Baja lógica (IsActive = false). */
export async function deactivateCategory(id: number): Promise<void> {
  await apiClient<void>(`/api/v1/categories/${id}/deactivate`, { method: 'POST' })
}

/** Baja física (borrado permanente). */
export async function deleteCategory(id: number): Promise<void> {
  await apiClient<void>(`/api/v1/categories/${id}`, { method: 'DELETE' })
}

export async function createProduct(request: CreateProductRequest): Promise<Product> {
  return apiClient<Product>('/api/v1/products', { method: 'POST', body: request })
}

export async function deactivateProduct(id: number): Promise<void> {
  await apiClient<void>(`/api/v1/products/${id}/deactivate`, { method: 'POST' })
}

export async function deleteProduct(id: number): Promise<void> {
  await apiClient<void>(`/api/v1/products/${id}`, { method: 'DELETE' })
}

export async function createBrand(request: {
  name: string
  countryOfOrigin?: string
}): Promise<Brand> {
  return apiClient<Brand>('/api/v1/brands', { method: 'POST', body: request })
}

export async function deactivateBrand(id: number): Promise<void> {
  await apiClient<void>(`/api/v1/brands/${id}/deactivate`, { method: 'POST' })
}

export async function deleteBrand(id: number): Promise<void> {
  await apiClient<void>(`/api/v1/brands/${id}`, { method: 'DELETE' })
}

export interface CreateVariantRequest {
  productId: number
  sku: string
  variantName: string
  variantType?: string
  variantValue?: string
  barcode?: string
  salePrice: number
  costPrice: number
  stockOnHand: number
  reorderLevel: number
}

export async function createVariant(request: CreateVariantRequest): Promise<ProductVariant> {
  return apiClient<ProductVariant>('/api/v1/product-variants', {
    method: 'POST',
    body: {
      ...request,
      variantType: request.variantType || 'Standard',
      variantValue: request.variantValue || request.variantName,
    },
  })
}

export async function deactivateVariant(id: number): Promise<void> {
  await apiClient<void>(`/api/v1/product-variants/${id}/deactivate`, { method: 'POST' })
}

export async function deleteVariant(id: number): Promise<void> {
  await apiClient<void>(`/api/v1/product-variants/${id}`, { method: 'DELETE' })
}
