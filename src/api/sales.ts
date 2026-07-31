import { apiClient, downloadBlob } from './client'
import { buildQueryString } from '../lib/queryParams'
import type { PageParams } from './pagination'
import type { CreateSaleRequest, PagedResult, SaleResponse } from '../types'

export async function createSale(request: CreateSaleRequest): Promise<SaleResponse> {
  return apiClient<SaleResponse>('/api/v1/sales', {
    method: 'POST',
    body: request,
  })
}

export interface SaleListItem {
  saleId: number
  ticketNumber: string
  soldAt: string
  soldByFullName: string
  totalAmount: number
  paymentMethod: string
  status: string
}

export interface SaleListParams extends PageParams {
  from?: string
  to?: string
}

export async function getSales(params: SaleListParams = {}): Promise<PagedResult<SaleListItem>> {
  const qs = buildQueryString({
    from: params.from,
    to: params.to,
    page: params.page,
    pageSize: params.pageSize,
  })
  return apiClient<PagedResult<SaleListItem>>(`/api/v1/sales${qs}`)
}

/** Descarga el PDF del ticket de una venta puntual. */
export async function downloadSalePdf(saleId: number, ticketNumber: string): Promise<void> {
  await downloadBlob(`/api/v1/sales/${saleId}/pdf`, `ticket-${ticketNumber}.pdf`)
}

export interface SalesExportParams {
  from?: string
  to?: string
}

/** Descarga un PDF consolidado del historial de ventas, con rango de fechas opcional. */
export async function downloadSalesExportPdf(params: SalesExportParams = {}): Promise<void> {
  const qs = buildQueryString({ from: params.from, to: params.to })
  await downloadBlob(`/api/v1/sales/export/pdf${qs}`, 'historial-ventas.pdf')
}
