import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { getBrands } from '../../../api/catalog'
import { createBrand, deactivateBrand, deleteBrand } from '../../../api/catalogMutations'
import { DEFAULT_PAGE_SIZE } from '../../../api/pagination'
import { Can } from '../../../components/auth/Can'
import { PaginationBar } from '../../../components/ui/PaginationBar'
import { RowActions } from '../../../components/ui/RowActions'
import { P } from '../../../lib/permissions'

export function BrandsPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
  const { data, isLoading, isError, isFetching } = useQuery({
    queryKey: ['catalog', 'brands', { page, pageSize }],
    queryFn: () => getBrands({ page, pageSize }),
    placeholderData: keepPreviousData,
  })
  const brands = data?.items ?? []
  const [name, setName] = useState('')
  const [country, setCountry] = useState('')

  const invalidate = () => void queryClient.invalidateQueries({ queryKey: ['catalog', 'brands'] })

  const createMutation = useMutation({
    mutationFn: createBrand,
    onSuccess: () => {
      invalidate()
      setName('')
      setCountry('')
    },
  })

  const deactivateMutation = useMutation({
    mutationFn: deactivateBrand,
    onSuccess: invalidate,
  })

  const deleteMutation = useMutation({
    mutationFn: deleteBrand,
    onSuccess: invalidate,
  })

  const handleCreate = (e: FormEvent) => {
    e.preventDefault()
    createMutation.mutate({ name, countryOfOrigin: country || undefined })
  }

  return (
    <div className="page">
      <header className="page-header">
        <h1 className="page-title">Marcas</h1>
        <p className="page-subtitle">Catálogo de marcas</p>
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
        <>
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
                        <RowActions
                          isActive={brand.isActive}
                          onDeactivate={() => deactivateMutation.mutate(brand.brandId)}
                          onDelete={() => deleteMutation.mutate(brand.brandId)}
                          deactivatePending={deactivateMutation.isPending}
                          deletePending={deleteMutation.isPending}
                        />
                      </Can>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
