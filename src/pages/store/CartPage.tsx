import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createSale } from '../../api/sales'
import { useAuth } from '../../hooks/useAuth'
import { P } from '../../lib/permissions'
import { useCartStore } from '../../stores/cartStore'
import './MarketplacePage.css'

function formatPrice(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(value)
}

export function CartPage() {
  const navigate = useNavigate()
  const { isAuthenticated, hasPermission } = useAuth()
  const items = useCartStore((s) => s.items)
  const setQuantity = useCartStore((s) => s.setQuantity)
  const removeItem = useCartStore((s) => s.removeItem)
  const clear = useCartStore((s) => s.clear)
  const totalAmount = useCartStore((s) => s.totalAmount())
  const [error, setError] = useState('')
  const [ticket, setTicket] = useState('')

  const checkout = useMutation({
    mutationFn: () =>
      createSale({
        paymentMethod: 'Card',
        discountAmount: 0,
        lines: items.map((i) => ({
          productVariantId: i.productVariantId,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          discountAmount: 0,
        })),
      }),
    onSuccess: (sale) => {
      clear()
      setTicket(sale.ticketNumber)
      setError('')
    },
    onError: () => setError('No se pudo completar el pedido. Revisa stock e intenta de nuevo.'),
  })

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/tienda/carrito' } })
      return
    }
    if (!hasPermission(P.Sales.Create)) {
      setError('Tu cuenta no tiene permiso para comprar en línea.')
      return
    }
    if (items.length === 0) return
    checkout.mutate()
  }

  if (ticket) {
    return (
      <div className="card" style={{ maxWidth: 480 }}>
        <h1 className="card-title">¡Compra confirmada!</h1>
        <p style={{ marginBottom: '1rem', color: 'var(--color-text-muted)' }}>
          Ticket <strong>{ticket}</strong>
        </p>
        <Link to="/tienda" className="btn btn-primary">
          Seguir comprando
        </Link>
      </div>
    )
  }

  return (
    <div>
      <header className="page-header" style={{ paddingBottom: '1rem' }}>
        <h1 className="page-title">Carrito</h1>
        <p className="page-subtitle">Revisa tu pedido antes de pagar</p>
      </header>

      {items.length === 0 ? (
        <div className="empty-state">
          Tu carrito está vacío.{' '}
          <Link to="/tienda">Ver productos</Link>
        </div>
      ) : (
        <div className="cart-layout">
          <div className="card" style={{ paddingTop: 0 }}>
            {items.map((item) => (
              <div key={item.productVariantId} className="cart-line">
                <div className="cart-line__thumb">
                  {item.imageUrl ? <img src={item.imageUrl} alt="" /> : item.productName.slice(0, 1)}
                </div>
                <div>
                  <strong>{item.productName}</strong>
                  <div style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                    {item.variantName} · {item.sku}
                  </div>
                  <div style={{ marginTop: '0.35rem', fontWeight: 600 }}>
                    {formatPrice(item.unitPrice)}
                  </div>
                </div>
                <div className="cart-line__actions" style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
                  <input
                    type="number"
                    className="form-input"
                    style={{ width: 72 }}
                    min={1}
                    max={item.maxStock}
                    value={item.quantity}
                    onChange={(e) => setQuantity(item.productVariantId, Number(e.target.value))}
                  />
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => removeItem(item.productVariantId)}
                  >
                    Quitar
                  </button>
                </div>
              </div>
            ))}
          </div>

          <aside className="card cart-summary">
            <h2 className="card-title">Resumen</h2>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <span>Total</span>
              <strong>{formatPrice(totalAmount)}</strong>
            </div>
            {error && <div className="alert alert-error">{error}</div>}
            <button
              type="button"
              className="btn btn-primary"
              style={{ width: '100%' }}
              disabled={checkout.isPending}
              onClick={handleCheckout}
            >
              {isAuthenticated ? (checkout.isPending ? 'Procesando…' : 'Pagar') : 'Iniciar sesión para pagar'}
            </button>
            <Link to="/tienda" className="btn btn-ghost" style={{ width: '100%', marginTop: 8 }}>
              Seguir comprando
            </Link>
          </aside>
        </div>
      )}
    </div>
  )
}
