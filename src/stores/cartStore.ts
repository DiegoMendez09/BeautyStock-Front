import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  productVariantId: number
  productId: number
  productName: string
  variantName: string
  sku: string
  unitPrice: number
  quantity: number
  imageUrl?: string | null
  maxStock: number
}

interface CartState {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void
  setQuantity: (productVariantId: number, quantity: number) => void
  removeItem: (productVariantId: number) => void
  clear: () => void
  totalItems: () => number
  totalAmount: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        const qty = item.quantity ?? 1
        set((state) => {
          const existing = state.items.find((i) => i.productVariantId === item.productVariantId)
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productVariantId === item.productVariantId
                  ? {
                      ...i,
                      quantity: Math.min(i.maxStock, i.quantity + qty),
                    }
                  : i,
              ),
            }
          }
          return {
            items: [
              ...state.items,
              { ...item, quantity: Math.min(item.maxStock, Math.max(1, qty)) },
            ],
          }
        })
      },
      setQuantity: (productVariantId, quantity) => {
        set((state) => ({
          items: state.items
            .map((i) =>
              i.productVariantId === productVariantId
                ? { ...i, quantity: Math.min(i.maxStock, Math.max(1, quantity)) }
                : i,
            )
            .filter((i) => i.quantity > 0),
        }))
      },
      removeItem: (productVariantId) => {
        set((state) => ({
          items: state.items.filter((i) => i.productVariantId !== productVariantId),
        }))
      },
      clear: () => set({ items: [] }),
      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      totalAmount: () => get().items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0),
    }),
    { name: 'bs-store-cart' },
  ),
)
