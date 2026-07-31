import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import {
  createFaqArticle,
  deactivateFaqArticle,
  getFaqArticles,
  getFaqCategories,
} from '../../api/modules'
import { Can } from '../../components/auth/Can'
import { useAuth } from '../../hooks/useAuth'
import { P } from '../../lib/permissions'

export function FaqAdminPage() {
  const { hasPermission } = useAuth()
  const canManage = hasPermission(P.Faq.Manage)
  const queryClient = useQueryClient()

  const [faqCategoryId, setFaqCategoryId] = useState('')
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [keywords, setKeywords] = useState('')
  const [audienceRole, setAudienceRole] = useState('')
  const [sortOrder, setSortOrder] = useState('1')

  const { data: categories = [] } = useQuery({
    queryKey: ['faq', 'categories'],
    queryFn: getFaqCategories,
    enabled: canManage,
  })

  const { data: articles = [], isLoading, isError } = useQuery({
    queryKey: ['faq', 'articles', 'admin'],
    queryFn: () => getFaqArticles(true),
    enabled: canManage,
  })

  const createMutation = useMutation({
    mutationFn: createFaqArticle,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['faq', 'articles'] })
      setQuestion('')
      setAnswer('')
      setKeywords('')
      setAudienceRole('')
      setSortOrder('1')
    },
  })

  const deactivateMutation = useMutation({
    mutationFn: deactivateFaqArticle,
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['faq', 'articles'] }),
  })

  if (!canManage) {
    return <Navigate to="/" replace />
  }

  const handleCreate = (e: FormEvent) => {
    e.preventDefault()
    const categoryId = Number(faqCategoryId)
    if (!categoryId) return
    createMutation.mutate({
      faqCategoryId: categoryId,
      question,
      answer,
      keywords: keywords.trim() || undefined,
      audienceRole: audienceRole.trim() || undefined,
      sortOrder: Number(sortOrder) || 0,
    })
  }

  return (
    <div className="page">
      <header className="page-header">
        <h1 className="page-title">FAQ</h1>
        <p className="page-subtitle">
          Alta y desactivación con Faq.Manage. DELETE desactiva (no borra).
        </p>
      </header>

      {isError && <div className="alert alert-error">No se pudo cargar el FAQ</div>}
      {createMutation.isError && (
        <div className="alert alert-error">No se pudo crear el artículo FAQ</div>
      )}

      <Can permission={P.Faq.Manage}>
        <form className="card" onSubmit={handleCreate} style={{ marginBottom: '1.25rem' }}>
          <h2 className="card-title">Nueva pregunta</h2>
          <div className="page-filters">
            <div className="form-group">
              <label className="form-label">Categoría</label>
              <select
                className="form-input"
                required
                value={faqCategoryId}
                onChange={(e) => setFaqCategoryId(e.target.value)}
              >
                <option value="">Seleccionar…</option>
                {categories.map((c) => (
                  <option key={c.faqCategoryId} value={c.faqCategoryId}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Orden</label>
              <input
                className="form-input"
                type="number"
                min={0}
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Rol audiencia (opcional)</label>
              <input
                className="form-input"
                placeholder="p. ej. Customer"
                value={audienceRole}
                onChange={(e) => setAudienceRole(e.target.value)}
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Pregunta</label>
            <input
              className="form-input"
              required
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Respuesta</label>
            <textarea
              className="form-input"
              required
              rows={3}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Palabras clave (opcional)</label>
            <input
              className="form-input"
              placeholder="login sesión acceso"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={createMutation.isPending}>
            Crear artículo
          </button>
        </form>
      </Can>

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
                <th />
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
                  <td>
                    <Can permission={P.Faq.Manage}>
                      {article.isActive && (
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          onClick={() => deactivateMutation.mutate(article.faqArticleId)}
                        >
                          Desactivar
                        </button>
                      )}
                    </Can>
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
