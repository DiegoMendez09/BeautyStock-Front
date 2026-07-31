import { apiClient } from './client'
import type { CreateSaleRequest, SaleResponse } from '../types'

export async function createSale(request: CreateSaleRequest): Promise<SaleResponse> {
  return apiClient<SaleResponse>('/api/v1/sales', {
    method: 'POST',
    body: request,
  })
}
