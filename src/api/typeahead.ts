import { apiClient } from './client'
import { buildQueryString, sanitizeSearchInput } from '../lib/queryParams'
import type { TypeaheadItem } from '../types'

export type TypeaheadEntity =
  | 'products'
  | 'categories'
  | 'brands'
  | 'product-variants'
  | 'customers'

const endpoints: Record<TypeaheadEntity, string> = {
  products: '/api/v1/products/typeahead',
  categories: '/api/v1/categories/typeahead',
  brands: '/api/v1/brands/typeahead',
  'product-variants': '/api/v1/product-variants/typeahead',
  customers: '/api/v1/customers/typeahead',
}

export async function fetchTypeahead(
  entity: TypeaheadEntity,
  q: string,
  take = 20,
): Promise<TypeaheadItem[]> {
  const sanitized = sanitizeSearchInput(q)
  const qs = buildQueryString({
    q: sanitized || undefined,
    take,
  })
  return apiClient<TypeaheadItem[]>(`${endpoints[entity]}${qs}`)
}
