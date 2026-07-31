import { useProductsQuery } from '../../hooks/useCatalogQueries'

function formatPrice(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(value)
}

export function ProductsPage() {
  const { data: products = [], isLoading, isError } = useProductsQuery()

  return (
    <div className="page">
      <header className="page-header">
        <h1 className="page-title">Productos</h1>
        <p className="page-subtitle">Catálogo de productos del inventario</p>
      </header>

      {isError && <div className="alert alert-error">No se pudieron cargar los productos</div>}

      {isLoading ? (
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
                const price =
                  product.variants?.length > 0
                    ? Math.min(...product.variants.map((v) => v.salePrice))
                    : null
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
