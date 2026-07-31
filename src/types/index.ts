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
