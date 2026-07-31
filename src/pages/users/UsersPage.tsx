import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { createUser, deleteUser, getRoles, getUsers, updateUser } from '../../api/users'
import { Can } from '../../components/auth/Can'
import { useAuth } from '../../hooks/useAuth'
import { P } from '../../lib/permissions'
import type { UserAccount } from '../../types'

export function UsersPage() {
  const { hasPermission } = useAuth()
  const canManage = hasPermission(P.Users.Manage)
  const queryClient = useQueryClient()
  const { data: users = [], isLoading, isError } = useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
  })
  const { data: roles = [] } = useQuery({
    queryKey: ['roles'],
    queryFn: getRoles,
    enabled: canManage,
  })

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'Support',
  })
  const [error, setError] = useState('')

  const createMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['users'] })
      setForm({ fullName: '', email: '', password: '', role: 'Support' })
      setError('')
    },
    onError: () => setError('No se pudo crear el usuario'),
  })

  const toggleMutation = useMutation({
    mutationFn: (user: UserAccount) =>
      updateUser(user.userAccountId, {
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        isActive: !user.isActive,
      }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['users'] }),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['users'] }),
  })

  const handleCreate = (e: FormEvent) => {
    e.preventDefault()
    createMutation.mutate(form)
  }

  return (
    <div className="page">
      <header className="page-header">
        <h1 className="page-title">Usuarios</h1>
        <p className="page-subtitle">Cuentas y roles del sistema</p>
      </header>

      {error && <div className="alert alert-error">{error}</div>}
      {isError && <div className="alert alert-error">No se pudieron cargar los usuarios</div>}

      <Can permission={P.Users.Manage}>
        <form className="card" onSubmit={handleCreate} style={{ marginBottom: '1.25rem' }}>
          <h2 className="card-title">Nuevo usuario</h2>
          <div className="page-filters">
            <div className="form-group">
              <label className="form-label">Nombre</label>
              <input
                className="form-input"
                required
                value={form.fullName}
                onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Correo</label>
              <input
                type="email"
                className="form-input"
                required
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Contraseña</label>
              <input
                type="password"
                className="form-input"
                required
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Rol</label>
              <select
                className="form-input"
                value={form.role}
                onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
              >
                {roles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button type="submit" className="btn btn-primary" disabled={createMutation.isPending}>
            Crear
          </button>
        </form>
      </Can>

      {isLoading ? (
        <div className="loading-screen" style={{ minHeight: 160 }}>
          <div className="spinner" />
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Rol</th>
                <th>Estado</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.userAccountId}>
                  <td>{user.fullName}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>
                    <span className={`badge ${user.isActive ? 'badge-success' : 'badge-muted'}`}>
                      {user.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td>
                    <Can permission={P.Users.Manage}>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => toggleMutation.mutate(user)}
                      >
                        {user.isActive ? 'Desactivar' : 'Activar'}
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => deleteMutation.mutate(user.userAccountId)}
                      >
                        Baja
                      </button>
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
