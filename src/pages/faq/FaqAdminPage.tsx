import { useQuery } from '@tanstack/react-query'
import { apiClient } from '../../api/client'

interface FaqArticle {
  faqArticleId: number
  categoryName: string
  question: string
  answer: string
  isActive: boolean
}

export function FaqAdminPage() {
  const { data: articles = [], isLoading, isError } = useQuery({
    queryKey: ['faq', 'articles'],
    queryFn: () => apiClient<FaqArticle[]>('/api/v1/faq/articles'),
  })

  return (
    <div className="page">
      <header className="page-header">
        <h1 className="page-title">FAQ</h1>
        <p className="page-subtitle">Artículos de ayuda del sistema</p>
      </header>

      {isError && (
        <div className="alert alert-error">
          No se pudo cargar el FAQ (requiere permiso Faq.Manage)
        </div>
      )}

      {isLoading ? (
        <div className="loading-screen" style={{ minHeight: 160 }}>
          <div className="spinner" />
        </div>
      ) : articles.length === 0 ? (
        <div className="empty-state">No hay artículos FAQ</div>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Categoría</th>
                <th>Pregunta</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {articles.map((article) => (
                <tr key={article.faqArticleId}>
                  <td>{article.categoryName}</td>
                  <td>
                    <strong>{article.question}</strong>
                    <div style={{ color: 'var(--color-text-muted)', marginTop: 4 }}>
                      {article.answer}
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${article.isActive ? 'badge-success' : 'badge-muted'}`}>
                      {article.isActive ? 'Activo' : 'Inactivo'}
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
