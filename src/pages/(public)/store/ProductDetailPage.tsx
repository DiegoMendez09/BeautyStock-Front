import { useMutation, useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getStoreProduct } from '../../../api/store'
import { createSale } from '../../../api/sales'
import { useAuth } from '../../../hooks/useAuth'
import { P } from '../../../lib/permissions'
import { useCartStore } from '../../../stores/cartStore'
import './MarketplacePage.css'

function formatPrice(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(value)
}

export function ProductDetailPage() {
  const { id } = useParams()
  const productId = Number(id)
  const navigate = useNavigate()
  const { isAuthenticated, hasPermission } = useAuth()
  const addItem = useCartStore((s) => s.addItem)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [message, setMessage] = useState('')

  const { data: product, isLoading, isError } = useQuery({
    queryKey: ['store', 'product', productId],
    queryFn: () => getStoreProduct(productId),
    enabled: Number.isFinite(productId) && productId > 0,
  })

  const selected =
    product?.variants.find((v) => v.productVariantId === selectedId) ??
    product?.variants.find((v) => v.stockOnHand > 0) ??
    product?.variants[0]

  const buyNow = useMutation({
    mutationFn: async () => {
      if (!selected) throw new Error('Sin variante')
      return createSale({
        paymentMethod: 'Card',
        discountAmount: 0,
        lines: [
          {
            productVariantId: selected.productVariantId,
            quantity: 1,
            unitPrice: selected.salePrice,
            discountAmount: 0,
          },
        ],
      })
    },
    onSuccess: (sale) => {
      setMessage(`Compra realizada. Ticket ${sale.ticketNumber}`)
    },
    onError: () => setMessage('No se pudo completar la compra'),
  })

  if (isLoading) {
    return (
      <div className="market-loading">
        <div className="spinner" />
      </div>
    )
  }

  if (isError || !product) {
    return <div className="alert alert-error">Producto no encontrado</div>
  }

  const handleAdd = () => {
    if (!selected || selected.stockOnHand <= 0) return
    addItem({
      productVariantId: selected.productVariantId,
      productId: product.productId,
      productName: product.name,
      variantName: selected.variantName,
      sku: selected.sku,
      unitPrice: selected.salePrice,
      maxStock: selected.stockOnHand,
      imageUrl: selected.imageUrl ?? product.imageUrl,
    })
    setMessage('Agregado al carrito')
  }

  const handleBuy = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/tienda/producto/${product.productId}` } })
      return
    }
    if (!hasPermission(P.Sales.Create)) {
      setMessage('Tu cuenta no puede comprar en línea. Contacta a la tienda.')
      return
    }
    buyNow.mutate()
  }

  return (
    <div className="product-detail">
      <div className="product-detail__media">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt="" />
        ) : (
          <div className="product-detail__placeholder">{product.name.slice(0, 1)}</div>
        )}
      </div>

      <div>
        <p className="product-detail__brand">
          {product.brandName} · {product.categoryName}
        </p>
        <h1 className="product-detail__title">{product.name}</h1>
        {product.description && <p className="product-detail__desc">{product.description}</p>}

        <div className="product-detail__variants">
          {product.variants.map((variant) => (
            <button
              key={variant.productVariantId}
              type="button"
              className={`product-variant${
                selected?.productVariantId === variant.productVariantId
                  ? ' product-variant--active'
                  : ''
              }`}
              disabled={variant.stockOnHand <= 0}
              onClick={() => setSelectedId(variant.productVariantId)}
            >
              <span>
                <strong>{variant.variantName}</strong>
                <br />
                <small>{variant.sku}</small>
              </span>
              <span>
                <strong>{formatPrice(variant.salePrice)}</strong>
                <br />
                <small>{variant.stockOnHand > 0 ? `${variant.stockOnHand} disp.` : 'Agotado'}</small>
              </span>
            </button>
          ))}
        </div>

        {message && <div className="alert alert-success">{message}</div>}

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-secondary"
            disabled={!selected || selected.stockOnHand <= 0}
            onClick={handleAdd}
          >
            Agregar al carrito
          </button>
          <button
            type="button"
            className="btn btn-primary"
            disabled={!selected || selected.stockOnHand <= 0 || buyNow.isPending}
            onClick={handleBuy}
          >
            {isAuthenticated ? 'Comprar ahora' : 'Iniciar sesión para comprar'}
          </button>
          <Link to="/tienda" className="btn btn-ghost">
            Volver al catálogo
          </Link>
        </div>
      </div>
    </div>
  )
}
