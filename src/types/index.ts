export interface User {
  userAccountId: number
  fullName: string
  email: string
  role: string
  permissions: string[]
}

export interface LoginResponse {
  expiresAt: string
  user: User
}

export interface ModuleMenuItem {
  moduleId: number
  code: string
  name: string
  routePath: string
  iconKey: string
  sortOrder: number
}

export interface Category {
  categoryId: number
  name: string
  description?: string
  isActive: boolean
}

export interface Brand {
  brandId: number
  name: string
  countryOfOrigin?: string
  logoUrl?: string
  isActive: boolean
}

export interface ProductVariant {
  productVariantId: number
  productId: number
  productName: string
  sku: string
  variantName: string
  variantType: string
  variantValue: string
  barcode?: string
  salePrice: number
  costPrice: number
  stockOnHand: number
  reorderLevel: number
  imageUrl?: string
  isActive: boolean
}

export interface Product {
  productId: number
  categoryId: number
  categoryName: string
  brandId: number
  brandName: string
  name: string
  description?: string
  imageUrl?: string
  isActive: boolean
  variants: ProductVariant[]
}

export interface CartLine {
  variant: ProductVariant
  quantity: number
}

export interface CreateSaleLineRequest {
  productVariantId: number
  quantity: number
  unitPrice?: number
  discountAmount?: number
}

export interface CreateSaleRequest {
  customerId?: number
  paymentMethod: string
  discountAmount?: number
  lines: CreateSaleLineRequest[]
}

export interface SaleResponse {
  saleId: number
  ticketNumber: string
  soldAt: string
  subtotalAmount: number
  discountAmount: number
  totalAmount: number
  paymentMethod: string
  status: string
}

export interface FaqSearchResult {
  faqArticleId: number
  question: string
  answer: string
  categoryName?: string
}

export interface TypeaheadItem {
  id: number
  label: string
  secondary?: string | null
}

export interface UserAccount {
  userAccountId: number
  fullName: string
  email: string
  role: string
  isActive: boolean
  lastLoginAt?: string | null
  createdAt: string
}

export interface CreateUserRequest {
  fullName: string
  email: string
  password: string
  role: string
}

export interface UpdateUserRequest {
  fullName: string
  email: string
  password?: string
  role: string
  isActive: boolean
}

export interface Customer {
  customerId: number
  fullName: string
  documentNumber?: string | null
  phone?: string | null
  email?: string | null
  birthDate?: string | null
  notes?: string | null
  loyaltyPoints: number
  isActive: boolean
}

export interface CreateCustomerRequest {
  fullName: string
  documentNumber?: string
  phone?: string
  email?: string
  notes?: string
}

export interface UpdateCustomerRequest extends CreateCustomerRequest {
  isActive: boolean
}

export interface CreateCategoryRequest {
  name: string
  description?: string
}

export interface UpdateCategoryRequest {
  name: string
  description?: string
  isActive: boolean
}

export interface CreateProductRequest {
  categoryId: number
  brandId: number
  name: string
  description?: string
}

export interface NotificationItem {
  notificationId: number
  notificationType: string
  title: string
  message: string
  severity: string
  isRead: boolean
  referenceType?: string | null
  referenceId?: number | null
  createdAt: string
}

export interface LoginLogItem {
  loginLogId: number
  userAccountId?: number | null
  emailAttempted: string
  isSuccess: boolean
  failureReason?: string | null
  ipAddress?: string | null
  attemptedAt: string
}
