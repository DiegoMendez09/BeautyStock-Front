import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { Fragment, useState } from 'react'
import { getSuppliers, getTraceabilityReport } from '../../../api/modules'
import { Can } from '../../../components/auth/Can'
import { TypeaheadInput } from '../../../components/ui/TypeaheadInput'
import { P } from '../../../lib/permissions'

function formatPrice(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(value)
}

export function TraceabilityPage() {
  const [variantId, setVariantId] = useState<number | undefined>()
  const [variantLabel, setVariantLabel] = useState('')
  const [supplierId, setSupplierId] = useState<number | undefined>()
  const [expandedId, setExpandedId] = useState<number | null>(null)

  const { data: supplierData } = useQuery({
    queryKey: ['purchases', 'suppliers', { page: 1, pageSize: 100 }],
    queryFn: () => getSuppliers({ page: 1, pageSize: 100 }),
    placeholderData: keepPreviousData,
  })
  const suppliers = (supplierData?.items ?? []).filter((s) => s.isActive)

  const { data, isLoading, isError, isFetching, refetch } = useQuery({
    queryKey: ['reports', 'traceability', { variantId, supplierId }],
    queryFn: () =>
      getTraceabilityReport({
        productVariantId: variantId,
        supplierId,
      }),
  })

  const items = data?.items ?? []

  return (
    <Can
      permission={P.Reports.View}
      fallback={
        <div className="page">
          <div className="alert alert-error">No tienes permiso para ver la trazabilidad</div>
        </div>
      }
    >
    <div className="page">
      <header className="page-header">
        <h1 className="page-title">Trazabilidad compra → venta</h1>
        <p className="page-subtitle">
          Qué se compró a proveedores, qué queda en stock y qué se vendió (por variante)
        </p>
      </header>

      <div className="kpi-grid" style={{ marginBottom: '1.25rem' }}>
        <div className="kpi-card">
          <div className="kpi-label">Comprado (recibido)</div>
          <div className="kpi-value">{data?.totalPurchased ?? '—'}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Vendido</div>
          <div className="kpi-value">{data?.totalSold ?? '—'}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Stock actual</div>
          <div className="kpi-value">{data?.totalStockOnHand ?? '—'}</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '1.25rem' }}>
        <h2 className="card-title">Filtros</h2>
        <div className="page-filters">
          <TypeaheadInput
            entity="product-variants"
            label="Variante (opcional)"
            minLength={1}
            valueLabel={variantLabel}
            onSelect={(item) => {
              setVariantId(item.id)
              setVariantLabel(item.label)
            }}
            onClear={() => {
              setVariantId(undefined)
              setVariantLabel('')
            }}
          />
          <div className="form-group">
            <label className="form-label" htmlFor="trace-supplier">
              Proveedor (opcional)
            </label>
            <select
              id="trace-supplier"
              className="form-input"
              value={supplierId ?? ''}
              onChange={(e) => setSupplierId(Number(e.target.value) || undefined)}
            >
              <option value="">Todos</option>
              {suppliers.map((s) => (
                <option key={s.supplierId} value={s.supplierId}>
                  {s.legalName}
                </option>
              ))}
            </select>
          </div>
        </div>
        <button
          type="button"
          className="btn btn-secondary"
          style={{ marginTop: '0.75rem' }}
          onClick={() => void refetch()}
          disabled={isFetching}
        >
          {isFetching ? 'Actualizando…' : 'Actualizar'}
        </button>
      </div>

      {isError && (
        <div className="alert alert-error">No se pudo cargar la trazabilidad</div>
      )}

      {isLoading ? (
        <div className="loading-screen" style={{ minHeight: 160 }}>
          <div className="spinner" />
        </div>
      ) : items.length === 0 ? (
        <div className="empty-state">
          No hay movimientos de compra/venta para los filtros seleccionados
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>SKU</th>
                <th>Comprado</th>
                <th>Vendido</th>
                <th>Stock</th>
                <th>Saldo compra</th>
                <th>Costo compras</th>
                <th>Ingresos ventas</th>
                <th>Proveedores</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const open = expandedId === item.productVariantId
                const balanceClass =
                  item.purchaseBalance < 0
                    ? 'badge badge-warning'
                    : item.purchaseBalance === item.stockOnHand
                      ? 'badge badge-success'
                      : 'badge badge-muted'
                return (
                  <Fragment key={item.productVariantId}>
                    <tr>
                      <td>
                        {item.productName} — {item.variantName}
                      </td>
                      <td>{item.sku}</td>
                      <td>{item.quantityPurchased}</td>
                      <td>{item.quantitySold}</td>
                      <td>{item.stockOnHand}</td>
                      <td>
                        <span className={balanceClass}>{item.purchaseBalance}</span>
                      </td>
                      <td>{formatPrice(item.purchaseCostTotal)}</td>
                      <td>{formatPrice(item.salesRevenueTotal)}</td>
                      <td>{item.suppliers.length ? item.suppliers.join(', ') : '—'}</td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          onClick={() =>
                            setExpandedId(open ? null : item.productVariantId)
                          }
                        >
                          {open ? 'Ocultar' : 'Compras'}
                        </button>
                      </td>
                    </tr>
                    {open && (
                      <tr>
                        <td
                          colSpan={10}
                          style={{ background: 'var(--color-surface-muted)', padding: '1rem' }}
                        >
                          {(item.purchases?.length ?? 0) === 0 ? (
                            <p className="page-subtitle">
                              Sin compras recibidas (puede haber stock por ajuste o ventas
                              históricas).
                            </p>
                          ) : (
                            <table className="data-table">
                              <thead>
                                <tr>
                                  <th>Orden</th>
                                  <th>Proveedor</th>
                                  <th>Recibida</th>
                                  <th>Cantidad</th>
                                  <th>Costo unit.</th>
                                </tr>
                              </thead>
                              <tbody>
                                {item.purchases.map((p) => (
                                  <tr key={`${p.purchaseOrderId}-${p.orderNumber}`}>
                                    <td>{p.orderNumber}</td>
                                    <td>{p.supplierName}</td>
                                    <td>
                                      {new Date(p.receivedAt).toLocaleString('es-PE')}
                                    </td>
                                    <td>{p.quantity}</td>
                                    <td>{formatPrice(p.unitCost)}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          )}
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
    </div>
    </Can>
  )
}
