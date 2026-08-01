import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Fragment, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  deactivateProduct,
  deactivateVariant,
  deleteProduct,
  deleteVariant,
} from '../../../api/catalogMutations'
import { DEFAULT_PAGE_SIZE } from '../../../api/pagination'
import { Can } from '../../../components/auth/Can'
import { DataList } from '../../../components/ui/DataList'
import { PaginationBar } from '../../../components/ui/PaginationBar'
import { RowActions } from '../../../components/ui/RowActions'
import { TypeaheadInput } from '../../../components/ui/TypeaheadInput'
import { useProductsQuery } from '../../../hooks/useCatalogQueries'
import { P } from '../../../lib/permissions'
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

  const { data, isLoading, isError, isFetching } = useProductsQuery({
    search: search || undefined,
    categoryId,
    brandId,
    page,
    pageSize,
  })
  const products = data?.items ?? []

  const invalidate = () => void queryClient.invalidateQueries({ queryKey: ['catalog', 'products'] })

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

  return (
    <div className="page">
      <header className="page-header">
        <h1 className="page-title">Productos</h1>
        <p className="page-subtitle">
          Consulta el catálogo y las existencias. Los productos nuevos se dan de alta al comprar al
          proveedor.
        </p>
      </header>

      <div className="card" style={{ marginBottom: '1.25rem' }}>
        <h2 className="card-title">Alta de productos</h2>
        <p className="page-subtitle" style={{ marginBottom: '0.75rem' }}>
          Primero registre una compra al proveedor. En Compras → Nueva orden puede elegir una
          presentación ya registrada o crear producto + presentación/SKU en la misma línea. Al
          recibir la orden entran las existencias y ya puede vender. Para actualizar o desactivar
          varios productos, use{' '}
          <Link to="/panel/carga-masiva">Carga masiva</Link>.
        </p>
        <Can permission={P.Purchases.Create}>
          <Link to="/compras" className="btn btn-primary">
            Ir a Compras
          </Link>
        </Can>
      </div>

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
        <DataList label="Lista de productos">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Presentaciones</th>
                <th>Categoría</th>
                <th>Marca</th>
                <th>Desde</th>
                <th>Estado</th>
                <th>Acciones</th>
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
                      <td data-label="Nombre">{product.name}</td>
                      <td data-label="Presentaciones">{product.variants?.length ?? 0}</td>
                      <td data-label="Categoría">{product.categoryName ?? '—'}</td>
                      <td data-label="Marca">{product.brandName ?? '—'}</td>
                      <td data-label="Desde">{price == null ? '—' : formatPrice(price)}</td>
                      <td data-label="Estado">
                        <span
                          className={`badge ${product.isActive ? 'badge-success' : 'badge-muted'}`}
                        >
                          {product.isActive ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td data-label="" className="data-table__actions">
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          onClick={() =>
                            setExpandedId((prev) =>
                              prev === product.productId ? null : product.productId,
                            )
                          }
                        >
                          {open ? 'Ocultar' : 'Precios / presentaciones'}
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
                        <td colSpan={7} className="data-table__expand">
                          <div className="card" style={{ margin: '0.5rem 0' }}>
                            <h3 className="card-title">Presentaciones y precios</h3>
                            {(product.variants ?? []).length === 0 ? (
                              <p className="page-subtitle">
                                Sin presentaciones. Agrégalas al crear una compra al proveedor.
                              </p>
                            ) : (
                              <DataList label={`Presentaciones de ${product.name}`}>
                                <table className="data-table">
                                  <thead>
                                    <tr>
                                      <th>SKU</th>
                                      <th>Presentación</th>
                                      <th>P. venta</th>
                                      <th>P. costo</th>
                                      <th>Existencias</th>
                                      <th>Mín.</th>
                                      <th>Código de barras</th>
                                      <th>Acciones</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {product.variants.map((v) => (
                                      <tr key={v.productVariantId}>
                                        <td data-label="SKU">{v.sku}</td>
                                        <td data-label="Presentación">{v.variantName}</td>
                                        <td data-label="P. venta">{formatPrice(v.salePrice)}</td>
                                        <td data-label="P. costo">{formatPrice(v.costPrice)}</td>
                                        <td data-label="Existencias">{v.stockOnHand}</td>
                                        <td data-label="Mín.">{v.reorderLevel}</td>
                                        <td data-label="Código de barras">{v.barcode ?? '—'}</td>
                                        <td data-label="" className="data-table__actions">
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
                              </DataList>
                            )}

                            <p className="page-subtitle" style={{ marginTop: '1rem' }}>
                              Para agregar una presentación o SKU nuevo, use{' '}
                              <Link to="/compras">Compras → Nueva orden</Link> (producto nuevo o
                              nueva presentación de un producto existente). Primero registre la
                              compra al proveedor.
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                )
              })}
            </tbody>
          </table>
        </DataList>
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
