import { PAGE_SIZE_OPTIONS } from '../../api/pagination'
import './PaginationBar.css'

interface PaginationBarProps {
  /** Página actual (1-based), preferir `data.page` del backend */
  page: number
  /** Tamaño de página, preferir `data.pageSize` del backend */
  pageSize: number
  totalCount: number
  totalPages: number
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
  /** Indica fetch en curso (TanStack Query `isFetching`) */
  isFetching?: boolean
  /** Etiqueta accesible del nav */
  label?: string
}

export function PaginationBar({
  page,
  pageSize,
  totalCount,
  totalPages,
  onPageChange,
  onPageSizeChange,
  isFetching = false,
  label = 'Paginación de resultados',
}: PaginationBarProps) {
  const safeTotalPages = Math.max(totalPages, 1)
  const safePage = Math.min(Math.max(page, 1), safeTotalPages)
  const from = totalCount === 0 ? 0 : (safePage - 1) * pageSize + 1
  const to = Math.min(safePage * pageSize, totalCount)
  const sizeId = 'pagination-page-size'

  return (
    <nav className="pagination-bar" aria-label={label} data-fetching={isFetching || undefined}>
      <div className="pagination-bar__info" aria-live="polite" aria-atomic="true">
        {totalCount === 0 ? (
          'Sin resultados'
        ) : (
          <>
            <span className="sr-only">
              Página {safePage} de {safeTotalPages}. Mostrando del {from} al {to} de {totalCount}.
              {isFetching ? ' Actualizando…' : ''}
            </span>
            <span aria-hidden="true">
              {from}–{to} de {totalCount}
              {isFetching ? ' · Actualizando…' : ''}
            </span>
          </>
        )}
      </div>

      <div className="pagination-bar__controls">
        <div className="pagination-bar__size">
          <label htmlFor={sizeId}>Por página</label>
          <select
            id={sizeId}
            className="form-input"
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            disabled={isFetching && totalCount === 0}
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>

        <div className="pagination-bar__nav">
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            disabled={safePage <= 1 || isFetching}
            onClick={() => onPageChange(safePage - 1)}
            aria-label={`Ir a la página anterior, página ${safePage - 1}`}
          >
            Anterior
          </button>
          <span className="pagination-bar__page" aria-current="page">
            {safePage} / {safeTotalPages}
          </span>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            disabled={safePage >= safeTotalPages || isFetching}
            onClick={() => onPageChange(safePage + 1)}
            aria-label={`Ir a la página siguiente, página ${safePage + 1}`}
          >
            Siguiente
          </button>
        </div>
      </div>
    </nav>
  )
}
