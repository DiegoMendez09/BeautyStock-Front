import { useCategoriesQuery } from '../../hooks/useCatalogQueries'

export function CategoriesPage() {
  const { data: categories = [], isLoading, isError } = useCategoriesQuery()

  return (
    <div className="page">
      <header className="page-header">
        <h1 className="page-title">Categorías</h1>
        <p className="page-subtitle">Organización del catálogo por categorías</p>
      </header>

      {isError && <div className="alert alert-error">No se pudieron cargar las categorías</div>}

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
