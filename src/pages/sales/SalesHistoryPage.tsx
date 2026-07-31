import { useQuery } from '@tanstack/react-query'
import { getSales } from '../../api/modules'

function formatPrice(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(value)
}

export function SalesHistoryPage() {
  const { data: sales = [], isLoading, isError } = useQuery({
    queryKey: ['sales', 'list'],
    queryFn: getSales,
  })

  return (
    <div className="page">
      <header className="page-header">
        <h1 className="page-title">Historial de ventas</h1>
        <p className="page-subtitle">Tickets registrados en el POS</p>
      </header>

      {isError && <div className="alert alert-error">No se pudieron cargar las ventas</div>}

      {isLoading ? (
        <div className="loading-screen" style={{ minHeight: 160 }}>
          <div className="spinner" />
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Ticket</th>
                <th>Fecha</th>
                <th>Vendedor</th>
                <th>Pago</th>
                <th>Total</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((sale) => (
                <tr key={sale.saleId}>
                  <td>{sale.ticketNumber}</td>
                  <td>{new Date(sale.soldAt).toLocaleString('es-PE')}</td>
                  <td>{sale.soldByFullName}</td>
                  <td>{sale.paymentMethod}</td>
                  <td>{formatPrice(sale.totalAmount)}</td>
                  <td>{sale.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
