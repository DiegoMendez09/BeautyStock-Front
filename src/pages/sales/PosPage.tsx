import { useCallback, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { getProductByBarcode } from '../../api/catalog'
import { useCreateSaleMutation } from '../../hooks/useSalesMutations'
import type { CartLine } from '../../types'
import './PosPage.css'

function formatPrice(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(value)
}

export function PosPage() {
  const [barcode, setBarcode] = useState('')
  const [cart, setCart] = useState<CartLine[]>([])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const barcodeRef = useRef<HTMLInputElement>(null)
  const createSaleMutation = useCreateSaleMutation()

  const subtotal = cart.reduce(
    (sum, line) => sum + line.variant.salePrice * line.quantity,
    0,
  )

  const addByBarcode = useCallback(async (code: string) => {
    const trimmed = code.trim()
    if (!trimmed) return

    setError('')
    try {
      const variant = await getProductByBarcode(trimmed)
      setCart((prev) => {
        const existing = prev.find(
          (line) => line.variant.productVariantId === variant.productVariantId,
        )
        if (existing) {
          return prev.map((line) =>
            line.variant.productVariantId === variant.productVariantId
              ? { ...line, quantity: line.quantity + 1 }
              : line,
          )
        }
        return [...prev, { variant, quantity: 1 }]
      })
      setBarcode('')
      barcodeRef.current?.focus()
    } catch {
      setError(`Producto no encontrado: ${trimmed}`)
      setBarcode('')
      barcodeRef.current?.focus()
    }
  }, [])

  const handleScanSubmit = (e: FormEvent) => {
    e.preventDefault()
    void addByBarcode(barcode)
  }

  const handleScanKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      void addByBarcode(barcode)
    }
  }

  const updateQuantity = (variantId: number, quantity: number) => {
    if (quantity < 1) {
      setCart((prev) => prev.filter((line) => line.variant.productVariantId !== variantId))
      return
    }
    setCart((prev) =>
      prev.map((line) =>
        line.variant.productVariantId === variantId ? { ...line, quantity } : line,
      ),
    )
  }

  const removeLine = (variantId: number) => {
    setCart((prev) => prev.filter((line) => line.variant.productVariantId !== variantId))
  }

  const handleCheckout = async () => {
    if (cart.length === 0) return

    setError('')
    setSuccess('')

    try {
      const response = await createSaleMutation.mutateAsync({
        lines: cart.map((line) => ({
          productVariantId: line.variant.productVariantId,
          quantity: line.quantity,
          unitPrice: line.variant.salePrice,
        })),
        paymentMethod: 'Cash',
      })
      setSuccess(
        `Venta ${response.ticketNumber} — Total: ${formatPrice(response.totalAmount)}`,
      )
      setCart([])
      barcodeRef.current?.focus()
    } catch {
      setError('No se pudo completar la venta')
    }
  }

  return (
    <div className="page">
      <header className="page-header">
        <h1 className="page-title">Punto de venta</h1>
        <p className="page-subtitle">Escanea productos y procesa ventas</p>
      </header>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="pos-page">
        <div>
          <form className="pos-scan" onSubmit={handleScanSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="barcode">
                Código de barras
              </label>
              <input
                ref={barcodeRef}
                id="barcode"
                type="text"
                className="form-input pos-scan__input"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                onKeyDown={handleScanKeyDown}
                placeholder="Escanear o escribir código..."
                autoFocus
              />
            </div>
          </form>

          <div className="card pos-cart">
            {cart.length === 0 ? (
              <div className="empty-state">Escanea un producto para comenzar</div>
            ) : (
              <>
                <div className="pos-cart__header">
                  <span>Producto</span>
                  <span>Cant.</span>
                  <span>Precio</span>
                  <span>Subtotal</span>
                  <span />
                </div>
                {cart.map((line) => (
                  <div key={line.variant.productVariantId} className="pos-cart__row">
                    <div>
                      <div className="pos-cart__name">{line.variant.productName}</div>
                      <div className="pos-cart__barcode">
                        {line.variant.barcode ?? line.variant.sku}
                      </div>
                    </div>
                    <div className="pos-cart__qty">
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() =>
                          updateQuantity(line.variant.productVariantId, line.quantity - 1)
                        }
                      >
                        −
                      </button>
                      <input
                        type="number"
                        min={1}
                        value={line.quantity}
                        onChange={(e) =>
                          updateQuantity(
                            line.variant.productVariantId,
                            parseInt(e.target.value, 10) || 1,
                          )
                        }
                      />
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() =>
                          updateQuantity(line.variant.productVariantId, line.quantity + 1)
                        }
                      >
                        +
                      </button>
                    </div>
                    <span>{formatPrice(line.variant.salePrice)}</span>
                    <span>{formatPrice(line.variant.salePrice * line.quantity)}</span>
                    <button
                      type="button"
                      className="btn btn-ghost btn-icon"
                      onClick={() => removeLine(line.variant.productVariantId)}
                      title="Eliminar"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        <div className="card pos-summary">
          <h2 className="card-title">Resumen</h2>
          <div className="pos-summary__row">
            <span>Artículos</span>
            <span>{cart.reduce((sum, line) => sum + line.quantity, 0)}</span>
          </div>
          <div className="pos-summary__row">
            <span>Líneas</span>
            <span>{cart.length}</span>
          </div>
          <div className="pos-summary__total">
            <span>Total</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="pos-summary__actions">
            <button
              type="button"
              className="btn btn-primary"
              disabled={cart.length === 0 || createSaleMutation.isPending}
              onClick={() => void handleCheckout()}
            >
              {createSaleMutation.isPending ? 'Procesando...' : 'Completar venta'}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              disabled={cart.length === 0}
              onClick={() => setCart([])}
            >
              Vaciar carrito
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
