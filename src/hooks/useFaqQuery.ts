import { useQuery } from '@tanstack/react-query'
import { searchFaq } from '../api/faq'
import { queryKeys } from '../lib/queryClient'

export function useFaqSearchQuery(query: string, enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.faqSearch(query),
    queryFn: () => searchFaq(query),
    enabled: enabled && query.trim().length > 0,
  })
}
