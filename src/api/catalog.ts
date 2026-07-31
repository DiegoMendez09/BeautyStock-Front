import { apiClient } from './client'
import type { Brand, Category, Product, ProductVariant } from '../types'

export async function getCategories(): Promise<Category[]> {
  return apiClient<Category[]>('/api/v1/categories')
}

export async function getBrands(): Promise<Brand[]> {
  return apiClient<Brand[]>('/api/v1/brands')
}

export async function getProducts(): Promise<Product[]> {
  return apiClient<Product[]>('/api/v1/products')
}

export async function getProductByBarcode(barcode: string): Promise<ProductVariant> {
  return apiClient<ProductVariant>(
    `/api/v1/product-variants/by-barcode/${encodeURIComponent(barcode)}`,
  )
}
