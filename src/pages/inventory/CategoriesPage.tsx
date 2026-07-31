import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { createCategory, deleteCategory } from '../../api/catalogMutations'
import { useAuth } from '../../hooks/useAuth'
import { useCategoriesQuery } from '../../hooks/useCatalogQueries'

export function CategoriesPage() {
  const { hasPermission } = useAuth()
  const canCreate = hasPermission('Catalog.Create')
  const canDelete = hasPermission('Catalog.Delete')
  const queryClient = useQueryClient()
  const { data: categories = [], isLoading, isError } = useCategoriesQuery()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const createMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['catalog', 'categories'] })
      setName('')
      setDescription('')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['catalog', 'categories'] }),
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

      {canCreate && (
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
      )}

      {isLoading ? (
        <div className="loading-screen" style={{ minHeight: '200px' }}>
          <div className="spinner" />
        </div>
      ) : categories.length === 0 ? (
        <div className="empty-state">No hay categorías registradas</div>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Estado</th>
                {canDelete && <th />}
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
                  {canDelete && (
                    <td>
                      {category.isActive && (
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          onClick={() => deleteMutation.mutate(category.categoryId)}
                        >
                          Desactivar
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
