import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import {
  createPurchaseOrder,
  createSupplier,
  getPurchaseOrders,
  getSuppliers,
  receivePurchaseOrder,
} from '../../api/modules'
import { Can } from '../../components/auth/Can'
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
  const { data: suppliers = [] } = useQuery({
    queryKey: ['purchases', 'suppliers'],
    queryFn: getSuppliers,
  })
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['purchases', 'orders'],
    queryFn: getPurchaseOrders,
  })

  const [supplierName, setSupplierName] = useState('')
  const [orderSupplierId, setOrderSupplierId] = useState<number | undefined>()
  const [variantId, setVariantId] = useState<number | undefined>()
  const [variantLabel, setVariantLabel] = useState('')
  const [qty, setQty] = useState('1')
  const [unitCost, setUnitCost] = useState('')

  const createSupplierMutation = useMutation({
    mutationFn: createSupplier,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['purchases', 'suppliers'] })
      setSupplierName('')
    },
  })

  const createOrderMutation = useMutation({
    mutationFn: createPurchaseOrder,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['purchases', 'orders'] })
      setQty('1')
      setUnitCost('')
      setVariantId(undefined)
      setVariantLabel('')
    },
  })

  const receiveMutation = useMutation({
    mutationFn: receivePurchaseOrder,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['purchases', 'orders'] })
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

      {isLoading ? (
        <div className="loading-screen" style={{ minHeight: 160 }}>
          <div className="spinner" />
        </div>
      ) : (
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
      )}
    </div>
  )
}
