import { useQuery } from '@tanstack/react-query'
import { getSettingsOverview } from '../../../api/modules'
import { roleLabel } from '../../../lib/labels'

export function SettingsPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['settings', 'overview'],
    queryFn: getSettingsOverview,
  })

  return (
    <div className="page">
      <header className="page-header">
        <h1 className="page-title">Configuración</h1>
        <p className="page-subtitle">Módulos, permisos y matriz de roles (solo superadministrador)</p>
      </header>

      {isError && (
        <div className="alert alert-error">
          No se pudo cargar la configuración (se requiere permiso de administración)
        </div>
      )}

      {isLoading || !data ? (
        <div className="loading-screen" style={{ minHeight: 160 }}>
          <div className="spinner" />
        </div>
      ) : (
        <>
          <div className="card" style={{ marginBottom: '1rem' }}>
            <h2 className="card-title">Roles</h2>
            <p>{data.roles.map(roleLabel).join(' · ')}</p>
          </div>

          <div className="card" style={{ marginBottom: '1rem' }}>
            <h2 className="card-title">Módulos</h2>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Nombre</th>
                  <th>Ruta</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {data.modules.map((m) => (
                  <tr key={m.moduleId}>
                    <td>{m.code}</td>
                    <td>{m.name}</td>
                    <td>{m.routePath ?? '—'}</td>
                    <td>{m.isActive ? 'Activo' : 'Inactivo'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="card">
            <h2 className="card-title">Permisos por rol (extracto)</h2>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Rol</th>
                  <th>Permiso</th>
                </tr>
              </thead>
              <tbody>
                {data.rolePermissions.slice(0, 80).map((rp, i) => (
                  <tr key={`${rp.role}-${rp.permissionCode}-${i}`}>
                    <td>{roleLabel(rp.role)}</td>
                    <td>{rp.permissionCode}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
