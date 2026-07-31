import { apiClient } from './client'

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

export async function getSuppliers(): Promise<Supplier[]> {
  return apiClient<Supplier[]>('/api/v1/purchases/suppliers')
}

export async function createSupplier(body: {
  legalName: string
  email?: string
  phone?: string
}): Promise<Supplier> {
  return apiClient<Supplier>('/api/v1/purchases/suppliers', { method: 'POST', body })
}

export async function deactivateSupplier(id: number): Promise<void> {
  await apiClient<void>(`/api/v1/purchases/suppliers/${id}`, { method: 'DELETE' })
}

export async function getPurchaseOrders(): Promise<PurchaseOrder[]> {
  return apiClient<PurchaseOrder[]>('/api/v1/purchases/orders')
}

export async function createPurchaseOrder(body: {
  supplierId: number
  notes?: string
  lines: { productVariantId: number; quantity: number; unitCost: number }[]
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

export async function getSettingsOverview() {
  return apiClient<{
    roles: string[]
    modules: { moduleId: number; code: string; name: string; routePath?: string; isActive: boolean }[]
    permissions: { permissionId: number; code: string; name: string; action: string; isActive: boolean }[]
    rolePermissions: { role: string; permissionCode: string }[]
  }>('/api/v1/settings/overview')
}

export async function getSales() {
  return apiClient<
    {
      saleId: number
      ticketNumber: string
      soldAt: string
      soldByFullName: string
      totalAmount: number
      paymentMethod: string
      status: string
    }[]
  >('/api/v1/sales')
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

export async function getFaqArticles(includeInactive = false): Promise<FaqArticleAdmin[]> {
  const q = includeInactive ? '?includeInactive=true' : ''
  return apiClient<FaqArticleAdmin[]>(`/api/v1/faq/articles${q}`)
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

export async function deactivateFaqArticle(id: number): Promise<void> {
  await apiClient<void>(`/api/v1/faq/articles/${id}`, { method: 'DELETE' })
}
