import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

export const queryKeys = {
  me: ['auth', 'me'] as const,
  menu: ['auth', 'menu'] as const,
  products: (filters?: {
    search?: string
    categoryId?: number
    brandId?: number
    page?: number
    pageSize?: number
  }) => ['catalog', 'products', filters ?? {}] as const,
  categories: (filters?: { page?: number; pageSize?: number }) =>
    ['catalog', 'categories', filters ?? {}] as const,
  brands: (filters?: { page?: number; pageSize?: number }) =>
    ['catalog', 'brands', filters ?? {}] as const,
  sales: (filters?: { page?: number; pageSize?: number }) =>
    ['sales', filters ?? {}] as const,
  variantByBarcode: (barcode: string) => ['catalog', 'variant', barcode] as const,
  variantById: (id: number) => ['catalog', 'variant', id] as const,
  faqSearch: (query: string) => ['faq', 'search', query] as const,
  typeahead: (entity: string, q: string, take: number) =>
    ['typeahead', entity, q, take] as const,
}
