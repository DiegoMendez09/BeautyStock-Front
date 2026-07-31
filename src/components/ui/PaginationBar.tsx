import { PAGE_SIZE_OPTIONS } from '../../api/pagination'
import './PaginationBar.css'

interface PaginationBarProps {
  page: number
  pageSize: number
  totalCount: number
  totalPages: number
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
}

export function PaginationBar({
  page,
  pageSize,
  totalCount,
  totalPages,
  onPageChange,
  onPageSizeChange,
}: PaginationBarProps) {
  const safeTotalPages = Math.max(totalPages, 1)

  return (
    <div className="pagination-bar">
      <div className="pagination-bar__info">
        {totalCount === 0
          ? 'Sin resultados'
          : `Página ${page} de ${safeTotalPages} · ${totalCount} resultado${totalCount === 1 ? '' : 's'}`}
      </div>
      <div className="pagination-bar__controls">
        <label className="pagination-bar__size">
          Por página
          <select
            className="form-input"
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>
        <div className="pagination-bar__nav">
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            Anterior
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            disabled={page >= safeTotalPages}
            onClick={() => onPageChange(page + 1)}
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  )
}
