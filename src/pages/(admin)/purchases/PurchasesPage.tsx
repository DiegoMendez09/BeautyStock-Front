import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Fragment, useMemo, useState, type FormEvent } from 'react'
import {
  createPurchaseOrder,
  createSupplier,
  deactivateSupplier,
  deleteSupplier,
  getPurchaseOrders,
  getSuppliers,
  receivePurchaseOrder,
  type PurchaseOrder,
} from '../../../api/modules'
import { DEFAULT_PAGE_SIZE } from '../../../api/pagination'
import { Can } from '../../../components/auth/Can'
import { PaginationBar } from '../../../components/ui/PaginationBar'
import { RowActions } from '../../../components/ui/RowActions'
import { TypeaheadInput } from '../../../components/ui/TypeaheadInput'
import { P } from '../../../lib/permissions'

type Tab = 'orders' | 'new-order' | 'suppliers'

/** Cómo se elige qué se compra en la línea. */
type LineMode = 'existing' | 'new-product' | 'new-presentation'

type DraftLine = {
  key: string
  mode: LineMode
  productVariantId?: number
  label: string
  productId?: number
  productLabel: string
  categoryId?: number
  categoryLabel: string
  brandId?: number
  brandLabel: string
  productName: string
  sku: string
  presentationName: string
  presentationValue: string
  salePrice: string
  quantity: string
  unitCost: string
}

function formatPrice(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(value)
}

function statusBadge(status: string) {
  if (status === 'Received') return 'badge badge-success'
  if (status === 'Ordered') return 'badge badge-warning'
  return 'badge badge-muted'
}

function statusLabel(status: string) {
  if (status === 'Received') return 'Recibida'
  if (status === 'Ordered') return 'Pendiente'
  return status
}

function emptyLine(): DraftLine {
  return {
    key: crypto.randomUUID(),
    mode: 'existing',
    productVariantId: undefined,
    label: '',
    productId: undefined,
    productLabel: '',
    categoryId: undefined,
    categoryLabel: '',
    brandId: undefined,
    brandLabel: '',
    productName: '',
    sku: '',
    presentationName: '',
    presentationValue: '',
    salePrice: '',
    quantity: '1',
    unitCost: '',
  }
}

function isLineReady(line: DraftLine): boolean {
  if (Number(line.quantity) <= 0) return false
  if (line.mode === 'existing') return Boolean(line.productVariantId)
  if (!line.sku.trim() || !line.presentationName.trim()) return false
  if (line.mode === 'new-product') {
    return Boolean(line.categoryId && line.brandId && line.productName.trim())
  }
  return Boolean(line.productId)
}

