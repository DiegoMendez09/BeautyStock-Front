import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import {
  createFaqArticle,
  deactivateFaqArticle,
  deleteFaqArticle,
  getFaqArticles,
  getFaqCategories,
  updateFaqArticle,
  type FaqArticleAdmin,
} from '../../../api/modules'
import { DEFAULT_PAGE_SIZE } from '../../../api/pagination'
import { Can } from '../../../components/auth/Can'
import { BulkUploadDialog } from '../../../components/ui/BulkUploadDialog'
import { DataList } from '../../../components/ui/DataList'
import { PaginationBar } from '../../../components/ui/PaginationBar'
import { RowActions } from '../../../components/ui/RowActions'
import { useAuth } from '../../../hooks/useAuth'
import { P } from '../../../lib/permissions'
type StatusFilter = 'all' | 'active' | 'inactive'

const emptyForm = {
  faqCategoryId: '',
  question: '',
  answer: '',
  keywords: '',
  audienceRole: '',
  sortOrder: '1',
  isActive: true,
}

export function FaqAdminPage() {
  const { hasPermission } = useAuth()
  const canManage = hasPermission(P.Faq.Manage)
  const queryClient = useQueryClient()

  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [search, setSearch] = useState('')
  const [searchDebounced, setSearchDebounced] = useState('')
  const [status, setStatus] = useState<StatusFilter>('all')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)

  useEffect(() => {
    const t = window.setTimeout(() => {
      setSearchDebounced(search.trim())
      setPage(1)
    }, 300)
    return () => window.clearTimeout(t)
  }, [search])

  const { data: categories = [] } = useQuery({
    queryKey: ['faq', 'categories'],
    queryFn: getFaqCategories,
    enabled: canManage,
  })

  const { data, isLoading, isError, isFetching } = useQuery({
    queryKey: ['faq', 'articles', 'admin', { page, pageSize, searchDebounced, status }],
    queryFn: () =>
      getFaqArticles({
        includeInactive: true,
        search: searchDebounced || undefined,
        isActive: status === 'all' ? undefined : status === 'active',
        page,
        pageSize,
      }),
    enabled: canManage,
    placeholderData: keepPreviousData,
  })
  const articles = data?.items ?? []

  const invalidate = () => void queryClient.invalidateQueries({ queryKey: ['faq', 'articles'] })

  const resetForm = () => {
    setForm(emptyForm)
    setEditingId(null)
  }

  const createMutation = useMutation({
    mutationFn: createFaqArticle,
    onSuccess: () => {
      invalidate()
      resetForm()
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: number; body: Parameters<typeof updateFaqArticle>[1] }) =>
      updateFaqArticle(id, body),
    onSuccess: () => {
      invalidate()
      resetForm()
    },
  })

  const deactivateMutation = useMutation({
    mutationFn: deactivateFaqArticle,
    onSuccess: invalidate,
  })

  const deleteMutation = useMutation({
    mutationFn: deleteFaqArticle,
    onSuccess: invalidate,
  })

  if (!canManage) {
    return <Navigate to="/panel" replace />
  }

  const startEdit = (article: FaqArticleAdmin) => {
    setEditingId(article.faqArticleId)
    setForm({
      faqCategoryId: String(article.faqCategoryId),
      question: article.question,
      answer: article.answer,
      keywords: article.keywords ?? '',
      audienceRole: article.audienceRole ?? '',
      sortOrder: String(article.sortOrder),
      isActive: article.isActive,
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const categoryId = Number(form.faqCategoryId)
    if (!categoryId) return

    const payload = {
      faqCategoryId: categoryId,
      question: form.question,
      answer: form.answer,
      keywords: form.keywords.trim() || undefined,
      audienceRole: form.audienceRole.trim() || undefined,
      sortOrder: Number(form.sortOrder) || 0,
    }

    if (editingId) {
      updateMutation.mutate({
        id: editingId,
        body: { ...payload, isActive: form.isActive },
      })
    } else {
      createMutation.mutate(payload)
    }
  }

  const saving = createMutation.isPending || updateMutation.isPending

  return (
    <div className="page">
      <header className="page-header">
        <h1 className="page-title">Preguntas frecuentes</h1>
        <p className="page-subtitle">
          Administra artículos de ayuda del asistente (existencias, compras, presentaciones y más).
        </p>
      </header>

      {isError && (
        <div className="alert alert-error">No se pudieron cargar las preguntas frecuentes</div>
      )}
      {(createMutation.isError || updateMutation.isError) && (
        <div className="alert alert-error">
          {editingId ? 'No se pudo actualizar el artículo' : 'No se pudo crear el artículo de ayuda'}
        </div>
      )}

      <Can permission={P.Faq.Manage}>
        {!editingId && (
          <div style={{ marginBottom: '1.25rem' }}>
            <BulkUploadDialog module="faq" onSuccess={invalidate} />
          </div>
        )}
        <form className="card" onSubmit={handleSubmit} style={{ marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center' }}>
            <h2 className="card-title" style={{ margin: 0 }}>
              {editingId ? 'Editar artículo' : 'Nueva pregunta'}
            </h2>
            {editingId && (
              <button type="button" className="btn btn-ghost btn-sm" onClick={resetForm}>
                Cancelar edición
              </button>
            )}
          </div>
          <div className="page-filters">
            <div className="form-group">
              <label className="form-label">Categoría</label>
              <select
                className="form-input"
                required
                value={form.faqCategoryId}
                onChange={(e) => setForm((f) => ({ ...f, faqCategoryId: e.target.value }))}
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
              <label className="form-label">Orden de aparición</label>
              <input
                className="form-input"
                type="number"
                min={0}
                value={form.sortOrder}
                onChange={(e) => setForm((f) => ({ ...f, sortOrder: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Rol de audiencia (opcional)</label>
              <input
                className="form-input"
                placeholder="Vacío = todos los roles"
                value={form.audienceRole}
                onChange={(e) => setForm((f) => ({ ...f, audienceRole: e.target.value }))}
              />
            </div>
            {editingId && (
              <div className="form-group">
                <label className="form-label">Estado</label>
                <select
                  className="form-input"
                  value={form.isActive ? 'active' : 'inactive'}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, isActive: e.target.value === 'active' }))
                  }
                >
                  <option value="active">Activo</option>
                  <option value="inactive">Inactivo</option>
                </select>
              </div>
            )}
          </div>
          <div className="form-group">
            <label className="form-label">Pregunta</label>
            <input
              className="form-input"
              required
              placeholder="Ej. ¿Cómo consulto las existencias mínimas?"
              value={form.question}
              onChange={(e) => setForm((f) => ({ ...f, question: e.target.value }))}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Respuesta</label>
            <textarea
              className="form-input"
              required
              rows={4}
              placeholder="Explica el flujo con términos del negocio (existencias, presentación, compra…)."
              value={form.answer}
              onChange={(e) => setForm((f) => ({ ...f, answer: e.target.value }))}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Palabras clave (opcional)</label>
            <input
              className="form-input"
              placeholder="existencias presentación compra proveedor"
              value={form.keywords}
              onChange={(e) => setForm((f) => ({ ...f, keywords: e.target.value }))}
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {editingId ? 'Guardar cambios' : 'Crear artículo'}
          </button>
        </form>
      </Can>

      <div className="page-filters" style={{ marginBottom: '1rem' }}>
        <div className="form-group" style={{ flex: 1, minWidth: 220 }}>
          <label className="form-label">Buscar</label>
          <input
            className="form-input"
            placeholder="Pregunta, respuesta, categoría o palabras clave…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Estado</label>
          <select
            className="form-input"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as StatusFilter)
              setPage(1)
            }}
          >
            <option value="all">Todos</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="loading-screen" style={{ minHeight: 160 }}>
          <div className="spinner" />
        </div>
      ) : articles.length === 0 ? (
        <div className="empty-state">
          {searchDebounced || status !== 'all'
            ? 'No hay artículos que coincidan con la búsqueda o el filtro de estado.'
            : 'Aún no hay artículos de ayuda. Crea el primero con el formulario de arriba.'}
        </div>
      ) : (
        <>
          <DataList label="Artículos de ayuda">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Categoría</th>
                  <th>Pregunta</th>
                  <th>Estado</th>
                  <th>Orden</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {articles.map((article) => (
                  <tr key={article.faqArticleId}>
                    <td data-label="Categoría">{article.categoryName}</td>
                    <td data-label="Pregunta">
                      <strong>{article.question}</strong>
                      <div style={{ color: 'var(--color-text-muted)', marginTop: 4 }}>
                        {article.answer.length > 160
                          ? `${article.answer.slice(0, 160)}…`
                          : article.answer}
                      </div>
                    </td>
                    <td data-label="Estado">
                      <span className={`badge ${article.isActive ? 'badge-success' : 'badge-muted'}`}>
                        {article.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td data-label="Orden">{article.sortOrder}</td>
                    <td data-label="" className="data-table__actions">
                      <Can permission={P.Faq.Manage}>
                        <div className="row-actions">
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            onClick={() => startEdit(article)}
                          >
                            Editar
                          </button>
                          <RowActions
                            isActive={article.isActive}
                            onDeactivate={() => deactivateMutation.mutate(article.faqArticleId)}
                            onDelete={() => deleteMutation.mutate(article.faqArticleId)}
                            deactivatePending={deactivateMutation.isPending}
                            deletePending={deleteMutation.isPending}
                            confirmDeleteMessage="Se eliminará el artículo de forma permanente. ¿Deseas continuar?"
                          />
                        </div>
                      </Can>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </DataList>
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
