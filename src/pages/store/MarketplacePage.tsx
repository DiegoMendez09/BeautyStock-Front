import { useQuery } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  getStoreFacets,
  getStoreProducts,
  type StoreProduct,
  type StoreSort,
} from '../../api/store'
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
  if (product.minPrice === product.maxPrice) return formatPrice(product.minPrice)
  return `${formatPrice(product.minPrice)} – ${formatPrice(product.maxPrice)}`
}

export function MarketplacePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const q = searchParams.get('q') ?? ''
  const categoryId = searchParams.get('categoryId')
    ? Number(searchParams.get('categoryId'))
    : undefined
  const brandId = searchParams.get('brandId') ? Number(searchParams.get('brandId')) : undefined
  const sort = (searchParams.get('sort') as StoreSort | null) ?? 'relevance'
  const page = Number(searchParams.get('page') ?? '1') || 1
  const pageSize = Number(searchParams.get('pageSize') ?? '24') || 24

  const [minPriceInput, setMinPriceInput] = useState(searchParams.get('minPrice') ?? '')
  const [maxPriceInput, setMaxPriceInput] = useState(searchParams.get('maxPrice') ?? '')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const addItem = useCartStore((s) => s.addItem)

  const minPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined
  const maxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined

  const patchParams = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams)
    Object.entries(patch).forEach(([key, value]) => {
      if (value === null || value === '') next.delete(key)
      else next.set(key, value)
    })
    if (!('page' in patch)) next.set('page', '1')
    setSearchParams(next)
  }

  useEffect(() => {
    setMinPriceInput(searchParams.get('minPrice') ?? '')
    setMaxPriceInput(searchParams.get('maxPrice') ?? '')
  }, [searchParams])

  const { data: facets } = useQuery({
    queryKey: ['store', 'facets', q],
    queryFn: () => getStoreFacets(q || undefined),
  })

  const { data, isLoading, isError, isFetching } = useQuery({
    queryKey: ['store', 'products', { q, categoryId, brandId, minPrice, maxPrice, sort, page, pageSize }],
    queryFn: () =>
      getStoreProducts({
        search: q || undefined,
        categoryId,
        brandId,
        minPrice: Number.isFinite(minPrice) ? minPrice : undefined,
        maxPrice: Number.isFinite(maxPrice) ? maxPrice : undefined,
        sort,
        page,
        pageSize,
      }),
  })

  const products = data?.items ?? []
  const totalPages = data?.totalPages ?? 1
  const totalCount = data?.totalCount ?? 0

  const activeFilters = useMemo(() => {
    const chips: { key: string; label: string; clear: Record<string, string | null> }[] = []
    if (categoryId && facets) {
      const cat = facets.categories.find((c) => c.id === categoryId)
      if (cat) chips.push({ key: 'cat', label: cat.name, clear: { categoryId: null } })
    }
    if (brandId && facets) {
      const brand = facets.brands.find((b) => b.id === brandId)
      if (brand) chips.push({ key: 'brand', label: brand.name, clear: { brandId: null } })
    }
    if (minPrice != null && Number.isFinite(minPrice)) {
      chips.push({
        key: 'min',
        label: `Desde ${formatPrice(minPrice)}`,
        clear: { minPrice: null },
      })
    }
    if (maxPrice != null && Number.isFinite(maxPrice)) {
      chips.push({
        key: 'max',
        label: `Hasta ${formatPrice(maxPrice)}`,
        clear: { maxPrice: null },
      })
    }
    return chips
  }, [categoryId, brandId, minPrice, maxPrice, facets])

  const applyPrice = () => {
    patchParams({
      minPrice: minPriceInput.trim() || null,
      maxPrice: maxPriceInput.trim() || null,
    })
  }

  const clearAll = () => {
    const next = new URLSearchParams()
    if (q) next.set('q', q)
    setSearchParams(next)
    setMinPriceInput('')
    setMaxPriceInput('')
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
    <div className="ml-market">
      <div className="ml-market__toolbar">
        <div>
          <h1 className="ml-market__title">
            {q ? `Resultados para “${q}”` : 'Productos destacados'}
          </h1>
          <p className="ml-market__count">
            {isFetching ? 'Buscando…' : `${totalCount} producto${totalCount === 1 ? '' : 's'}`}
          </p>
        </div>
        <div className="ml-market__toolbar-actions">
          <button
            type="button"
            className="ml-filters-toggle"
            onClick={() => setFiltersOpen((v) => !v)}
          >
            Filtros
          </button>
          <label className="ml-sort">
            Ordenar
            <select
              className="form-input"
              value={sort}
              onChange={(e) => patchParams({ sort: e.target.value })}
            >
              <option value="relevance">Más relevantes</option>
              <option value="price_asc">Menor precio</option>
              <option value="price_desc">Mayor precio</option>
              <option value="name">Nombre A-Z</option>
            </select>
          </label>
        </div>
      </div>

      {activeFilters.length > 0 && (
        <div className="ml-active-filters">
          {activeFilters.map((chip) => (
            <button
              key={chip.key}
              type="button"
              className="ml-chip"
              onClick={() => patchParams(chip.clear)}
            >
              {chip.label} ×
            </button>
          ))}
          <button type="button" className="ml-chip ml-chip--clear" onClick={clearAll}>
            Limpiar filtros
          </button>
        </div>
      )}

      <div className={`ml-layout${filtersOpen ? ' ml-layout--filters-open' : ''}`}>
        <aside className="ml-filters">
          <div className="ml-filters__head">
            <h2>Filtros</h2>
            <button type="button" className="ml-filters__close" onClick={() => setFiltersOpen(false)}>
              Cerrar
            </button>
          </div>

          <section className="ml-filter-block">
            <h3>Categorías</h3>
            <ul className="ml-filter-list">
              <li>
                <button
                  type="button"
                  className={!categoryId ? 'is-active' : undefined}
                  onClick={() => patchParams({ categoryId: null })}
                >
                  Todas
                </button>
              </li>
              {(facets?.categories ?? []).map((cat) => (
                <li key={cat.id}>
                  <button
                    type="button"
                    className={categoryId === cat.id ? 'is-active' : undefined}
                    onClick={() => patchParams({ categoryId: String(cat.id) })}
                  >
                    <span>{cat.name}</span>
                    <span className="ml-filter-count">{cat.count}</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>

          <section className="ml-filter-block">
            <h3>Marcas</h3>
            <ul className="ml-filter-list">
              <li>
                <button
                  type="button"
                  className={!brandId ? 'is-active' : undefined}
                  onClick={() => patchParams({ brandId: null })}
                >
                  Todas
                </button>
              </li>
              {(facets?.brands ?? []).map((brand) => (
                <li key={brand.id}>
                  <button
                    type="button"
                    className={brandId === brand.id ? 'is-active' : undefined}
                    onClick={() => patchParams({ brandId: String(brand.id) })}
                  >
                    <span>{brand.name}</span>
                    <span className="ml-filter-count">{brand.count}</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>

          <section className="ml-filter-block">
            <h3>Precio</h3>
            <p className="ml-filter-hint">
              {facets
                ? `Catálogo: ${formatPrice(facets.minPrice)} – ${formatPrice(facets.maxPrice)}`
                : 'Cargando…'}
            </p>
            <div className="ml-price-fields">
              <label className="ml-price-field">
                <span>Mínimo</span>
                <input
                  className="form-input"
                  type="number"
                  min={0}
                  inputMode="numeric"
                  placeholder="0"
                  value={minPriceInput}
                  onChange={(e) => setMinPriceInput(e.target.value)}
                />
              </label>
              <label className="ml-price-field">
                <span>Máximo</span>
                <input
                  className="form-input"
                  type="number"
                  min={0}
                  inputMode="numeric"
                  placeholder="Sin límite"
                  value={maxPriceInput}
                  onChange={(e) => setMaxPriceInput(e.target.value)}
                />
              </label>
            </div>
            <button type="button" className="btn btn-secondary btn-sm ml-price-apply" onClick={applyPrice}>
              Aplicar precio
            </button>
          </section>
        </aside>

        <section className="ml-results">
          {isError && <div className="alert alert-error">No se pudo cargar el catálogo</div>}

          {isLoading ? (
            <div className="market-loading">
              <div className="spinner" />
            </div>
          ) : products.length === 0 ? (
            <div className="ml-empty">
              <h2>No hay publicaciones</h2>
              <p>Probá quitando filtros o buscando otro término.</p>
              <button type="button" className="btn btn-primary" onClick={clearAll}>
                Ver todo
              </button>
            </div>
          ) : (
            <>
              <div className="ml-grid">
                {products.map((product) => (
                  <article key={product.productId} className="ml-card">
                    <Link
                      to={`/tienda/producto/${product.productId}`}
                      className="ml-card__media"
                    >
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt="" loading="lazy" />
                      ) : (
                        <div className="ml-card__placeholder">{product.name.slice(0, 1)}</div>
                      )}
                    </Link>
                    <div className="ml-card__body">
                      <Link
                        to={`/tienda/producto/${product.productId}`}
                        className="ml-card__price"
                      >
                        {priceLabel(product)}
                      </Link>
                      <p className="ml-card__ship">
                        {product.totalStock > 5 ? 'Stock disponible' : 'Últimas unidades'}
                      </p>
                      <Link
                        to={`/tienda/producto/${product.productId}`}
                        className="ml-card__name"
                      >
                        {product.name}
                      </Link>
                      <p className="ml-card__meta">
                        {product.brandName} · {product.categoryName}
                      </p>
                      <button
                        type="button"
                        className="ml-card__cta"
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
                totalCount={totalCount}
                totalPages={totalPages}
                onPageChange={(next) => patchParams({ page: String(next) })}
                onPageSizeChange={(size) =>
                  patchParams({ pageSize: String(size), page: '1' })
                }
              />
            </>
          )}
        </section>
      </div>

      {filtersOpen && (
        <button
          type="button"
          className="ml-filters-backdrop"
          aria-label="Cerrar filtros"
          onClick={() => setFiltersOpen(false)}
        />
      )}
    </div>
  )
}
