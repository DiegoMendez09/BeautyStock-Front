import { useQuery } from '@tanstack/react-query'
import { getLoginAudit } from '../../../api/ops'

export function AuditPage() {
  const { data: logins = [], isLoading, isError } = useQuery({
    queryKey: ['audit', 'logins'],
    queryFn: () => getLoginAudit(80),
  })

  return (
    <div className="page">
      <header className="page-header">
        <h1 className="page-title">Auditoría</h1>
        <p className="page-subtitle">Intentos de inicio de sesión recientes</p>
      </header>

      {isError && <div className="alert alert-error">No se pudo cargar la auditoría</div>}

      {isLoading ? (
        <div className="loading-screen" style={{ minHeight: 160 }}>
          <div className="spinner" />
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Correo</th>
                <th>Resultado</th>
                <th>Motivo</th>
                <th>IP</th>
              </tr>
            </thead>
            <tbody>
              {logins.map((log) => (
                <tr key={log.loginLogId}>
                  <td>{new Date(log.attemptedAt).toLocaleString('es-PE')}</td>
                  <td>{log.emailAttempted}</td>
                  <td>
                    <span className={`badge ${log.isSuccess ? 'badge-success' : 'badge-muted'}`}>
                      {log.isSuccess ? 'Correcto' : 'Fallido'}
                    </span>
                  </td>
                  <td>{log.failureReason ?? '—'}</td>
                  <td>{log.ipAddress ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
