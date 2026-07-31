import { apiClient } from './client'
import { buildQueryString } from '../lib/queryParams'
import type { PageParams } from './pagination'
import type { PagedResult } from '../types'

export interface Supplier {
  supplierId: number
  legalName: string
  email?: string | null
  phone?: string | null
  isActive: boolean
}

export interface PurchaseOrder {
  purchaseOrderId: number
  orderNumber: string
  supplierId: number
  supplierName: string
  status: string
  orderedAt: string
  receivedAt?: string | null
  totalAmount: number
  notes?: string | null
  lines: {
    purchaseOrderLineId: number
    productVariantId: number
    sku: string
    variantName: string
    quantity: number
    unitCost: number
    lineTotal: number
  }[]
}

export interface SupplierListParams extends PageParams {
  isActive?: boolean
}

export async function getSuppliers(params: SupplierListParams = {}): Promise<PagedResult<Supplier>> {
  const qs = buildQueryString({
    isActive: params.isActive,
    page: params.page,
    pageSize: params.pageSize,
  })
  return apiClient<PagedResult<Supplier>>(`/api/v1/purchases/suppliers${qs}`)
}

export async function createSupplier(body: {
  legalName: string
  email?: string
  phone?: string
}): Promise<Supplier> {
  return apiClient<Supplier>('/api/v1/purchases/suppliers', { method: 'POST', body })
}

/** Baja lógica (IsActive = false). */
export async function deactivateSupplier(id: number): Promise<void> {
  await apiClient<void>(`/api/v1/purchases/suppliers/${id}/deactivate`, { method: 'POST' })
}

/** Baja física (borrado permanente). */
export async function deleteSupplier(id: number): Promise<void> {
  await apiClient<void>(`/api/v1/purchases/suppliers/${id}`, { method: 'DELETE' })
}

export interface PurchaseOrderListParams extends PageParams {
  status?: string
}

export async function getPurchaseOrders(
  params: PurchaseOrderListParams = {},
): Promise<PagedResult<PurchaseOrder>> {
  const qs = buildQueryString({
    status: params.status,
    page: params.page,
    pageSize: params.pageSize,
  })
  return apiClient<PagedResult<PurchaseOrder>>(`/api/v1/purchases/orders${qs}`)
}

export async function createPurchaseOrder(body: {
  supplierId: number
  notes?: string
  lines: {
    productVariantId?: number
    quantity: number
    unitCost: number
    newItem?: {
      productId?: number
      categoryId?: number
      brandId?: number
      productName?: string
      sku: string
      presentationName: string
      presentationValue?: string
      salePrice: number
      reorderLevel?: number
      barcode?: string
    }
  }[]
}): Promise<PurchaseOrder> {
  return apiClient<PurchaseOrder>('/api/v1/purchases/orders', { method: 'POST', body })
}

export async function receivePurchaseOrder(id: number): Promise<PurchaseOrder> {
  return apiClient<PurchaseOrder>(`/api/v1/purchases/orders/${id}/receive`, { method: 'POST' })
}

export interface DashboardReport {
  salesCountToday: number
  salesTotalToday: number
  activeProducts: number
  activeCustomers: number
  lowStockItems: {
    productVariantId: number
    sku: string
    productName: string
    variantName: string
    stockOnHand: number
    reorderLevel: number
  }[]
  topProducts: {
    productVariantId: number
    sku: string
    label: string
    quantitySold: number
    revenue: number
  }[]
}

export async function getDashboardReport(): Promise<DashboardReport> {
  return apiClient<DashboardReport>('/api/v1/reports/dashboard')
}

export interface TraceabilityPurchaseRef {
  purchaseOrderId: number
  orderNumber: string
  supplierName: string
  receivedAt: string
  quantity: number
  unitCost: number
}

export interface TraceabilityItem {
  productVariantId: number
  sku: string
  productName: string
  variantName: string
  quantityPurchased: number
  quantitySold: number
  stockOnHand: number
  purchaseBalance: number
  purchaseCostTotal: number
  salesRevenueTotal: number
  suppliers: string[]
  purchases: TraceabilityPurchaseRef[]
}

export interface TraceabilityReport {
  items: TraceabilityItem[]
  totalPurchased: number
  totalSold: number
  totalStockOnHand: number
}

export async function getTraceabilityReport(params: {
  productVariantId?: number
  supplierId?: number
} = {}): Promise<TraceabilityReport> {
  const qs = buildQueryString({
    productVariantId: params.productVariantId,
    supplierId: params.supplierId,
  })
  return apiClient<TraceabilityReport>(`/api/v1/reports/traceability${qs}`)
}

export async function getSettingsOverview() {
  return apiClient<{
    roles: string[]
    modules: { moduleId: number; code: string; name: string; routePath?: string; isActive: boolean }[]
    permissions: { permissionId: number; code: string; name: string; action: string; isActive: boolean }[]
    rolePermissions: { role: string; permissionCode: string }[]
  }>('/api/v1/settings/overview')
}

export interface FaqCategory {
  faqCategoryId: number
  code: string
  name: string
  sortOrder: number
}

export interface FaqArticleAdmin {
  faqArticleId: number
  faqCategoryId: number
  categoryName: string
  question: string
  answer: string
  keywords?: string | null
  audienceRole?: string | null
  sortOrder: number
  isActive: boolean
}

export interface CreateFaqArticleRequest {
  faqCategoryId: number
  question: string
  answer: string
  keywords?: string
  audienceRole?: string
  sortOrder: number
}

export interface UpdateFaqArticleRequest extends CreateFaqArticleRequest {
  isActive: boolean
}

export async function getFaqCategories(): Promise<FaqCategory[]> {
  return apiClient<FaqCategory[]>('/api/v1/faq/categories')
}

export interface FaqArticleListParams extends PageParams {
  includeInactive?: boolean
}

export async function getFaqArticles(
  params: FaqArticleListParams = {},
): Promise<PagedResult<FaqArticleAdmin>> {
  const qs = buildQueryString({
    includeInactive: params.includeInactive,
    page: params.page,
    pageSize: params.pageSize,
  })
  return apiClient<PagedResult<FaqArticleAdmin>>(`/api/v1/faq/articles${qs}`)
}

export async function createFaqArticle(body: CreateFaqArticleRequest): Promise<FaqArticleAdmin> {
  return apiClient<FaqArticleAdmin>('/api/v1/faq/articles', { method: 'POST', body })
}

export async function updateFaqArticle(
  id: number,
  body: UpdateFaqArticleRequest,
): Promise<FaqArticleAdmin> {
  return apiClient<FaqArticleAdmin>(`/api/v1/faq/articles/${id}`, { method: 'PUT', body })
}

/** Baja lógica (IsActive = false). */
export async function deactivateFaqArticle(id: number): Promise<void> {
  await apiClient<void>(`/api/v1/faq/articles/${id}/deactivate`, { method: 'POST' })
}

/** Baja física (borrado permanente). */
export async function deleteFaqArticle(id: number): Promise<void> {
  await apiClient<void>(`/api/v1/faq/articles/${id}`, { method: 'DELETE' })
}
