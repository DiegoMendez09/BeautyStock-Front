import { useQuery } from '@tanstack/react-query'
import { getDashboardReport } from '../../../api/modules'

function formatPrice(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(value)
}

export function ReportsPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['reports', 'dashboard'],
    queryFn: getDashboardReport,
  })

  return (
    <div className="page">
      <header className="page-header">
        <h1 className="page-title">Reportes</h1>
        <p className="page-subtitle">Resumen operativo del día e indicadores de inventario</p>
      </header>

      {isError && <div className="alert alert-error">No se pudo cargar el reporte</div>}

      {isLoading || !data ? (
        <div className="loading-screen" style={{ minHeight: 160 }}>
          <div className="spinner" />
        </div>
      ) : (
        <>
          <div className="page-filters">
            <div className="card">
              <h2 className="card-title">Ventas hoy</h2>
              <p>{data.salesCountToday} comprobantes</p>
              <p>{formatPrice(data.salesTotalToday)}</p>
            </div>
            <div className="card">
              <h2 className="card-title">Productos activos</h2>
              <p>{data.activeProducts}</p>
            </div>
            <div className="card">
              <h2 className="card-title">Clientes activos</h2>
              <p>{data.activeCustomers}</p>
            </div>
          </div>

          <div className="card" style={{ marginBottom: '1rem' }}>
            <h2 className="card-title">Existencias bajas</h2>
            {data.lowStockItems.length === 0 ? (
              <p className="page-subtitle">Sin alertas</p>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>SKU</th>
                    <th>Producto</th>
                    <th>Existencias</th>
                    <th>Mín.</th>
                  </tr>
                </thead>
                <tbody>
                  {data.lowStockItems.map((item) => (
                    <tr key={item.productVariantId}>
                      <td>{item.sku}</td>
                      <td>
                        {item.productName} — {item.variantName}
                      </td>
                      <td>{item.stockOnHand}</td>
                      <td>{item.reorderLevel}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="card">
            <h2 className="card-title">Top productos</h2>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Cant.</th>
                  <th>Ingresos</th>
                </tr>
              </thead>
              <tbody>
                {data.topProducts.map((item) => (
                  <tr key={item.productVariantId}>
                    <td>{item.label}</td>
                    <td>{item.quantitySold}</td>
                    <td>{formatPrice(item.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
