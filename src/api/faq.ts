import { apiClient } from './client'
import { sanitizeSearchInput } from '../lib/queryParams'
import type { FaqAskResult } from '../types'

export async function searchFaq(query: string): Promise<FaqAskResult> {
  return apiClient<FaqAskResult>('/api/v1/faq/search', {
    method: 'POST',
    body: { query: sanitizeSearchInput(query, 200) },
  })
}