export function PurchasesPage() {
  const queryClient = useQueryClient()
  const [tab, setTab] = useState<Tab>('orders')
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [statusFilter, setStatusFilter] = useState('')

  const [supplierPage, setSupplierPage] = useState(1)
  const [supplierPageSize, setSupplierPageSize] = useState(DEFAULT_PAGE_SIZE)
  const { data: supplierData, isFetching: suppliersFetching } = useQuery({
    queryKey: ['purchases', 'suppliers', { page: supplierPage, pageSize: supplierPageSize }],
    queryFn: () => getSuppliers({ page: supplierPage, pageSize: supplierPageSize }),
    placeholderData: keepPreviousData,
  })
  const suppliers = supplierData?.items ?? []

  const [orderPage, setOrderPage] = useState(1)
  const [orderPageSize, setOrderPageSize] = useState(DEFAULT_PAGE_SIZE)
  const { data: orderData, isLoading, isFetching: ordersFetching } = useQuery({
    queryKey: ['purchases', 'orders', { page: orderPage, pageSize: orderPageSize, status: statusFilter }],
    queryFn: () =>
      getPurchaseOrders({
        page: orderPage,
        pageSize: orderPageSize,
        status: statusFilter || undefined,
      }),
    placeholderData: keepPreviousData,
  })
  const orders = orderData?.items ?? []

  const { data: pendingData } = useQuery({
    queryKey: ['purchases', 'orders', 'pending-kpi'],
    queryFn: () => getPurchaseOrders({ page: 1, pageSize: 100, status: 'Ordered' }),
  })

  const [supplierName, setSupplierName] = useState('')
  const [supplierEmail, setSupplierEmail] = useState('')
  const [supplierPhone, setSupplierPhone] = useState('')
  const [orderSupplierId, setOrderSupplierId] = useState<number | undefined>()
  const [orderNotes, setOrderNotes] = useState('')
  const [lines, setLines] = useState<DraftLine[]>([emptyLine()])
  const [orderError, setOrderError] = useState('')

  const invalidateSuppliers = () =>
    void queryClient.invalidateQueries({ queryKey: ['purchases', 'suppliers'] })
  const invalidateOrders = () =>
    void queryClient.invalidateQueries({ queryKey: ['purchases', 'orders'] })

  const pendingCount = pendingData?.totalCount ?? 0
  const pendingTotal = useMemo(
    () => (pendingData?.items ?? []).reduce((sum, o) => sum + o.totalAmount, 0),
    [pendingData],
  )

  const createSupplierMutation = useMutation({
    mutationFn: createSupplier,
    onSuccess: () => {
      invalidateSuppliers()
      setSupplierName('')
      setSupplierEmail('')
      setSupplierPhone('')
    },
  })

  const deactivateSupplierMutation = useMutation({
    mutationFn: deactivateSupplier,
    onSuccess: invalidateSuppliers,
  })

  const deleteSupplierMutation = useMutation({
    mutationFn: deleteSupplier,
    onSuccess: invalidateSuppliers,
  })

  const createOrderMutation = useMutation({
    mutationFn: createPurchaseOrder,
    onSuccess: () => {
      invalidateOrders()
      void queryClient.invalidateQueries({ queryKey: ['catalog', 'products'] })
      setLines([emptyLine()])
      setOrderNotes('')
      setOrderError('')
      setTab('orders')
    },
    onError: (err) => {
      setOrderError(err instanceof Error ? err.message : 'No se pudo crear la orden')
    },
  })

  const receiveMutation = useMutation({
    mutationFn: receivePurchaseOrder,
    onSuccess: () => {
      invalidateOrders()
      void queryClient.invalidateQueries({ queryKey: ['catalog', 'products'] })
    },
  })

  const handleSupplier = (e: FormEvent) => {
    e.preventDefault()
    createSupplierMutation.mutate({
      legalName: supplierName,
      email: supplierEmail || undefined,
      phone: supplierPhone || undefined,
    })
  }

  const updateLine = (key: string, patch: Partial<DraftLine>) => {
    setLines((prev) => prev.map((l) => (l.key === key ? { ...l, ...patch } : l)))
  }

  const handleOrder = (e: FormEvent) => {
    e.preventDefault()
    setOrderError('')
    if (!orderSupplierId) {
      setOrderError('Selecciona un proveedor')
      return
    }
    const validLines = lines.filter(isLineReady)
    if (validLines.length === 0) {
      setOrderError('Agrega al menos una línea con producto/presentación y cantidad')
      return
    }
    createOrderMutation.mutate({
      supplierId: orderSupplierId,
      notes: orderNotes || undefined,
      lines: validLines.map((l) => {
        const base = {
          quantity: Number(l.quantity) || 1,
          unitCost: Number(l.unitCost) || 0,
        }
        if (l.mode === 'existing') {
          return { ...base, productVariantId: l.productVariantId! }
        }
        if (l.mode === 'new-presentation') {
          return {
            ...base,
            newItem: {
              productId: l.productId!,
              sku: l.sku.trim(),
              presentationName: l.presentationName.trim(),
              presentationValue: l.presentationValue.trim() || undefined,
              salePrice: Number(l.salePrice) || 0,
              barcode: undefined,
            },
          }
        }
        return {
          ...base,
          newItem: {
            categoryId: l.categoryId!,
            brandId: l.brandId!,
            productName: l.productName.trim(),
            sku: l.sku.trim(),
            presentationName: l.presentationName.trim(),
            presentationValue: l.presentationValue.trim() || undefined,
            salePrice: Number(l.salePrice) || 0,
          },
        }
      }),
    })
  }

  const renderOrderLines = (order: PurchaseOrder) => (
    <tr>
      <td colSpan={6} style={{ background: 'var(--color-surface-muted)', padding: '1rem' }}>
        <div className="card" style={{ margin: 0, boxShadow: 'none' }}>
          <h3 className="card-title" style={{ fontSize: '1rem' }}>
            Líneas de {order.orderNumber}
          </h3>
          {(order.lines?.length ?? 0) === 0 ? (
            <p className="page-subtitle">Sin líneas</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Presentación</th>
                  <th>Cantidad</th>
                  <th>Costo unit.</th>
                  <th>Total línea</th>
                </tr>
              </thead>
              <tbody>
                {order.lines.map((line) => (
                  <tr key={line.purchaseOrderLineId}>
                    <td>{line.sku}</td>
                    <td>{line.variantName}</td>
                    <td>{line.quantity}</td>
                    <td>{formatPrice(line.unitCost)}</td>
                    <td>{formatPrice(line.lineTotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {order.notes && (
            <p className="page-subtitle" style={{ marginTop: '0.75rem' }}>
              Notas: {order.notes}
            </p>
          )}
        </div>
      </td>
    </tr>
  )

  return (
    <div className="page">
      <header className="page-header">
        <h1 className="page-title">Compras a proveedores</h1>
        <p className="page-subtitle">
          Flujo: compra al proveedor → recibes existencias de esa presentación/SKU → luego puedes
          vender. Los productos nuevos se registran aquí, no desde Inventario.
        </p>
      </header>

      <div className="kpi-grid" style={{ marginBottom: '1.25rem' }}>
        <div className="kpi-card">
          <div className="kpi-label">Órdenes pendientes</div>
          <div className="kpi-value">{pendingCount}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Valor pendiente</div>
          <div className="kpi-value">{formatPrice(pendingTotal)}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Proveedores activos</div>
          <div className="kpi-value">
            {suppliers.filter((s) => s.isActive).length}
            {supplierData && supplierData.totalPages > 1 ? '+' : ''}
          </div>
        </div>
      </div>

      <div className="tabs" role="tablist" aria-label="Secciones de compras">
        <button
          type="button"
          role="tab"
          className={`tab${tab === 'orders' ? ' tab--active' : ''}`}
          aria-selected={tab === 'orders'}
          onClick={() => setTab('orders')}
        >
          Órdenes
        </button>
        <Can permission={P.Purchases.Create}>
          <button
            type="button"
            role="tab"
            className={`tab${tab === 'new-order' ? ' tab--active' : ''}`}
            aria-selected={tab === 'new-order'}
            onClick={() => setTab('new-order')}
          >
            Nueva orden
          </button>
        </Can>
        <button
          type="button"
          role="tab"
          className={`tab${tab === 'suppliers' ? ' tab--active' : ''}`}
          aria-selected={tab === 'suppliers'}
          onClick={() => setTab('suppliers')}
        >
          Proveedores
        </button>
      </div>

      {tab === 'orders' && (
        <>
          <div className="page-filters" style={{ marginBottom: '1rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="po-status">
                Estado
              </label>
              <select
                id="po-status"
                className="form-input"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value)
                  setOrderPage(1)
                }}
              >
                <option value="">Todas</option>
                <option value="Ordered">Pendientes</option>
                <option value="Received">Recibidas</option>
              </select>
            </div>
          </div>

          {isLoading ? (
            <div className="loading-screen" style={{ minHeight: 160 }}>
              <div className="spinner" />
            </div>
          ) : orders.length === 0 ? (
            <div className="empty-state">No hay órdenes de compra</div>
          ) : (
            <>
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Orden</th>
                      <th>Proveedor</th>
                      <th>Estado</th>
                      <th>Total</th>
                      <th>Fecha</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => {
                      const open = expandedId === order.purchaseOrderId
                      return (
                        <Fragment key={order.purchaseOrderId}>
                          <tr>
                            <td>{order.orderNumber}</td>
                            <td>{order.supplierName}</td>
                            <td>
                              <span className={statusBadge(order.status)}>
                                {statusLabel(order.status)}
                              </span>
                            </td>
                            <td>{formatPrice(order.totalAmount)}</td>
                            <td>{new Date(order.orderedAt).toLocaleString('es-PE')}</td>
                            <td style={{ whiteSpace: 'nowrap' }}>
                              <button
                                type="button"
                                className="btn btn-ghost btn-sm"
                                onClick={() =>
                                  setExpandedId(open ? null : order.purchaseOrderId)
                                }
                              >
                                {open ? 'Ocultar' : 'Ver líneas'}
                              </button>
                              <Can permission={P.Purchases.Update}>
                                {order.status === 'Ordered' && (
                                  <button
                                    type="button"
                                    className="btn btn-primary btn-sm"
                                    style={{ marginLeft: '0.35rem' }}
                                    disabled={receiveMutation.isPending}
                                    onClick={() => receiveMutation.mutate(order.purchaseOrderId)}
                                  >
                                    Recibir existencias
                                  </button>
                                )}
                              </Can>
                            </td>
                          </tr>
                          {open && renderOrderLines(order)}
                        </Fragment>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              {orderData && (
                <PaginationBar
                  page={orderData.page}
                  pageSize={orderData.pageSize}
                  totalCount={orderData.totalCount}
                  totalPages={orderData.totalPages}
                  isFetching={ordersFetching}
                  onPageChange={setOrderPage}
                  onPageSizeChange={(size) => {
                    setOrderPageSize(size)
                    setOrderPage(1)
                  }}
                />
              )}
            </>
          )}
        </>
      )}

      {tab === 'new-order' && (
        <Can permission={P.Purchases.Create}>
          <form className="card" onSubmit={handleOrder}>
            <h2 className="card-title">Nueva orden de compra</h2>
            <p className="page-subtitle" style={{ marginBottom: '0.5rem' }}>
              Compras una unidad vendible concreta (producto + presentación + SKU). Al pulsar
              «Recibir existencias» aumenta el inventario de esa unidad. Si el producto aún no existe,
              créalo aquí dentro de la línea.
            </p>
            <p className="page-subtitle" style={{ marginBottom: '1rem' }}>
              Presentación = tamaño, color u otra forma de vender el mismo producto (ej. 50 ml,
              tono 01).
            </p>
            {orderError && <div className="alert alert-error">{orderError}</div>}

            <div className="page-filters">
              <div className="form-group">
                <label className="form-label">Proveedor</label>
                <select
                  className="form-input"
                  required
                  value={orderSupplierId ?? ''}
                  onChange={(e) => setOrderSupplierId(Number(e.target.value) || undefined)}
                >
                  <option value="">Seleccionar…</option>
                  {suppliers
                    .filter((s) => s.isActive)
                    .map((s) => (
                      <option key={s.supplierId} value={s.supplierId}>
                        {s.legalName}
                      </option>
                    ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Notas (opcional)</label>
                <input
                  className="form-input"
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  placeholder="Factura, referencia…"
                />
              </div>
            </div>

            <h3 className="card-title" style={{ fontSize: '1rem', marginTop: '1rem' }}>
              Qué compras
            </h3>
            {lines.map((line, index) => (
              <div
                key={line.key}
                className="card"
                style={{
                  marginBottom: '0.75rem',
                  boxShadow: 'none',
                  border: '1px solid var(--color-border)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '0.75rem',
                  }}
                >
                  <strong style={{ fontSize: '0.95rem' }}>Línea {index + 1}</strong>
                  {lines.length > 1 && (
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => setLines((prev) => prev.filter((l) => l.key !== line.key))}
                    >
                      Quitar
                    </button>
                  )}
                </div>

                <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                  <label className="form-label" htmlFor={`line-mode-${line.key}`}>
                    Tipo de línea
                  </label>
                  <select
                    id={`line-mode-${line.key}`}
                    className="form-input"
                    value={line.mode}
                    onChange={(e) =>
                      updateLine(line.key, {
                        mode: e.target.value as LineMode,
                        productVariantId: undefined,
                        label: '',
                        productId: undefined,
                        productLabel: '',
                      })
                    }
                  >
                    <option value="existing">Buscar presentación / SKU ya registrado</option>
                    <option value="new-product">Producto nuevo (entra con esta compra)</option>
                    <option value="new-presentation">
                      Nueva presentación de un producto ya registrado
                    </option>
                  </select>
                </div>

                {line.mode === 'existing' && (
                  <TypeaheadInput
                    entity="product-variants"
                    label="Producto · presentación · SKU"
                    placeholder="Buscar por nombre, tamaño o SKU…"
                    minLength={1}
                    valueLabel={line.label}
                    onSelect={(item) => {
                      const secondary = item.secondary ? ` · ${item.secondary}` : ''
                      updateLine(line.key, {
                        productVariantId: item.id,
                        label: `${item.label}${secondary}`,
                      })
                    }}
                    onClear={() =>
                      updateLine(line.key, { productVariantId: undefined, label: '' })
                    }
                  />
                )}

                {line.mode === 'new-product' && (
                  <div className="page-filters">
                    <TypeaheadInput
                      entity="categories"
                      label="Categoría"
                      valueLabel={line.categoryLabel}
                      onSelect={(item) =>
                        updateLine(line.key, {
                          categoryId: item.id,
                          categoryLabel: item.label,
                        })
                      }
                      onClear={() =>
                        updateLine(line.key, { categoryId: undefined, categoryLabel: '' })
                      }
                    />
                    <TypeaheadInput
                      entity="brands"
                      label="Marca"
                      valueLabel={line.brandLabel}
                      onSelect={(item) =>
                        updateLine(line.key, { brandId: item.id, brandLabel: item.label })
                      }
                      onClear={() =>
                        updateLine(line.key, { brandId: undefined, brandLabel: '' })
                      }
                    />
                    <div className="form-group">
                      <label className="form-label">Nombre del producto</label>
                      <input
                        className="form-input"
                        required
                        value={line.productName}
                        onChange={(e) => updateLine(line.key, { productName: e.target.value })}
                        placeholder="Ej. Crema hidratante"
                      />
                    </div>
                  </div>
                )}

                {line.mode === 'new-presentation' && (
                  <TypeaheadInput
                    entity="products"
                    label="Producto existente"
                    placeholder="Buscar producto…"
                    minLength={1}
                    valueLabel={line.productLabel}
                    onSelect={(item) =>
                      updateLine(line.key, {
                        productId: item.id,
                        productLabel: item.label,
                      })
                    }
                    onClear={() =>
                      updateLine(line.key, { productId: undefined, productLabel: '' })
                    }
                  />
                )}

                {(line.mode === 'new-product' || line.mode === 'new-presentation') && (
                  <div className="page-filters" style={{ marginTop: '0.5rem' }}>
                    <div className="form-group">
                      <label className="form-label">Presentación (tamaño / color)</label>
                      <input
                        className="form-input"
                        required
                        value={line.presentationName}
                        onChange={(e) =>
                          updateLine(line.key, { presentationName: e.target.value })
                        }
                        placeholder="Ej. 50 ml, tono 01"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Detalle (opcional)</label>
                      <input
                        className="form-input"
                        value={line.presentationValue}
                        onChange={(e) =>
                          updateLine(line.key, { presentationValue: e.target.value })
                        }
                        placeholder="Valor corto, ej. 50ml"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">SKU</label>
                      <input
                        className="form-input"
                        required
                        value={line.sku}
                        onChange={(e) => updateLine(line.key, { sku: e.target.value })}
                        placeholder="Código único"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Precio de venta</label>
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        className="form-input"
                        required
                        value={line.salePrice}
                        onChange={(e) => updateLine(line.key, { salePrice: e.target.value })}
                      />
                    </div>
                  </div>
                )}

                <div className="page-filters" style={{ marginTop: '0.5rem' }}>
                  <div className="form-group">
                    <label className="form-label">Cantidad</label>
                    <input
                      type="number"
                      min={1}
                      className="form-input"
                      value={line.quantity}
                      onChange={(e) => updateLine(line.key, { quantity: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Costo unitario (compra)</label>
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      className="form-input"
                      required
                      value={line.unitCost}
                      onChange={(e) => updateLine(line.key, { unitCost: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            ))}

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setLines((prev) => [...prev, emptyLine()])}
              >
                Agregar línea
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={createOrderMutation.isPending}
              >
                {createOrderMutation.isPending ? 'Creando…' : 'Crear orden'}
              </button>
            </div>
          </form>
        </Can>
      )}

      {tab === 'suppliers' && (
        <>
          <Can permission={P.Purchases.Create}>
            <form className="card" onSubmit={handleSupplier} style={{ marginBottom: '1.25rem' }}>
              <h2 className="card-title">Nuevo proveedor</h2>
              <div className="page-filters">
                <div className="form-group">
                  <label className="form-label">Razón social</label>
                  <input
                    className="form-input"
                    required
                    value={supplierName}
                    onChange={(e) => setSupplierName(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Correo</label>
                  <input
                    type="email"
                    className="form-input"
                    value={supplierEmail}
                    onChange={(e) => setSupplierEmail(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Teléfono</label>
                  <input
                    className="form-input"
                    value={supplierPhone}
                    onChange={(e) => setSupplierPhone(e.target.value)}
                  />
                </div>
              </div>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={createSupplierMutation.isPending}
                style={{ marginTop: '0.75rem' }}
              >
                Crear proveedor
              </button>
            </form>
          </Can>

          <div className="table-wrapper" style={{ marginBottom: '0.5rem' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Razón social</th>
                  <th>Correo</th>
                  <th>Teléfono</th>
                  <th>Estado</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {suppliers.map((supplier) => (
                  <tr key={supplier.supplierId}>
                    <td>{supplier.legalName}</td>
                    <td>{supplier.email ?? '—'}</td>
                    <td>{supplier.phone ?? '—'}</td>
                    <td>
                      <span
                        className={`badge ${supplier.isActive ? 'badge-success' : 'badge-muted'}`}
                      >
                        {supplier.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td>
                      <Can permission={P.Purchases.Delete}>
                        <RowActions
                          isActive={supplier.isActive}
                          onDeactivate={() =>
                            deactivateSupplierMutation.mutate(supplier.supplierId)
                          }
                          onDelete={() => deleteSupplierMutation.mutate(supplier.supplierId)}
                          deactivatePending={deactivateSupplierMutation.isPending}
                          deletePending={deleteSupplierMutation.isPending}
                        />
                      </Can>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {supplierData && (
            <PaginationBar
              page={supplierData.page}
              pageSize={supplierData.pageSize}
              totalCount={supplierData.totalCount}
              totalPages={supplierData.totalPages}
              isFetching={suppliersFetching}
              onPageChange={setSupplierPage}
              onPageSizeChange={(size) => {
                setSupplierPageSize(size)
                setSupplierPage(1)
              }}
            />
          )}
        </>
      )}
    </div>
  )
}
