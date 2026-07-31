import { useEffect, useState } from 'react'
import { getProducts } from '../../api/catalog'
import type { Product } from '../../types'

function formatPrice(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(value)
}

function minSalePrice(product: Product): number | null {
  if (!product.variants?.length) return null
  return Math.min(...product.variants.map((v) => v.salePrice))
}

export function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    void (async () => {
      try {
        const data = await getProducts()
        setProducts(data)
      } catch {
        setError('No se pudieron cargar los productos')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  return (
    <div className="page">
      <header className="page-header">
        <h1 className="page-title">Productos</h1>
        <p className="page-subtitle">Catálogo de productos del inventario</p>
      </header>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="loading-screen" style={{ minHeight: '200px' }}>
          <div className="spinner" />
        </div>
      ) : products.length === 0 ? (
        <div className="empty-state">No hay productos registrados</div>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Variantes</th>
                <th>Categoría</th>
                <th>Marca</th>
                <th>Desde</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const price = minSalePrice(product)
                return (
                  <tr key={product.productId}>
                    <td>{product.name}</td>
                    <td>{product.variants?.length ?? 0}</td>
                    <td>{product.categoryName ?? '—'}</td>
                    <td>{product.brandName ?? '—'}</td>
                    <td>{price == null ? '—' : formatPrice(price)}</td>
                    <td>
                      <span
                        className={`badge ${product.isActive ? 'badge-success' : 'badge-muted'}`}
                      >
                        {product.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
