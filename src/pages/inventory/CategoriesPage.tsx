import { useEffect, useState } from 'react'
import { getCategories } from '../../api/catalog'
import type { Category } from '../../types'

export function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    void (async () => {
      try {
        const data = await getCategories()
        setCategories(data)
      } catch {
        setError('No se pudieron cargar las categorías')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  return (
    <div className="page">
      <header className="page-header">
        <h1 className="page-title">Categorías</h1>
        <p className="page-subtitle">Organización del catálogo por categorías</p>
      </header>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
