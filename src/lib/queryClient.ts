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
  products: ['catalog', 'products'] as const,
  categories: ['catalog', 'categories'] as const,
  brands: ['catalog', 'brands'] as const,
  sales: ['sales'] as const,
  variantByBarcode: (barcode: string) => ['catalog', 'variant', barcode] as const,
  faqSearch: (query: string) => ['faq', 'search', query] as const,
}
