import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { deactivateCategory, deleteCategory, createCategory } from '../../api/catalogMutations'
import { DEFAULT_PAGE_SIZE } from '../../api/pagination'
import { Can } from '../../components/auth/Can'
import { PaginationBar } from '../../components/ui/PaginationBar'
import { RowActions } from '../../components/ui/RowActions'
import { useCategoriesQuery } from '../../hooks/useCatalogQueries'
import { P } from '../../lib/permissions'

export function CategoriesPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
  const { data, isLoading, isError, isFetching } = useCategoriesQuery({ page, pageSize })
  const categories = data?.items ?? []
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const invalidate = () => void queryClient.invalidateQueries({ queryKey: ['catalog', 'categories'] })

  const createMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      invalidate()
      setName('')
      setDescription('')
    },
  })

  const deactivateMutation = useMutation({
    mutationFn: deactivateCategory,
    onSuccess: invalidate,
  })

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: invalidate,
  })

  const handleCreate = (e: FormEvent) => {
    e.preventDefault()
    createMutation.mutate({ name, description: description || undefined })
  }

  return (
    <div className="page">
      <header className="page-header">
        <h1 className="page-title">Categorías</h1>
        <p className="page-subtitle">Organización del catálogo por categorías</p>
      </header>

      {isError && <div className="alert alert-error">No se pudieron cargar las categorías</div>}

      <Can permission={P.Catalog.Create}>
        <form className="card" onSubmit={handleCreate} style={{ marginBottom: '1.25rem' }}>
          <h2 className="card-title">Nueva categoría</h2>
          <div className="page-filters">
            <div className="form-group">
              <label className="form-label">Nombre</label>
              <input
                className="form-input"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Descripción</label>
              <input
                className="form-input"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>
          <button type="submit" className="btn btn-primary" disabled={createMutation.isPending}>
            Crear
          </button>
        </form>
      </Can>

      {isLoading ? (
        <div className="loading-screen" style={{ minHeight: '200px' }}>
          <div className="spinner" />
        </div>
      ) : categories.length === 0 ? (
        <div className="empty-state">No hay categorías registradas</div>
      ) : (
        <>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Descripción</th>
                  <th>Estado</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <tr key={category.categoryId}>
                    <td>{category.name}</td>
                    <td>{category.description ?? '—'}</td>
                    <td>
                      <span
                        className={`badge ${category.isActive ? 'badge-success' : 'badge-muted'}`}
                      >
                        {category.isActive ? 'Activa' : 'Inactiva'}
                      </span>
                    </td>
                    <td>
                      <Can permission={P.Catalog.Delete}>
                        <RowActions
                          isActive={category.isActive}
                          onDeactivate={() => deactivateMutation.mutate(category.categoryId)}
                          onDelete={() => deleteMutation.mutate(category.categoryId)}
                          deactivatePending={deactivateMutation.isPending}
                          deletePending={deleteMutation.isPending}
                        />
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
