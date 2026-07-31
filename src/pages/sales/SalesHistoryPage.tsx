import { useMutation, useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { downloadSalePdf, downloadSalesExportPdf, getSales } from '../../api/sales'
import { DEFAULT_PAGE_SIZE } from '../../api/pagination'
import { Can } from '../../components/auth/Can'
import { PaginationBar } from '../../components/ui/PaginationBar'
import { P } from '../../lib/permissions'

function formatPrice(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(value)
}

export function SalesHistoryPage() {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')

  const { data, isLoading, isError } = useQuery({
    queryKey: ['sales', 'list', { page, pageSize }],
    queryFn: () => getSales({ page, pageSize }),
  })
  const sales = data?.items ?? []

  const pdfMutation = useMutation({
    mutationFn: ({ saleId, ticketNumber }: { saleId: number; ticketNumber: string }) =>
      downloadSalePdf(saleId, ticketNumber),
  })

  const exportMutation = useMutation({
    mutationFn: () =>
      downloadSalesExportPdf({
        from: fromDate || undefined,
        to: toDate || undefined,
      }),
  })

  return (
    <div className="page">
      <header className="page-header">
        <h1 className="page-title">Historial de ventas</h1>
        <p className="page-subtitle">Tickets registrados en el POS</p>
      </header>

      {isError && <div className="alert alert-error">No se pudieron cargar las ventas</div>}
      {exportMutation.isError && (
        <div className="alert alert-error">No se pudo exportar el historial en PDF</div>
      )}

      <Can anyOf={[P.Sales.Export, P.Sales.View]}>
        <div className="card" style={{ marginBottom: '1.25rem' }}>
          <h2 className="card-title">Exportar historial</h2>
          <div className="page-filters">
            <div className="form-group">
              <label className="form-label">Desde</label>
              <input
                type="date"
                className="form-input"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Hasta</label>
              <input
                type="date"
                className="form-input"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>
          </div>
          <button
            type="button"
            className="btn btn-primary"
            disabled={exportMutation.isPending}
            onClick={() => exportMutation.mutate()}
          >
            {exportMutation.isPending ? 'Generando…' : 'Exportar PDF'}
          </button>
        </div>
      </Can>

      {isLoading ? (
        <div className="loading-screen" style={{ minHeight: 160 }}>
          <div className="spinner" />
        </div>
      ) : sales.length === 0 ? (
        <div className="empty-state">No hay ventas registradas</div>
      ) : (
        <>
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
                  <th />
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
                    <td>
                      <Can anyOf={[P.Sales.Export, P.Sales.View]}>
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          disabled={pdfMutation.isPending}
                          onClick={() =>
                            pdfMutation.mutate({
                              saleId: sale.saleId,
                              ticketNumber: sale.ticketNumber,
                            })
                          }
                        >
                          PDF
                        </button>
                      </Can>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {data && (
            <PaginationBar
              page={data.page}
              pageSize={data.pageSize}
              totalCount={data.totalCount}
              totalPages={data.totalPages}
              onPageChange={setPage}
              onPageSizeChange={(size) => {
                setPageSize(size)
                setPage(1)
              }}
            />
          )}
        </>
      )}
    </div>
  )
}
