import { apiClient } from './client'
import { sanitizeSearchInput } from '../lib/queryParams'
import type { FaqSearchResult } from '../types'

export async function searchFaq(query: string): Promise<FaqSearchResult[]> {
  return apiClient<FaqSearchResult[]>('/api/v1/faq/search', {
    method: 'POST',
    body: { query: sanitizeSearchInput(query, 200) },
  })
}
