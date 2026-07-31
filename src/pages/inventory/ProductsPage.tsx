import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Fragment, useState, type FormEvent } from 'react'
import {
  createProduct,
  createVariant,
  deactivateProduct,
  deactivateVariant,
  deleteProduct,
  deleteVariant,
} from '../../api/catalogMutations'
import { DEFAULT_PAGE_SIZE } from '../../api/pagination'
import { Can } from '../../components/auth/Can'
import { PaginationBar } from '../../components/ui/PaginationBar'
import { RowActions } from '../../components/ui/RowActions'
import { TypeaheadInput } from '../../components/ui/TypeaheadInput'
import { useProductsQuery } from '../../hooks/useCatalogQueries'
import { P } from '../../lib/permissions'
import type { Product } from '../../types'

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
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)

  const [createName, setCreateName] = useState('')
  const [createCategoryId, setCreateCategoryId] = useState<number | undefined>()
  const [createBrandId, setCreateBrandId] = useState<number | undefined>()
  const [createCategoryLabel, setCreateCategoryLabel] = useState('')
  const [createBrandLabel, setCreateBrandLabel] = useState('')
  const [createError, setCreateError] = useState('')

  const [variantForm, setVariantForm] = useState({
    sku: '',
    variantName: '',
    barcode: '',
    salePrice: '',
    costPrice: '',
    stockOnHand: '0',
    reorderLevel: '5',
  })

  const { data, isLoading, isError, isFetching } = useProductsQuery({
    search: search || undefined,
    categoryId,
    brandId,
    page,
    pageSize,
  })
  const products = data?.items ?? []

  const invalidate = () => void queryClient.invalidateQueries({ queryKey: ['catalog', 'products'] })

  const createMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      invalidate()
      setCreateName('')
      setCreateCategoryId(undefined)
      setCreateBrandId(undefined)
      setCreateCategoryLabel('')
      setCreateBrandLabel('')
      setCreateError('')
    },
    onError: () => setCreateError('No se pudo crear el producto'),
  })

  const variantMutation = useMutation({
    mutationFn: createVariant,
    onSuccess: () => {
      invalidate()
      setVariantForm({
        sku: '',
        variantName: '',
        barcode: '',
        salePrice: '',
        costPrice: '',
        stockOnHand: '0',
        reorderLevel: '5',
      })
    },
  })

  const deactivateProductMutation = useMutation({
    mutationFn: deactivateProduct,
    onSuccess: invalidate,
  })

  const deleteProductMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: invalidate,
  })

  const deactivateVariantMutation = useMutation({
    mutationFn: deactivateVariant,
    onSuccess: invalidate,
  })

  const deleteVariantMutation = useMutation({
    mutationFn: deleteVariant,
    onSuccess: invalidate,
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

  const handleAddVariant = (product: Product) => (e: FormEvent) => {
    e.preventDefault()
    variantMutation.mutate({
      productId: product.productId,
      sku: variantForm.sku,
      variantName: variantForm.variantName,
      barcode: variantForm.barcode || undefined,
      salePrice: Number(variantForm.salePrice),
      costPrice: Number(variantForm.costPrice),
      stockOnHand: Number(variantForm.stockOnHand) || 0,
      reorderLevel: Number(variantForm.reorderLevel) || 0,
    })
  }

  return (
    <div className="page">
      <header className="page-header">
        <h1 className="page-title">Productos</h1>
        <p className="page-subtitle">
          Productos y variantes con precio de venta/costo (Catalog + Inventory)
        </p>
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
              />
            </div>
            <TypeaheadInput
              entity="categories"
              label="Categoría"
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
            Crear producto
          </button>
        </form>
      </Can>

      <div className="page-filters">
        <div className="form-group">
          <label className="form-label" htmlFor="product-search">
            Buscar
          </label>
          <input
            id="product-search"
            type="search"
            className="form-input"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
          />
        </div>
        <TypeaheadInput
          entity="categories"
          label="Categoría"
          valueLabel={categoryLabel}
          onSelect={(item) => {
            setCategoryId(item.id)
            setCategoryLabel(item.label)
            setPage(1)
          }}
          onClear={() => {
            setCategoryId(undefined)
            setCategoryLabel('')
            setPage(1)
          }}
        />
        <TypeaheadInput
          entity="brands"
          label="Marca"
          valueLabel={brandLabel}
          onSelect={(item) => {
            setBrandId(item.id)
            setBrandLabel(item.label)
            setPage(1)
          }}
          onClear={() => {
            setBrandId(undefined)
            setBrandLabel('')
            setPage(1)
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
                <th />
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const price =
                  product.variants?.length > 0
                    ? Math.min(...product.variants.map((v) => v.salePrice))
                    : null
                const open = expandedId === product.productId
                return (
                  <Fragment key={product.productId}>
                    <tr>
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
                      <td>
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          onClick={() =>
                            setExpandedId((prev) =>
                              prev === product.productId ? null : product.productId,
                            )
                          }
                        >
                          {open ? 'Ocultar' : 'Precios / variantes'}
                        </button>
                        <Can permission={P.Catalog.Delete}>
                          <RowActions
                            isActive={product.isActive}
                            onDeactivate={() => deactivateProductMutation.mutate(product.productId)}
                            onDelete={() => deleteProductMutation.mutate(product.productId)}
                            deactivatePending={deactivateProductMutation.isPending}
                            deletePending={deleteProductMutation.isPending}
                          />
                        </Can>
                      </td>
                    </tr>
                    {open && (
                      <tr>
                        <td colSpan={7}>
                          <div className="card" style={{ margin: '0.5rem 0' }}>
                            <h3 className="card-title">Variantes y precios</h3>
                            {(product.variants ?? []).length === 0 ? (
                              <p className="page-subtitle">Sin variantes. Agrega precio y stock.</p>
                            ) : (
                              <table className="data-table">
                                <thead>
                                  <tr>
                                    <th>SKU</th>
                                    <th>Variante</th>
                                    <th>P. venta</th>
                                    <th>P. costo</th>
                                    <th>Stock</th>
                                    <th>Mín.</th>
                                    <th>Barcode</th>
                                    <th />
                                  </tr>
                                </thead>
                                <tbody>
                                  {product.variants.map((v) => (
                                    <tr key={v.productVariantId}>
                                      <td>{v.sku}</td>
                                      <td>{v.variantName}</td>
                                      <td>{formatPrice(v.salePrice)}</td>
                                      <td>{formatPrice(v.costPrice)}</td>
                                      <td>{v.stockOnHand}</td>
                                      <td>{v.reorderLevel}</td>
                                      <td>{v.barcode ?? '—'}</td>
                                      <td>
                                        <Can permission={P.Inventory.Delete}>
                                          <RowActions
                                            isActive={v.isActive}
                                            onDeactivate={() =>
                                              deactivateVariantMutation.mutate(v.productVariantId)
                                            }
                                            onDelete={() =>
                                              deleteVariantMutation.mutate(v.productVariantId)
                                            }
                                            deactivatePending={deactivateVariantMutation.isPending}
                                            deletePending={deleteVariantMutation.isPending}
                                          />
                                        </Can>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            )}

                            <Can permission={P.Inventory.Create}>
                              <form
                                onSubmit={handleAddVariant(product)}
                                style={{ marginTop: '1rem' }}
                              >
                                <h4 className="card-title">Agregar variante / precio</h4>
                                <div className="page-filters">
                                  <div className="form-group">
                                    <label className="form-label">SKU</label>
                                    <input
                                      className="form-input"
                                      required
                                      value={variantForm.sku}
                                      onChange={(e) =>
                                        setVariantForm((f) => ({ ...f, sku: e.target.value }))
                                      }
                                    />
                                  </div>
                                  <div className="form-group">
                                    <label className="form-label">Nombre variante</label>
                                    <input
                                      className="form-input"
                                      required
                                      value={variantForm.variantName}
                                      onChange={(e) =>
                                        setVariantForm((f) => ({
                                          ...f,
                                          variantName: e.target.value,
                                        }))
                                      }
                                    />
                                  </div>
                                  <div className="form-group">
                                    <label className="form-label">Precio venta</label>
                                    <input
                                      type="number"
                                      min={0}
                                      step="0.01"
                                      className="form-input"
                                      required
                                      value={variantForm.salePrice}
                                      onChange={(e) =>
                                        setVariantForm((f) => ({
                                          ...f,
                                          salePrice: e.target.value,
                                        }))
                                      }
                                    />
                                  </div>
                                  <div className="form-group">
                                    <label className="form-label">Precio costo</label>
                                    <input
                                      type="number"
                                      min={0}
                                      step="0.01"
                                      className="form-input"
                                      required
                                      value={variantForm.costPrice}
                                      onChange={(e) =>
                                        setVariantForm((f) => ({
                                          ...f,
                                          costPrice: e.target.value,
                                        }))
                                      }
                                    />
                                  </div>
                                  <div className="form-group">
                                    <label className="form-label">Stock</label>
                                    <input
                                      type="number"
                                      min={0}
                                      className="form-input"
                                      value={variantForm.stockOnHand}
                                      onChange={(e) =>
                                        setVariantForm((f) => ({
                                          ...f,
                                          stockOnHand: e.target.value,
                                        }))
                                      }
                                    />
                                  </div>
                                  <div className="form-group">
                                    <label className="form-label">Stock mínimo</label>
                                    <input
                                      type="number"
                                      min={0}
                                      className="form-input"
                                      value={variantForm.reorderLevel}
                                      onChange={(e) =>
                                        setVariantForm((f) => ({
                                          ...f,
                                          reorderLevel: e.target.value,
                                        }))
                                      }
                                    />
                                  </div>
                                  <div className="form-group">
                                    <label className="form-label">Código barras</label>
                                    <input
                                      className="form-input"
                                      value={variantForm.barcode}
                                      onChange={(e) =>
                                        setVariantForm((f) => ({
                                          ...f,
                                          barcode: e.target.value,
                                        }))
                                      }
                                    />
                                  </div>
                                </div>
                                <button
                                  type="submit"
                                  className="btn btn-primary"
                                  disabled={variantMutation.isPending}
                                >
                                  Guardar variante
                                </button>
                              </form>
                            </Can>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
      {data && (
        <PaginationBar
          page={data.page}
          pageSize={data.pageSize}
          totalCount={data.totalCount}
          totalPages={data.totalPages}
          isFetching={isFetching}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size)
            setPage(1)
          }}
        />
      )}
    </div>
  )
}
