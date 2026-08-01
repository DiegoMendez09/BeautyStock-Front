import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import {
  downloadApplicationLogPdf,
  downloadApplicationLogsExportPdf,
  downloadAuditLogPdf,
  downloadAuditLogsExportPdf,
  downloadFaqChatLogPdf,
  downloadFaqChatLogsExportPdf,
  downloadLoginLogPdf,
  downloadLoginLogsExportPdf,
  getApplicationLogs,
  getAuditLogs,
  getFaqChatLogs,
  getLoginAudit,
} from '../../../api/ops'
import { DEFAULT_PAGE_SIZE } from '../../../api/pagination'
import { Can } from '../../../components/auth/Can'
import { DataList } from '../../../components/ui/DataList'
import { PaginationBar } from '../../../components/ui/PaginationBar'
import { useAuth } from '../../../hooks/useAuth'
import { P } from '../../../lib/permissions'
type AuditTab = 'logins' | 'audit' | 'application' | 'faq-chat'

function toIsoStart(date: string): string | undefined {
  if (!date) return undefined
  return `${date}T00:00:00.000Z`
}

function toIsoEnd(date: string): string | undefined {
  if (!date) return undefined
  return `${date}T23:59:59.999Z`
}

export function AuditPage() {
  const { hasPermission } = useAuth()
  const canView = hasPermission(P.Audit.View)

  const [tab, setTab] = useState<AuditTab>('logins')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [userAccountId, setUserAccountId] = useState('')
  const [action, setAction] = useState('')
  const [email, setEmail] = useState('')
  const [level, setLevel] = useState('')
  const [queryText, setQueryText] = useState('')
  const [loginResult, setLoginResult] = useState('')
  const [pdfError, setPdfError] = useState('')

  const userIdFilter = userAccountId ? Number(userAccountId) : undefined
  const dateFilters = {
    from: toIsoStart(from),
    to: toIsoEnd(to),
    userAccountId: Number.isFinite(userIdFilter) ? userIdFilter : undefined,
  }

  const resetPage = () => setPage(1)

  const loginsQuery = useQuery({
    queryKey: ['audit', 'logins', { page, pageSize, ...dateFilters, email, loginResult }],
    queryFn: () =>
      getLoginAudit({
        page,
        pageSize,
        ...dateFilters,
        email: email.trim() || undefined,
        isSuccess: loginResult === '' ? undefined : loginResult === 'ok',
      }),
    enabled: canView && tab === 'logins',
    placeholderData: keepPreviousData,
  })

  const auditQuery = useQuery({
    queryKey: ['audit', 'logs', { page, pageSize, ...dateFilters, action }],
    queryFn: () =>
      getAuditLogs({
        page,
        pageSize,
        ...dateFilters,
        action: action.trim() || undefined,
      }),
    enabled: canView && tab === 'audit',
    placeholderData: keepPreviousData,
  })

  const appQuery = useQuery({
    queryKey: ['audit', 'application', { page, pageSize, ...dateFilters, level }],
    queryFn: () =>
      getApplicationLogs({
        page,
        pageSize,
        ...dateFilters,
        level: level.trim() || undefined,
      }),
    enabled: canView && tab === 'application',
    placeholderData: keepPreviousData,
  })

  const faqQuery = useQuery({
    queryKey: ['audit', 'faq-chat', { page, pageSize, ...dateFilters, queryText }],
    queryFn: () =>
      getFaqChatLogs({
        page,
        pageSize,
        ...dateFilters,
        queryText: queryText.trim() || undefined,
      }),
    enabled: canView && tab === 'faq-chat',
    placeholderData: keepPreviousData,
  })

  const exportMutation = useMutation({
    mutationFn: async () => {
      if (tab === 'logins') {
        await downloadLoginLogsExportPdf({
          ...dateFilters,
          email: email.trim() || undefined,
          isSuccess: loginResult === '' ? undefined : loginResult === 'ok',
        })
      } else if (tab === 'audit') {
        await downloadAuditLogsExportPdf({
          ...dateFilters,
          action: action.trim() || undefined,
        })
      } else if (tab === 'application') {
        await downloadApplicationLogsExportPdf({
          ...dateFilters,
          level: level.trim() || undefined,
        })
      } else {
        await downloadFaqChatLogsExportPdf({
          ...dateFilters,
          queryText: queryText.trim() || undefined,
        })
      }
    },
    onMutate: () => setPdfError(''),
    onError: (err) => {
      setPdfError(err instanceof Error ? err.message : 'No se pudo exportar el historial en PDF')
    },
  })

  const rowPdfMutation = useMutation({
    mutationFn: async ({ id, kind }: { id: number; kind: AuditTab }) => {
      if (kind === 'logins') await downloadLoginLogPdf(id)
      else if (kind === 'audit') await downloadAuditLogPdf(id)
      else if (kind === 'application') await downloadApplicationLogPdf(id)
      else await downloadFaqChatLogPdf(id)
    },
    onMutate: () => setPdfError(''),
    onError: (err) => {
      setPdfError(err instanceof Error ? err.message : 'No se pudo descargar el PDF')
    },
  })

  if (!canView) {
    return <Navigate to="/panel" replace />
  }

  const active =
    tab === 'logins'
      ? loginsQuery
      : tab === 'audit'
        ? auditQuery
        : tab === 'application'
          ? appQuery
          : faqQuery

  const switchTab = (next: AuditTab) => {
    setTab(next)
    setPage(1)
  }

  return (
    <div className="page">
      <header className="page-header">
        <h1 className="page-title">Auditoría</h1>
        <p className="page-subtitle">
          Registros de acceso, acciones de negocio, eventos de aplicación y consultas del asistente FAQ.
        </p>
      </header>

      <div className="tabs" role="tablist" aria-label="Tipos de registro">
        <button
          type="button"
          role="tab"
          className={`tab${tab === 'logins' ? ' tab--active' : ''}`}
          aria-selected={tab === 'logins'}
          onClick={() => switchTab('logins')}
        >
          Inicio de sesión
        </button>
        <button
          type="button"
          role="tab"
          className={`tab${tab === 'audit' ? ' tab--active' : ''}`}
          aria-selected={tab === 'audit'}
          onClick={() => switchTab('audit')}
        >
          Auditoría
        </button>
        <button
          type="button"
          role="tab"
          className={`tab${tab === 'application' ? ' tab--active' : ''}`}
          aria-selected={tab === 'application'}
          onClick={() => switchTab('application')}
        >
          Aplicación
        </button>
        <button
          type="button"
          role="tab"
          className={`tab${tab === 'faq-chat' ? ' tab--active' : ''}`}
          aria-selected={tab === 'faq-chat'}
          onClick={() => switchTab('faq-chat')}
        >
          Chat FAQ
        </button>
      </div>

      <div className="page-filters" style={{ marginBottom: '1rem' }}>
        <div className="form-group">
          <label className="form-label">Desde</label>
          <input
            className="form-input"
            type="date"
            value={from}
            onChange={(e) => {
              setFrom(e.target.value)
              resetPage()
            }}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Hasta</label>
          <input
            className="form-input"
            type="date"
            value={to}
            onChange={(e) => {
              setTo(e.target.value)
              resetPage()
            }}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Id. usuario</label>
          <input
            className="form-input"
            type="number"
            min={1}
            placeholder="Opcional"
            value={userAccountId}
            onChange={(e) => {
              setUserAccountId(e.target.value)
              resetPage()
            }}
          />
        </div>
        {tab === 'logins' && (
          <>
            <div className="form-group">
              <label className="form-label">Correo</label>
              <input
                className="form-input"
                value={email}
                placeholder="Buscar correo…"
                onChange={(e) => {
                  setEmail(e.target.value)
                  resetPage()
                }}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Resultado</label>
              <select
                className="form-input"
                value={loginResult}
                onChange={(e) => {
                  setLoginResult(e.target.value)
                  resetPage()
                }}
              >
                <option value="">Todos</option>
                <option value="ok">Correcto</option>
                <option value="fail">Fallido</option>
              </select>
            </div>
          </>
        )}
        {tab === 'audit' && (
          <div className="form-group">
            <label className="form-label">Acción</label>
            <select
              className="form-input"
              value={action}
              onChange={(e) => {
                setAction(e.target.value)
                resetPage()
              }}
            >
              <option value="">Todas</option>
              <option value="Create">Crear</option>
              <option value="Update">Actualizar</option>
              <option value="Deactivate">Desactivar</option>
              <option value="Delete">Eliminar</option>
              <option value="AdjustStock">Ajuste de existencias</option>
              <option value="Receive">Recibir compra</option>
              <option value="Sale">Venta</option>
            </select>
          </div>
        )}
        {tab === 'application' && (
          <div className="form-group">
            <label className="form-label">Nivel</label>
            <select
              className="form-input"
              value={level}
              onChange={(e) => {
                setLevel(e.target.value)
                resetPage()
              }}
            >
              <option value="">Todos</option>
              <option value="Error">Error</option>
              <option value="Warning">Advertencia</option>
              <option value="Info">Información</option>
            </select>
          </div>
        )}
        {tab === 'faq-chat' && (
          <div className="form-group">
            <label className="form-label">Consulta</label>
            <input
              className="form-input"
              value={queryText}
              placeholder="Texto de la consulta…"
              onChange={(e) => {
                setQueryText(e.target.value)
                resetPage()
              }}
            />
          </div>
        )}
        <div className="form-group" style={{ alignSelf: 'flex-end' }}>
          <Can permission={P.Audit.View}>
            <button
              type="button"
              className="btn btn-primary"
              disabled={exportMutation.isPending}
              onClick={() => exportMutation.mutate()}
            >
              {exportMutation.isPending ? 'Generando…' : 'Descargar PDF'}
            </button>
          </Can>
        </div>
      </div>

      <p className="page-subtitle" style={{ marginBottom: '0.75rem' }}>
        El PDF histórico aplica los filtros actuales (máx. 5000 filas). Sin fechas se exportan los
        registros más recientes hasta ese límite.
      </p>

      {pdfError && <div className="alert alert-error">{pdfError}</div>}
      {active.isError && (
        <div className="alert alert-error">No se pudo cargar el registro seleccionado</div>
      )}

      {active.isLoading ? (
        <div className="loading-screen" style={{ minHeight: 160 }}>
          <div className="spinner" />
        </div>
      ) : tab === 'logins' ? (
        <LoginTable
          items={loginsQuery.data?.items ?? []}
          onPdf={(id) => rowPdfMutation.mutate({ id, kind: 'logins' })}
          pdfPending={rowPdfMutation.isPending}
        />
      ) : tab === 'audit' ? (
        <AuditTable
          items={auditQuery.data?.items ?? []}
          onPdf={(id) => rowPdfMutation.mutate({ id, kind: 'audit' })}
          pdfPending={rowPdfMutation.isPending}
        />
      ) : tab === 'application' ? (
        <ApplicationTable
          items={appQuery.data?.items ?? []}
          onPdf={(id) => rowPdfMutation.mutate({ id, kind: 'application' })}
          pdfPending={rowPdfMutation.isPending}
        />
      ) : (
        <FaqChatTable
          items={faqQuery.data?.items ?? []}
          onPdf={(id) => rowPdfMutation.mutate({ id, kind: 'faq-chat' })}
          pdfPending={rowPdfMutation.isPending}
        />
      )}

      {active.data && (
        <PaginationBar
          page={active.data.page}
          pageSize={active.data.pageSize}
          totalCount={active.data.totalCount}
          totalPages={active.data.totalPages}
          isFetching={active.isFetching}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size)
            setPage(1)
          }}
        />
      )}
    </div>
  )
}

