import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { createCustomer, deleteCustomer, getCustomers, updateCustomer } from '../../api/customers'
import { useAuth } from '../../hooks/useAuth'

export function CustomersPage() {
  const { hasPermission } = useAuth()
  const canCreate = hasPermission('Customers.Create')
  const canUpdate = hasPermission('Customers.Update')
  const canDelete = hasPermission('Customers.Delete')
  const queryClient = useQueryClient()
  const { data: customers = [], isLoading, isError } = useQuery({
    queryKey: ['customers'],
    queryFn: () => getCustomers(),
  })

  const [form, setForm] = useState({ fullName: '', email: '', phone: '', documentNumber: '' })
  const [error, setError] = useState('')

  const createMutation = useMutation({
    mutationFn: createCustomer,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['customers'] })
      setForm({ fullName: '', email: '', phone: '', documentNumber: '' })
      setError('')
    },
    onError: () => setError('No se pudo crear el cliente'),
  })

  const deactivateMutation = useMutation({
    mutationFn: deleteCustomer,
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['customers'] }),
  })

  const handleCreate = (e: FormEvent) => {
    e.preventDefault()
    createMutation.mutate({
      fullName: form.fullName,
      email: form.email || undefined,
      phone: form.phone || undefined,
      documentNumber: form.documentNumber || undefined,
    })
  }

  return (
    <div className="page">
      <header className="page-header">
        <h1 className="page-title">Clientes</h1>
        <p className="page-subtitle">Gestión de clientes y fidelización</p>
      </header>

      {error && <div className="alert alert-error">{error}</div>}
      {isError && <div className="alert alert-error">No se pudieron cargar los clientes</div>}

      {canCreate && (
        <form className="card" onSubmit={handleCreate} style={{ marginBottom: '1.25rem' }}>
          <h2 className="card-title">Nuevo cliente</h2>
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
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Teléfono</label>
              <input
                className="form-input"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Documento</label>
              <input
                className="form-input"
                value={form.documentNumber}
                onChange={(e) => setForm((f) => ({ ...f, documentNumber: e.target.value }))}
              />
            </div>
          </div>
          <button type="submit" className="btn btn-primary" disabled={createMutation.isPending}>
            Crear
          </button>
        </form>
      )}

      {isLoading ? (
        <div className="loading-screen" style={{ minHeight: 160 }}>
          <div className="spinner" />
        </div>
      ) : customers.length === 0 ? (
        <div className="empty-state">No hay clientes registrados</div>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Teléfono</th>
                <th>Puntos</th>
                <th>Estado</th>
                {(canUpdate || canDelete) && <th />}
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.customerId}>
                  <td>{customer.fullName}</td>
                  <td>{customer.email ?? '—'}</td>
                  <td>{customer.phone ?? '—'}</td>
                  <td>{customer.loyaltyPoints}</td>
                  <td>
                    <span className={`badge ${customer.isActive ? 'badge-success' : 'badge-muted'}`}>
                      {customer.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  {(canUpdate || canDelete) && (
                    <td>
                      {canDelete && customer.isActive && (
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          onClick={() => deactivateMutation.mutate(customer.customerId)}
                        >
                          Desactivar
                        </button>
                      )}
                      {canUpdate && !customer.isActive && (
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          onClick={() =>
                            void updateCustomer(customer.customerId, {
                              fullName: customer.fullName,
                              email: customer.email ?? undefined,
                              phone: customer.phone ?? undefined,
                              documentNumber: customer.documentNumber ?? undefined,
                              notes: customer.notes ?? undefined,
                              isActive: true,
                            }).then(() =>
                              queryClient.invalidateQueries({ queryKey: ['customers'] }),
                            )
                          }
                        >
                          Reactivar
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
