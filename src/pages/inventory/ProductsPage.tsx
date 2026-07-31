import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { createProduct } from '../../api/catalogMutations'
import { Can } from '../../components/auth/Can'
import { TypeaheadInput } from '../../components/ui/TypeaheadInput'
import { useProductsQuery } from '../../hooks/useCatalogQueries'
import { P } from '../../lib/permissions'

function formatPrice(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(value)
}

export function ProductsPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [categoryId, setCategoryId] = useState<number | undefined>()
  const [brandId, setBrandId] = useState<number | undefined>()
  const [categoryLabel, setCategoryLabel] = useState('')
  const [brandLabel, setBrandLabel] = useState('')

  const [createName, setCreateName] = useState('')
  const [createCategoryId, setCreateCategoryId] = useState<number | undefined>()
  const [createBrandId, setCreateBrandId] = useState<number | undefined>()
  const [createCategoryLabel, setCreateCategoryLabel] = useState('')
  const [createBrandLabel, setCreateBrandLabel] = useState('')
  const [createError, setCreateError] = useState('')

  const { data: products = [], isLoading, isError } = useProductsQuery({
    search: search || undefined,
    categoryId,
    brandId,
  })

  const createMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['catalog', 'products'] })
      setCreateName('')
      setCreateCategoryId(undefined)
      setCreateBrandId(undefined)
      setCreateCategoryLabel('')
      setCreateBrandLabel('')
      setCreateError('')
    },
    onError: () => setCreateError('No se pudo crear el producto'),
  })

  const handleCreate = (e: FormEvent) => {
    e.preventDefault()
    if (!createCategoryId || !createBrandId) {
      setCreateError('Selecciona categoría y marca')
      return
    }
    createMutation.mutate({
      name: createName,
      categoryId: createCategoryId,
      brandId: createBrandId,
    })
  }

  return (
    <div className="page">
      <header className="page-header">
        <h1 className="page-title">Productos</h1>
        <p className="page-subtitle">Catálogo de productos del inventario</p>
      </header>

      <Can permission={P.Catalog.Create}>
        <form className="card" onSubmit={handleCreate} style={{ marginBottom: '1.25rem' }}>
          <h2 className="card-title">Nuevo producto</h2>
          {createError && <div className="alert alert-error">{createError}</div>}
          <div className="page-filters">
            <div className="form-group">
              <label className="form-label">Nombre</label>
              <input
                className="form-input"
                required
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                placeholder="Ej. Serum vitamina C"
              />
            </div>
            <TypeaheadInput
              entity="categories"
              label="Categoría"
              placeholder="Buscar categoría..."
              valueLabel={createCategoryLabel}
              onSelect={(item) => {
                setCreateCategoryId(item.id)
                setCreateCategoryLabel(item.label)
              }}
              onClear={() => {
                setCreateCategoryId(undefined)
                setCreateCategoryLabel('')
              }}
            />
            <TypeaheadInput
              entity="brands"
              label="Marca"
              placeholder="Buscar marca..."
              valueLabel={createBrandLabel}
              onSelect={(item) => {
                setCreateBrandId(item.id)
                setCreateBrandLabel(item.label)
              }}
              onClear={() => {
                setCreateBrandId(undefined)
                setCreateBrandLabel('')
              }}
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={createMutation.isPending}>
            {createMutation.isPending ? 'Creando...' : 'Crear producto'}
          </button>
        </form>
      </Can>

      <div className="page-filters">
        <div className="form-group">
          <label className="form-label" htmlFor="product-search">
            Buscar producto
          </label>
          <input
            id="product-search"
            type="search"
            className="form-input"
            placeholder="Nombre del producto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <TypeaheadInput
          entity="categories"
          label="Categoría"
          placeholder="Filtrar por categoría..."
          valueLabel={categoryLabel}
          onSelect={(item) => {
            setCategoryId(item.id)
            setCategoryLabel(item.label)
          }}
          onClear={() => {
            setCategoryId(undefined)
            setCategoryLabel('')
          }}
        />
        <TypeaheadInput
          entity="brands"
          label="Marca"
          placeholder="Filtrar por marca..."
          valueLabel={brandLabel}
          onSelect={(item) => {
            setBrandId(item.id)
            setBrandLabel(item.label)
          }}
          onClear={() => {
            setBrandId(undefined)
            setBrandLabel('')
          }}
        />
      </div>

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