function LoginTable({
  items,
  onPdf,
  pdfPending,
}: {
  items: Awaited<ReturnType<typeof getLoginAudit>>['items']
  onPdf: (id: number) => void
  pdfPending: boolean
}) {
  if (items.length === 0) {
    return <div className="empty-state">No hay intentos de inicio de sesión con estos filtros</div>
  }

  return (
    <DataList label="Intentos de inicio de sesión">
      <table className="data-table">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Correo</th>
            <th>Usuario</th>
            <th>Resultado</th>
            <th>Motivo</th>
            <th>IP</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {items.map((log) => (
            <tr key={log.loginLogId}>
              <td data-label="Fecha">{new Date(log.attemptedAt).toLocaleString('es-PE')}</td>
              <td data-label="Correo">{log.emailAttempted}</td>
              <td data-label="Usuario">{log.userFullName ?? '—'}</td>
              <td data-label="Resultado">
                <span className={`badge ${log.isSuccess ? 'badge-success' : 'badge-muted'}`}>
                  {log.isSuccess ? 'Correcto' : 'Fallido'}
                </span>
              </td>
              <td data-label="Motivo">{log.failureReason ?? '—'}</td>
              <td data-label="IP">{log.ipAddress ?? '—'}</td>
              <td data-label="" className="data-table__actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  disabled={pdfPending}
                  onClick={() => onPdf(log.loginLogId)}
                >
                  PDF
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </DataList>
  )
}

function AuditTable({
  items,
  onPdf,
  pdfPending,
}: {
  items: Awaited<ReturnType<typeof getAuditLogs>>['items']
  onPdf: (id: number) => void
  pdfPending: boolean
}) {
  if (items.length === 0) {
    return <div className="empty-state">No hay acciones de auditoría con estos filtros</div>
  }

  return (
    <DataList label="Acciones de auditoría">
      <table className="data-table">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Usuario</th>
            <th>Acción</th>
            <th>Entidad</th>
            <th>Id.</th>
            <th>Módulo</th>
            <th>IP</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {items.map((log) => (
            <tr key={log.auditLogId}>
              <td data-label="Fecha">{new Date(log.createdAt).toLocaleString('es-PE')}</td>
              <td data-label="Usuario">{log.userFullName ?? (log.userAccountId ? `#${log.userAccountId}` : '—')}</td>
              <td data-label="Acción">{log.action}</td>
              <td data-label="Entidad">{log.entityName}</td>
              <td data-label="Id.">{log.entityId}</td>
              <td data-label="Módulo">{log.moduleCode ?? '—'}</td>
              <td data-label="IP">{log.ipAddress ?? '—'}</td>
              <td data-label="" className="data-table__actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  disabled={pdfPending}
                  onClick={() => onPdf(log.auditLogId)}
                >
                  PDF
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </DataList>
  )
}

function ApplicationTable({
  items,
  onPdf,
  pdfPending,
}: {
  items: Awaited<ReturnType<typeof getApplicationLogs>>['items']
  onPdf: (id: number) => void
  pdfPending: boolean
}) {
  if (items.length === 0) {
    return <div className="empty-state">No hay eventos de aplicación con estos filtros</div>
  }

  return (
    <DataList label="Eventos de aplicación">
      <table className="data-table">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Nivel</th>
            <th>Mensaje</th>
            <th>Origen</th>
            <th>Ruta</th>
            <th>Estado</th>
            <th>Usuario</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {items.map((log) => (
            <tr key={log.applicationLogId}>
              <td data-label="Fecha">{new Date(log.createdAt).toLocaleString('es-PE')}</td>
              <td data-label="Nivel">
                <span
                  className={`badge ${
                    log.level === 'Error' || log.level === 'Warning'
                      ? 'badge-warning'
                      : 'badge-muted'
                  }`}
                >
                  {log.level}
                </span>
              </td>
              <td data-label="Mensaje">{log.message}</td>
              <td data-label="Origen">{log.source ?? '—'}</td>
              <td data-label="Ruta">
                {log.httpMethod ? `${log.httpMethod} ` : ''}
                {log.requestPath ?? '—'}
              </td>
              <td data-label="Estado">{log.statusCode ?? '—'}</td>
              <td data-label="Usuario">{log.userFullName ?? '—'}</td>
              <td data-label="" className="data-table__actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  disabled={pdfPending}
                  onClick={() => onPdf(log.applicationLogId)}
                >
                  PDF
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </DataList>
  )
}

function FaqChatTable({
  items,
  onPdf,
  pdfPending,
}: {
  items: Awaited<ReturnType<typeof getFaqChatLogs>>['items']
  onPdf: (id: number) => void
  pdfPending: boolean
}) {
  if (items.length === 0) {
    return <div className="empty-state">No hay consultas del asistente con estos filtros</div>
  }

  return (
    <DataList label="Consultas del asistente">
      <table className="data-table">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Usuario</th>
            <th>Sesión</th>
            <th>Consulta</th>
            <th>Artículos</th>
            <th>Productos</th>
            <th>IP</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {items.map((log) => (
            <tr key={log.faqChatLogId}>
              <td data-label="Fecha">{new Date(log.createdAt).toLocaleString('es-PE')}</td>
              <td data-label="Usuario">{log.userFullName ?? 'Anónimo'}</td>
              <td data-label="Sesión">
                <code style={{ fontSize: '0.8em' }}>
                  {log.sessionId ? `${log.sessionId.slice(0, 8)}…` : '—'}
                </code>
              </td>
              <td data-label="Consulta">{log.queryText}</td>
              <td data-label="Artículos">{log.matchedArticlesCount}</td>
              <td data-label="Productos">{log.matchedProductsCount}</td>
              <td data-label="IP">{log.ipAddress ?? '—'}</td>
              <td data-label="" className="data-table__actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  disabled={pdfPending}
                  onClick={() => onPdf(log.faqChatLogId)}
                >
                  PDF
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </DataList>
  )
}
