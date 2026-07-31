import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { apiClient } from '../../api/client'
import { useAuth } from '../../hooks/useAuth'

interface FaqArticle {
  faqArticleId: number
  categoryName: string
  question: string
  answer: string
  isActive: boolean
}

export function FaqAdminPage() {
  const { hasPermission } = useAuth()
  const canManage = hasPermission('Faq.Manage')
  const [expandedId, setExpandedId] = useState<number | null>(null)

  const { data: articles = [], isLoading, isError } = useQuery({
    queryKey: ['faq', 'articles', canManage],
    queryFn: () =>
      apiClient<FaqArticle[]>(
        `/api/v1/faq/articles${canManage ? '?includeInactive=true' : ''}`,
      ),
  })

  return (
    <div className="page">
      <header className="page-header">
        <h1 className="page-title">FAQ</h1>
        <p className="page-subtitle">
          {canManage
            ? 'Administración de artículos de ayuda'
            : 'Consulta las preguntas frecuentes del sistema'}
        </p>
      </header>

      {isError && <div className="alert alert-error">No se pudo cargar el FAQ</div>}

      {isLoading ? (
        <div className="loading-screen" style={{ minHeight: 160 }}>
          <div className="spinner" />
        </div>
      ) : articles.length === 0 ? (
        <div className="empty-state">No hay artículos FAQ</div>
      ) : canManage ? (
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
      ) : (
        <div className="faq-browse">
          {articles.map((article) => {
            const open = expandedId === article.faqArticleId
            return (
              <button
                key={article.faqArticleId}
                type="button"
                className="card faq-browse__item"
                onClick={() =>
                  setExpandedId((prev) =>
                    prev === article.faqArticleId ? null : article.faqArticleId,
                  )
                }
              >
                <div className="faq-browse__meta">{article.categoryName}</div>
                <div className="faq-browse__question">{article.question}</div>
                {open && <div className="faq-browse__answer">{article.answer}</div>}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
