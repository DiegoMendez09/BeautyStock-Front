import { apiClient } from './client'
import { buildQueryString, sanitizeSearchInput } from '../lib/queryParams'
import type { Brand, Category, Product, ProductVariant } from '../types'

export interface ProductListParams {
  search?: string
  categoryId?: number
  brandId?: number
  isActive?: boolean
}

export async function getCategories(): Promise<Category[]> {
  return apiClient<Category[]>('/api/v1/categories')
}

export async function getBrands(): Promise<Brand[]> {
  return apiClient<Brand[]>('/api/v1/brands')
}

export async function getProducts(params: ProductListParams = {}): Promise<Product[]> {
  const qs = buildQueryString({
    search: params.search ? sanitizeSearchInput(params.search) : undefined,
    categoryId: params.categoryId,
    brandId: params.brandId,
    isActive: params.isActive,
  })
  return apiClient<Product[]>(`/api/v1/products${qs}`)
}

export async function getProductVariantById(id: number): Promise<ProductVariant> {
  return apiClient<ProductVariant>(`/api/v1/product-variants/${id}`)
}

export async function getProductByBarcode(barcode: string): Promise<ProductVariant> {
  return apiClient<ProductVariant>(
    `/api/v1/product-variants/by-barcode/${encodeURIComponent(sanitizeSearchInput(barcode, 64))}`,
  )
}
