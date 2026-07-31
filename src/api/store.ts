import { apiClient } from './client'
import { buildQueryString, sanitizeSearchInput } from '../lib/queryParams'
import type { PageParams } from './pagination'
import type { PagedResult } from '../types'

export interface StoreVariant {
  productVariantId: number
  sku: string
  variantName: string
  salePrice: number
  stockOnHand: number
  imageUrl?: string | null
}

export interface StoreProduct {
  productId: number
  name: string
  description?: string | null
  imageUrl?: string | null
  brandName: string
  categoryName: string
  minPrice: number
  maxPrice: number
  totalStock: number
  variants: StoreVariant[]
}

export interface StoreCatalogParams extends PageParams {
  search?: string
  categoryId?: number
  brandId?: number
}

export async function getStoreProducts(
  params: StoreCatalogParams = {},
): Promise<PagedResult<StoreProduct>> {
  const qs = buildQueryString({
    search: params.search ? sanitizeSearchInput(params.search) : undefined,
    categoryId: params.categoryId,
    brandId: params.brandId,
    page: params.page,
    pageSize: params.pageSize ?? 24,
  })
  return apiClient<PagedResult<StoreProduct>>(`/api/v1/store/products${qs}`)
}

export async function getStoreProduct(id: number): Promise<StoreProduct> {
  return apiClient<StoreProduct>(`/api/v1/store/products/${id}`)
}
