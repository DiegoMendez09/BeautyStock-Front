import { useQuery } from '@tanstack/react-query'
import { getCategories, getProducts } from '../api/catalog'
import { queryKeys } from '../lib/queryClient'

export function useProductsQuery() {
  return useQuery({
    queryKey: queryKeys.products,
    queryFn: getProducts,
  })
}

export function useCategoriesQuery() {
  return useQuery({
    queryKey: queryKeys.categories,
    queryFn: getCategories,
  })
}
