import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import {
  createCustomer,
  deactivateCustomer,
  deleteCustomer,
  getCustomers,
  updateCustomer,
} from '../../../api/customers'
import { DEFAULT_PAGE_SIZE } from '../../../api/pagination'
import { DataList } from '../../../components/ui/DataList'
import { PaginationBar } from '../../../components/ui/PaginationBar'
import { RowActions } from '../../../components/ui/RowActions'
import { useAuth } from '../../../hooks/useAuth'
export function CustomersPage() {
  const { hasPermission } = useAuth()
  const canCreate = hasPermission('Customers.Create')
  const canUpdate = hasPermission('Customers.Update')
  const canDelete = hasPermission('Customers.Delete')
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
  const { data, isLoading, isError, isFetching } = useQuery({
    queryKey: ['customers', { page, pageSize }],
    queryFn: () => getCustomers({ page, pageSize }),
    placeholderData: keepPreviousData,
  })
  const customers = data?.items ?? []

  const [form, setForm] = useState({ fullName: '', email: '', phone: '', documentNumber: '' })
  const [error, setError] = useState('')

  const invalidate = () => void queryClient.invalidateQueries({ queryKey: ['customers'] })

  const createMutation = useMutation({
    mutationFn: createCustomer,
    onSuccess: () => {
      invalidate()
      setForm({ fullName: '', email: '', phone: '', documentNumber: '' })
      setError('')
    },
    onError: () => setError('No se pudo crear el cliente'),
  })

  const deactivateMutation = useMutation({
    mutationFn: deactivateCustomer,
    onSuccess: invalidate,
  })

  const deleteMutation = useMutation({
    mutationFn: deleteCustomer,
    onSuccess: invalidate,
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
        <>
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
        </>
      )}

      {isLoading ? (
        <div className="loading-screen" style={{ minHeight: 160 }}>
          <div className="spinner" />
        </div>
      ) : customers.length === 0 ? (
        <div className="empty-state">No hay clientes registrados</div>
      ) : (
        <>
          <DataList label="Lista de clientes">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Correo</th>
                  <th>Teléfono</th>
                  <th>Puntos</th>
                  <th>Estado</th>
                  {(canUpdate || canDelete) && <th>Acciones</th>}
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.customerId}>
                    <td data-label="Nombre">{customer.fullName}</td>
                    <td data-label="Correo">{customer.email ?? '—'}</td>
                    <td data-label="Teléfono">{customer.phone ?? '—'}</td>
                    <td data-label="Puntos">{customer.loyaltyPoints}</td>
                    <td data-label="Estado">
                      <span className={`badge ${customer.isActive ? 'badge-success' : 'badge-muted'}`}>
                        {customer.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    {(canUpdate || canDelete) && (
                      <td data-label="" className="data-table__actions">
                        <RowActions
                          isActive={customer.isActive}
                          canDeactivate={canDelete}
                          canDelete={canDelete}
                          onDeactivate={() => deactivateMutation.mutate(customer.customerId)}
                          onDelete={() => deleteMutation.mutate(customer.customerId)}
                          deactivatePending={deactivateMutation.isPending}
                          deletePending={deleteMutation.isPending}
                        />
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
                              }).then(invalidate)
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
