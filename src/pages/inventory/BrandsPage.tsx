import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { createBrand, deactivateBrand, getBrands } from '../../api/catalogMutations'
import { Can } from '../../components/auth/Can'
import { P } from '../../lib/permissions'

export function BrandsPage() {
  const queryClient = useQueryClient()
  const { data: brands = [], isLoading, isError } = useQuery({
    queryKey: ['catalog', 'brands'],
    queryFn: getBrands,
  })
  const [name, setName] = useState('')
  const [country, setCountry] = useState('')

  const createMutation = useMutation({
    mutationFn: createBrand,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['catalog', 'brands'] })
      setName('')
      setCountry('')
    },
  })

  const deactivateMutation = useMutation({
    mutationFn: deactivateBrand,
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['catalog', 'brands'] }),
  })

  const handleCreate = (e: FormEvent) => {
    e.preventDefault()
    createMutation.mutate({ name, countryOfOrigin: country || undefined })
  }

  return (
    <div className="page">
      <header className="page-header">
        <h1 className="page-title">Marcas</h1>
        <p className="page-subtitle">Catálogo de marcas (Catalog.Create / Delete → desactivar)</p>
      </header>

      {isError && <div className="alert alert-error">No se pudieron cargar las marcas</div>}

      <Can permission={P.Catalog.Create}>
        <form className="card" onSubmit={handleCreate} style={{ marginBottom: '1.25rem' }}>
          <h2 className="card-title">Nueva marca</h2>
          <div className="page-filters">
            <div className="form-group">
              <label className="form-label">Nombre</label>
              <input
                className="form-input"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">País de origen</label>
              <input
                className="form-input"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              />
            </div>
          </div>
          <button type="submit" className="btn btn-primary" disabled={createMutation.isPending}>
            Crear marca
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
                <th>País</th>
                <th>Estado</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {brands.map((brand) => (
                <tr key={brand.brandId}>
                  <td>{brand.name}</td>
                  <td>{brand.countryOfOrigin ?? '—'}</td>
                  <td>
                    <span className={`badge ${brand.isActive ? 'badge-success' : 'badge-muted'}`}>
                      {brand.isActive ? 'Activa' : 'Inactiva'}
                    </span>
                  </td>
                  <td>
                    <Can permission={P.Catalog.Delete}>
                      {brand.isActive && (
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          onClick={() => deactivateMutation.mutate(brand.brandId)}
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
