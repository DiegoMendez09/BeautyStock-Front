import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { getCategories, getProducts, type CategoryListParams, type ProductListParams } from '../api/catalog'
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
    placeholderData: keepPreviousData,
  })
}

export function useCategoriesQuery(params: CategoryListParams = {}) {
  return useQuery({
    queryKey: queryKeys.categories(params),
    queryFn: () => getCategories(params),
    placeholderData: keepPreviousData,
  })
}
