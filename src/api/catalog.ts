import { apiClient } from './client'
import { buildQueryString, sanitizeSearchInput } from '../lib/queryParams'
import type { PageParams } from './pagination'
import type { Brand, Category, PagedResult, Product, ProductVariant } from '../types'

export interface ProductListParams extends PageParams {
  search?: string
  categoryId?: number
  brandId?: number
  isActive?: boolean
}

export interface CategoryListParams extends PageParams {
  isActive?: boolean
}

export interface BrandListParams extends PageParams {
  isActive?: boolean
}

export async function getCategories(
  params: CategoryListParams = {},
): Promise<PagedResult<Category>> {
  const qs = buildQueryString({
    isActive: params.isActive,
    page: params.page,
    pageSize: params.pageSize,
  })
  return apiClient<PagedResult<Category>>(`/api/v1/categories${qs}`)
}

export async function getBrands(params: BrandListParams = {}): Promise<PagedResult<Brand>> {
  const qs = buildQueryString({
    isActive: params.isActive,
    page: params.page,
    pageSize: params.pageSize,
  })
  return apiClient<PagedResult<Brand>>(`/api/v1/brands${qs}`)
}

export async function getProducts(params: ProductListParams = {}): Promise<PagedResult<Product>> {
  const qs = buildQueryString({
    search: params.search ? sanitizeSearchInput(params.search) : undefined,
    categoryId: params.categoryId,
    brandId: params.brandId,
    isActive: params.isActive,
    page: params.page,
    pageSize: params.pageSize,
  })
  return apiClient<PagedResult<Product>>(`/api/v1/products${qs}`)
}

export async function getProductVariantById(id: number): Promise<ProductVariant> {
  return apiClient<ProductVariant>(`/api/v1/product-variants/${id}`)
}

export async function getProductByBarcode(barcode: string): Promise<ProductVariant> {
  return apiClient<ProductVariant>(
    `/api/v1/product-variants/by-barcode/${encodeURIComponent(sanitizeSearchInput(barcode, 64))}`,
  )
}
