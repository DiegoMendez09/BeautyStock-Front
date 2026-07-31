import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import {
  createPurchaseOrder,
  createSupplier,
  deactivateSupplier,
  deleteSupplier,
  getPurchaseOrders,
  getSuppliers,
  receivePurchaseOrder,
} from '../../api/modules'
import { DEFAULT_PAGE_SIZE } from '../../api/pagination'
import { Can } from '../../components/auth/Can'
import { PaginationBar } from '../../components/ui/PaginationBar'
import { RowActions } from '../../components/ui/RowActions'
import { TypeaheadInput } from '../../components/ui/TypeaheadInput'
import { P } from '../../lib/permissions'

function formatPrice(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(value)
}

export function PurchasesPage() {
  const queryClient = useQueryClient()
  const [supplierPage, setSupplierPage] = useState(1)
  const [supplierPageSize, setSupplierPageSize] = useState(DEFAULT_PAGE_SIZE)
  const { data: supplierData } = useQuery({
    queryKey: ['purchases', 'suppliers', { page: supplierPage, pageSize: supplierPageSize }],
    queryFn: () => getSuppliers({ page: supplierPage, pageSize: supplierPageSize }),
  })
  const suppliers = supplierData?.items ?? []

  const [orderPage, setOrderPage] = useState(1)
  const [orderPageSize, setOrderPageSize] = useState(DEFAULT_PAGE_SIZE)
  const { data: orderData, isLoading } = useQuery({
    queryKey: ['purchases', 'orders', { page: orderPage, pageSize: orderPageSize }],
    queryFn: () => getPurchaseOrders({ page: orderPage, pageSize: orderPageSize }),
  })
  const orders = orderData?.items ?? []

  const [supplierName, setSupplierName] = useState('')
  const [orderSupplierId, setOrderSupplierId] = useState<number | undefined>()
  const [variantId, setVariantId] = useState<number | undefined>()
  const [variantLabel, setVariantLabel] = useState('')
  const [qty, setQty] = useState('1')
  const [unitCost, setUnitCost] = useState('')

  const invalidateSuppliers = () =>
    void queryClient.invalidateQueries({ queryKey: ['purchases', 'suppliers'] })
  const invalidateOrders = () =>
    void queryClient.invalidateQueries({ queryKey: ['purchases', 'orders'] })

  const createSupplierMutation = useMutation({
    mutationFn: createSupplier,
    onSuccess: () => {
      invalidateSuppliers()
      setSupplierName('')
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
      setQty('1')
      setUnitCost('')
      setVariantId(undefined)
      setVariantLabel('')
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
    createSupplierMutation.mutate({ legalName: supplierName })
  }

  const handleOrder = (e: FormEvent) => {
    e.preventDefault()
    if (!orderSupplierId || !variantId) return
    createOrderMutation.mutate({
      supplierId: orderSupplierId,
      lines: [
        {
          productVariantId: variantId,
          quantity: Number(qty) || 1,
          unitCost: Number(unitCost) || 0,
        },
      ],
    })
  }

  return (
    <div className="page">
      <header className="page-header">
        <h1 className="page-title">Compras</h1>
        <p className="page-subtitle">Proveedores y órdenes de compra (recepción suma stock)</p>
      </header>

      <Can permission={P.Purchases.Create}>
        <div className="page-filters" style={{ marginBottom: '1rem' }}>
          <form className="card" onSubmit={handleSupplier}>
            <h2 className="card-title">Nuevo proveedor</h2>
            <div className="form-group">
              <label className="form-label">Razón social</label>
              <input
                className="form-input"
                required
                value={supplierName}
                onChange={(e) => setSupplierName(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary">
              Crear proveedor
            </button>
          </form>

          <form className="card" onSubmit={handleOrder}>
            <h2 className="card-title">Nueva orden</h2>
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
            <TypeaheadInput
              entity="product-variants"
              label="Variante"
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
            <div className="page-filters">
              <div className="form-group">
                <label className="form-label">Cantidad</label>
                <input
                  type="number"
                  min={1}
                  className="form-input"
                  value={qty}
                  onChange={(e) => setQty(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Costo unitario</label>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  className="form-input"
                  required
                  value={unitCost}
                  onChange={(e) => setUnitCost(e.target.value)}
                />
              </div>
            </div>
            <button type="submit" className="btn btn-primary">
              Crear orden
            </button>
          </form>
        </div>
      </Can>

      <h2 className="card-title">Proveedores</h2>
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
                  <span className={`badge ${supplier.isActive ? 'badge-success' : 'badge-muted'}`}>
                    {supplier.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td>
                  <Can permission={P.Purchases.Delete}>
                    <RowActions
                      isActive={supplier.isActive}
                      onDeactivate={() => deactivateSupplierMutation.mutate(supplier.supplierId)}
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
          onPageChange={setSupplierPage}
          onPageSizeChange={(size) => {
            setSupplierPageSize(size)
            setSupplierPage(1)
          }}
        />
      )}

      <h2 className="card-title" style={{ marginTop: '1.5rem' }}>
        Órdenes de compra
      </h2>
      {isLoading ? (
        <div className="loading-screen" style={{ minHeight: 160 }}>
          <div className="spinner" />
        </div>
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
                {orders.map((order) => (
                  <tr key={order.purchaseOrderId}>
                    <td>{order.orderNumber}</td>
                    <td>{order.supplierName}</td>
                    <td>{order.status}</td>
                    <td>{formatPrice(order.totalAmount)}</td>
                    <td>{new Date(order.orderedAt).toLocaleString('es-PE')}</td>
                    <td>
                      <Can permission={P.Purchases.Update}>
                        {order.status === 'Ordered' && (
                          <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            onClick={() => receiveMutation.mutate(order.purchaseOrderId)}
                          >
                            Recibir stock
                          </button>
                        )}
                      </Can>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {orderData && (
            <PaginationBar
              page={orderData.page}
              pageSize={orderData.pageSize}
              totalCount={orderData.totalCount}
              totalPages={orderData.totalPages}
              onPageChange={setOrderPage}
              onPageSizeChange={(size) => {
                setOrderPageSize(size)
                setOrderPage(1)
              }}
            />
          )}
        </>
      )}
    </div>
  )
}
