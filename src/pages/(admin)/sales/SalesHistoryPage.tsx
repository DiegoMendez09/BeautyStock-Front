import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { downloadSalePdf, downloadSalesExportPdf, getSales } from '../../../api/sales'
import { DEFAULT_PAGE_SIZE } from '../../../api/pagination'
import { Can } from '../../../components/auth/Can'
import { DataList } from '../../../components/ui/DataList'
import { PaginationBar } from '../../../components/ui/PaginationBar'
import { paymentMethodLabel, saleStatusLabel } from '../../../lib/labels'
import { P } from '../../../lib/permissions'
function formatPrice(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(value)
}

function statusBadge(status: string) {
  const s = status.toLowerCase()
  if (s === 'completed' || s === 'confirmed') return 'badge badge-success'
  if (s === 'pending') return 'badge badge-warning'
  return 'badge badge-muted'
}

export function SalesHistoryPage() {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [appliedFrom, setAppliedFrom] = useState('')
  const [appliedTo, setAppliedTo] = useState('')
  const [exportError, setExportError] = useState('')
  const [pdfError, setPdfError] = useState('')

  const { data, isLoading, isError, isFetching } = useQuery({
    queryKey: ['sales', 'list', { page, pageSize, from: appliedFrom, to: appliedTo }],
    queryFn: () =>
      getSales({
        page,
        pageSize,
        from: appliedFrom || undefined,
        to: appliedTo || undefined,
      }),
    placeholderData: keepPreviousData,
  })
  const sales = data?.items ?? []

  const pdfMutation = useMutation({
    mutationFn: ({ saleId, ticketNumber }: { saleId: number; ticketNumber: string }) =>
      downloadSalePdf(saleId, ticketNumber),
    onMutate: () => setPdfError(''),
    onError: (err) => {
      setPdfError(err instanceof Error ? err.message : 'No se pudo descargar el comprobante PDF')
    },
  })

  const exportMutation = useMutation({
    mutationFn: () =>
      downloadSalesExportPdf({
        from: fromDate || undefined,
        to: toDate || undefined,
      }),
    onError: (err) => {
      const message =
        err instanceof Error && err.message
          ? err.message
          : 'No se pudo exportar el historial en PDF'
      setExportError(message)
    },
    onMutate: () => setExportError(''),
  })

  const applyFilters = () => {
    setAppliedFrom(fromDate)
    setAppliedTo(toDate)
    setPage(1)
  }

  const clearFilters = () => {
    setFromDate('')
    setToDate('')
    setAppliedFrom('')
    setAppliedTo('')
    setPage(1)
  }

  return (
    <div className="page">
      <header className="page-header">
        <h1 className="page-title">Historial de ventas</h1>
        <p className="page-subtitle">
          Consulta comprobantes del punto de venta, filtra por fechas y descarga PDF individual o
          consolidado
        </p>
      </header>

      {isError && <div className="alert alert-error">No se pudieron cargar las ventas</div>}
      {exportError && <div className="alert alert-error">{exportError}</div>}
      {pdfError && <div className="alert alert-error">{pdfError}</div>}

      <div className="card" style={{ marginBottom: '1.25rem' }}>
        <h2 className="card-title">Filtros y descargas</h2>
        <p className="page-subtitle" style={{ marginBottom: '0.75rem' }}>
          Usa las fechas para filtrar la lista. La exportación PDF usa el mismo rango (opcional).
        </p>
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
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', marginTop: '0.75rem' }}>
          <button type="button" className="btn btn-secondary" onClick={applyFilters}>
            Filtrar lista
          </button>
          <button type="button" className="btn btn-ghost" onClick={clearFilters}>
            Limpiar
          </button>
          <Can anyOf={[P.Sales.View, P.Sales.Export]}>
            <button
              type="button"
              className="btn btn-primary"
              disabled={exportMutation.isPending}
              onClick={() => exportMutation.mutate()}
            >
              {exportMutation.isPending ? 'Generando…' : 'Descargar historial PDF'}
            </button>
          </Can>
        </div>
        {(appliedFrom || appliedTo) && (
          <p className="page-subtitle" style={{ marginTop: '0.75rem' }}>
            Lista filtrada
            {appliedFrom ? ` desde ${appliedFrom}` : ''}
            {appliedTo ? ` hasta ${appliedTo}` : ''}
            {data ? ` · ${data.totalCount} venta(s)` : ''}
          </p>
        )}
      </div>

      {isLoading ? (
        <div className="loading-screen" style={{ minHeight: 160 }}>
          <div className="spinner" />
        </div>
      ) : sales.length === 0 ? (
        <div className="empty-state">No hay ventas registradas en este rango</div>
      ) : (
        <>
          <DataList label="Historial de ventas">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Comprobante</th>
                  <th>Fecha</th>
                  <th>Vendedor</th>
                  <th>Pago</th>
                  <th>Total</th>
                  <th>Estado</th>
                  <th>Descarga</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((sale) => (
                  <tr key={sale.saleId}>
                    <td data-label="Comprobante">{sale.ticketNumber}</td>
                    <td data-label="Fecha">{new Date(sale.soldAt).toLocaleString('es-PE')}</td>
                    <td data-label="Vendedor">{sale.soldByFullName}</td>
                    <td data-label="Pago">{paymentMethodLabel(sale.paymentMethod)}</td>
                    <td data-label="Total">{formatPrice(sale.totalAmount)}</td>
                    <td data-label="Estado">
                      <span className={statusBadge(sale.status)}>
                        {saleStatusLabel(sale.status)}
                      </span>
                    </td>
                    <td data-label="" className="data-table__actions">
                      <Can permission={P.Sales.View}>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          disabled={pdfMutation.isPending}
                          onClick={() =>
                            pdfMutation.mutate({
                              saleId: sale.saleId,
                              ticketNumber: sale.ticketNumber,
                            })
                          }
                        >
                          Descargar comprobante
                        </button>
                      </Can>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </DataList>
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
        </>
      )}
    </div>
  )
}
