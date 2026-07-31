import { useQuery } from '@tanstack/react-query'
import { useMemo, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { getStoreProducts, type StoreProduct } from '../../api/store'
import { PaginationBar } from '../../components/ui/PaginationBar'
import { useCartStore } from '../../stores/cartStore'
import './MarketplacePage.css'

function formatPrice(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(value)
}

function priceLabel(product: StoreProduct): string {
  if (product.minPrice === product.maxPrice) {
    return formatPrice(product.minPrice)
  }
  return `${formatPrice(product.minPrice)} – ${formatPrice(product.maxPrice)}`
}

export function MarketplacePage() {
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(24)
  const addItem = useCartStore((s) => s.addItem)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['store', 'products', query, page, pageSize],
    queryFn: () => getStoreProducts({ search: query || undefined, page, pageSize }),
  })

  const products = data?.items ?? []
  const totalPages = data?.totalPages ?? 1

  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.categoryName))
    return [...set].sort()
  }, [products])

  const handleSearch = (e: FormEvent) => {
    e.preventDefault()
    setPage(1)
    setQuery(search.trim())
  }

  const quickAdd = (product: StoreProduct) => {
    const variant = product.variants.find((v) => v.stockOnHand > 0) ?? product.variants[0]
    if (!variant || variant.stockOnHand <= 0) return
    addItem({
      productVariantId: variant.productVariantId,
      productId: product.productId,
      productName: product.name,
      variantName: variant.variantName,
      sku: variant.sku,
      unitPrice: variant.salePrice,
      maxStock: variant.stockOnHand,
      imageUrl: variant.imageUrl ?? product.imageUrl,
    })
  }

  return (
    <div className="market">
      <section className="market-hero">
        <div className="market-hero__copy">
          <p className="market-hero__eyebrow">Tienda en línea</p>
          <h1 className="market-hero__title">BeautyStock</h1>
          <p className="market-hero__text">
            Descubre productos de belleza con stock real. Explora sin cuenta; inicia sesión solo
            cuando quieras comprar.
          </p>
        </div>
        <form className="market-search" onSubmit={handleSearch}>
          <input
            className="form-input market-search__input"
            placeholder="Buscar producto, marca o categoría…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Buscar productos"
          />
          <button type="submit" className="btn btn-primary">
            Buscar
          </button>
        </form>
      </section>

      {categories.length > 0 && (
        <div className="market-chips" aria-label="Categorías en esta página">
          {categories.map((c) => (
            <span key={c} className="market-chip">
              {c}
            </span>
          ))}
        </div>
      )}

      {isError && <div className="alert alert-error">No se pudo cargar el catálogo</div>}

      {isLoading ? (
        <div className="market-loading">
          <div className="spinner" />
        </div>
      ) : products.length === 0 ? (
        <div className="empty-state">No hay productos disponibles por ahora</div>
      ) : (
        <>
          <div className="market-grid">
            {products.map((product) => (
              <article key={product.productId} className="market-card">
                <Link to={`/tienda/producto/${product.productId}`} className="market-card__media">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt="" loading="lazy" />
                  ) : (
                    <div className="market-card__placeholder">{product.name.slice(0, 1)}</div>
                  )}
                </Link>
                <div className="market-card__body">
                  <p className="market-card__brand">{product.brandName}</p>
                  <Link to={`/tienda/producto/${product.productId}`} className="market-card__name">
                    {product.name}
                  </Link>
                  <p className="market-card__meta">{product.categoryName}</p>
                  <div className="market-card__row">
                    <span className="market-card__price">{priceLabel(product)}</span>
                    <span
                      className={`market-card__stock${product.totalStock <= 5 ? ' market-card__stock--low' : ''}`}
                    >
                      {product.totalStock > 0 ? `${product.totalStock} disp.` : 'Agotado'}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm market-card__cta"
                    disabled={product.totalStock <= 0}
                    onClick={() => quickAdd(product)}
                  >
                    Agregar al carrito
                  </button>
                </div>
              </article>
            ))}
          </div>

          <PaginationBar
            page={page}
            pageSize={pageSize}
            totalCount={data?.totalCount ?? 0}
            totalPages={totalPages}
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size)
              setPage(1)
            }}
          />
        </>
      )}
    </div>
  )
}
