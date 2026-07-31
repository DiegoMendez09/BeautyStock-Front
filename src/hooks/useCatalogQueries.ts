import { useQuery } from '@tanstack/react-query'
import { getCategories, getProducts, type ProductListParams } from '../api/catalog'
import { queryKeys } from '../lib/queryClient'
import { useDebouncedValue } from './useTypeaheadQuery'

export function useProductsQuery(filters: ProductListParams = {}) {
  const debouncedSearch = useDebouncedValue(filters.search ?? '', 300)
  const resolved = {
    ...filters,
    search: debouncedSearch || undefined,
  }

  return useQuery({
    queryKey: queryKeys.products(resolved),
    queryFn: () => getProducts(resolved),
  })
}

export function useCategoriesQuery() {
  return useQuery({
    queryKey: queryKeys.categories,
    queryFn: getCategories,
  })
}
