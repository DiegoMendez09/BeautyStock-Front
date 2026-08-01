import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '../../../api/pagination'
import { getSettingsOverview } from '../../../api/modules'
import { DataList } from '../../../components/ui/DataList'
import { PaginationBar } from '../../../components/ui/PaginationBar'
import { roleLabel } from '../../../lib/labels'

export function SettingsPage() {
  const { data, isLoading, isError, isFetching } = useQuery({
    queryKey: ['settings', 'overview'],
    queryFn: getSettingsOverview,
    placeholderData: keepPreviousData,
  })

  const [rolesPage, setRolesPage] = useState(DEFAULT_PAGE)
  const [rolesPageSize, setRolesPageSize] = useState(DEFAULT_PAGE_SIZE)
  const [permsPage, setPermsPage] = useState(DEFAULT_PAGE)
  const [permsPageSize, setPermsPageSize] = useState(DEFAULT_PAGE_SIZE)

  const roles = data?.roles ?? []
  const rolePermissions = data?.rolePermissions ?? []

  const rolesTotalPages = Math.max(1, Math.ceil(roles.length / rolesPageSize) || 1)
  const rolesPageItems = useMemo(() => {
    const start = (rolesPage - 1) * rolesPageSize
    return roles.slice(start, start + rolesPageSize)
  }, [roles, rolesPage, rolesPageSize])

  const permsTotalPages = Math.max(1, Math.ceil(rolePermissions.length / permsPageSize) || 1)
  const permsPageItems = useMemo(() => {
    const start = (permsPage - 1) * permsPageSize
    return rolePermissions.slice(start, start + permsPageSize)
  }, [rolePermissions, permsPage, permsPageSize])

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
            <DataList label="Roles del sistema">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Rol</th>
                    <th>Código</th>
                  </tr>
                </thead>
                <tbody>
                  {rolesPageItems.length === 0 ? (
                    <tr>
                      <td colSpan={2}>Sin roles</td>
                    </tr>
                  ) : (
                    rolesPageItems.map((role) => (
                      <tr key={role}>
                        <td data-label="Rol">{roleLabel(role)}</td>
                        <td data-label="Código">
                          <code>{role}</code>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </DataList>
            <PaginationBar
              page={Math.min(rolesPage, rolesTotalPages)}
              pageSize={rolesPageSize}
              totalCount={roles.length}
              totalPages={rolesTotalPages}
              isFetching={isFetching}
              label="Paginación de roles"
              onPageChange={setRolesPage}
              onPageSizeChange={(size) => {
                setRolesPageSize(size)
                setRolesPage(1)
              }}
            />
          </div>

          <div className="card" style={{ marginBottom: '1rem' }}>
            <h2 className="card-title">Módulos</h2>
            <DataList label="Módulos del sistema">
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
                      <td data-label="Código">{m.code}</td>
                      <td data-label="Nombre">{m.name}</td>
                      <td data-label="Ruta">{m.routePath ?? '—'}</td>
                      <td data-label="Estado">{m.isActive ? 'Activo' : 'Inactivo'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </DataList>
          </div>

          <div className="card">
            <h2 className="card-title">Permisos por rol</h2>
            <DataList label="Permisos por rol">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Rol</th>
                    <th>Permiso</th>
                  </tr>
                </thead>
                <tbody>
                  {permsPageItems.length === 0 ? (
                    <tr>
                      <td colSpan={2}>Sin permisos</td>
                    </tr>
                  ) : (
                    permsPageItems.map((rp, i) => (
                      <tr key={`${rp.role}-${rp.permissionCode}-${i}`}>
                        <td data-label="Rol">{roleLabel(rp.role)}</td>
                        <td data-label="Permiso">{rp.permissionCode}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </DataList>
            <PaginationBar
              page={Math.min(permsPage, permsTotalPages)}
              pageSize={permsPageSize}
              totalCount={rolePermissions.length}
              totalPages={permsTotalPages}
              isFetching={isFetching}
              label="Paginación de permisos por rol"
              onPageChange={setPermsPage}
              onPageSizeChange={(size) => {
                setPermsPageSize(size)
                setPermsPage(1)
              }}
            />
          </div>
        </>
      )}
    </div>
  )
}
