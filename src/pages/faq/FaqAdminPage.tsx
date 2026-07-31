import { useQuery } from '@tanstack/react-query'
import { Navigate } from 'react-router-dom'
import { apiClient } from '../../api/client'
import { Can } from '../../components/auth/Can'
import { useAuth } from '../../hooks/useAuth'
import { P } from '../../lib/permissions'

interface FaqArticle {
  faqArticleId: number
  categoryName: string
  question: string
  answer: string
  isActive: boolean
}

export function FaqAdminPage() {
  const { hasPermission } = useAuth()
  const canManage = hasPermission(P.Faq.Manage)

  const { data: articles = [], isLoading, isError } = useQuery({
    queryKey: ['faq', 'articles', 'admin'],
    queryFn: () => apiClient<FaqArticle[]>('/api/v1/faq/articles?includeInactive=true'),
    enabled: canManage,
  })

  if (!canManage) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="page">
      <header className="page-header">
        <h1 className="page-title">FAQ</h1>
        <p className="page-subtitle">Administración de artículos de ayuda (el chat usa estos datos)</p>
      </header>

      {isError && <div className="alert alert-error">No se pudo cargar el FAQ</div>}

      {isLoading ? (
        <div className="loading-screen" style={{ minHeight: 160 }}>
          <div className="spinner" />
        </div>
      ) : articles.length === 0 ? (
        <div className="empty-state">No hay artículos FAQ</div>
      ) : (
        <Can permission={P.Faq.Manage}>
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
        </Can>
      )}
    </div>
  )
}
