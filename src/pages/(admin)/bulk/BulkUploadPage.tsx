import { useMutation } from '@tanstack/react-query'
import { useId, useMemo, useState, type ChangeEvent } from 'react'
import {
  downloadBulkTemplate,
  uploadBulkFile,
  type BulkAction,
  type BulkImportResult,
  type BulkModule,
} from '../../../api/bulk'
import { DataList } from '../../../components/ui/DataList'
import { useAuth } from '../../../hooks/useAuth'
import { anyPermissionGranted, P } from '../../../lib/permissions'

type ModuleOption = {
  value: BulkModule
  label: string
  actions: BulkAction[]
  /** Permisos que habilitan este módulo en la UI */
  permissions: string[]
  hint?: string
}

const ACTION_LABELS: Record<BulkAction, string> = {
  create: 'Crear',
  update: 'Actualizar',
  deactivate: 'Desactivar',
  delete: 'Eliminar',
}

const ALL_ACTIONS: BulkAction[] = ['create', 'update', 'deactivate', 'delete']

const MODULE_OPTIONS: ModuleOption[] = [
  {
    value: 'categories',
    label: 'Categorías',
    actions: ALL_ACTIONS,
    permissions: [P.Catalog.Create, P.Catalog.Update, P.Catalog.Delete, P.Catalog.Manage],
  },
  {
    value: 'brands',
    label: 'Marcas',
    actions: ALL_ACTIONS,
    permissions: [P.Catalog.Create, P.Catalog.Update, P.Catalog.Delete, P.Catalog.Manage],
  },
  {
    value: 'products',
    label: 'Productos',
    actions: ['update', 'deactivate', 'delete'],
    permissions: [P.Catalog.Update, P.Catalog.Delete, P.Catalog.Manage],
    hint: 'La creación masiva no está disponible: los productos se dan de alta al registrar una compra.',
  },
  {
    value: 'customers',
    label: 'Clientes',
    actions: ALL_ACTIONS,
    permissions: [P.Customers.Create, P.Customers.Update, P.Customers.Delete, P.Customers.Manage],
  },
  {
    value: 'faq',
    label: 'FAQ',
    actions: ALL_ACTIONS,
    permissions: [P.Faq.Manage],
  },
  {
    value: 'suppliers',
    label: 'Proveedores',
    actions: ['create', 'deactivate', 'delete'],
    permissions: [P.Purchases.Create, P.Purchases.Delete, P.Purchases.Update],
    hint: 'Los proveedores no tienen actualización masiva.',
  },
]

const ACCEPT =
  '.xlsx,.xls,.csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv'

const PAGE_ACCESS = [
  P.BulkUpload.Manage,
  P.Catalog.Create,
  P.Catalog.Update,
  P.Catalog.Delete,
  P.Catalog.Manage,
  P.Customers.Create,
  P.Customers.Update,
  P.Customers.Delete,
  P.Customers.Manage,
  P.Faq.Manage,
  P.Purchases.Create,
  P.Purchases.Delete,
  P.Purchases.Update,
]

export function BulkUploadPage() {
  const { user, hasPermission } = useAuth()
  const formId = useId()
  const canAccess = anyPermissionGranted(user?.permissions, user?.role, PAGE_ACCESS)

  const availableModules = useMemo(
    () =>
      MODULE_OPTIONS.filter(
        (m) =>
          hasPermission(P.BulkUpload.Manage) ||
          anyPermissionGranted(user?.permissions, user?.role, m.permissions),
      ),
    [hasPermission, user?.permissions, user?.role],
  )

  const [module, setModule] = useState<BulkModule | ''>('')
  const [action, setAction] = useState<BulkAction | ''>('')
  const [file, setFile] = useState<File | null>(null)
  const [result, setResult] = useState<BulkImportResult | null>(null)
  const [error, setError] = useState('')
  const [showSuccesses, setShowSuccesses] = useState(false)

  const selectedModule = availableModules.find((m) => m.value === module)
  const allowedActions = selectedModule?.actions ?? []

  const onModuleChange = (value: BulkModule | '') => {
    setModule(value)
    setAction('')
    setFile(null)
    setError('')
  }

  const onActionChange = (value: BulkAction | '') => {
    setAction(value)
    setFile(null)
    setError('')
  }

  const templateMutation = useMutation({
    mutationFn: () => {
      if (!module || !action) throw new Error('Elige módulo y acción')
      return downloadBulkTemplate(module, action)
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : 'No se pudo descargar la plantilla')
    },
  })

  const importMutation = useMutation({
    mutationFn: () => {
      if (!module || !action) throw new Error('Elige módulo y acción')
      if (!file) throw new Error('Selecciona un archivo Excel (.xlsx o .xls) o CSV (.csv)')
      return uploadBulkFile(module, action, file)
    },
    onMutate: () => {
      setError('')
      setResult(null)
    },
    onSuccess: (data) => {
      setResult(data)
      setShowSuccesses(false)
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : 'No se pudo completar la carga masiva')
    },
  })

  const onFile = (e: ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] ?? null)
    setError('')
  }

  if (!canAccess) {
    return (
      <div className="page">
        <header className="page-header">
          <h1 className="page-title">Carga masiva</h1>
          <p className="page-subtitle">No tienes permiso para usar esta función.</p>
        </header>
      </div>
    )
  }

  const step = !module ? 1 : !action ? 2 : 3
  const canUpload = Boolean(module && action && file)

  return (
    <div className="page">
      <header className="page-header">
        <h1 className="page-title">Carga masiva</h1>
        <p className="page-subtitle">
          Importa o actualiza datos desde Excel en un solo lugar. Cada fila se valida por separado.
        </p>
      </header>

      {error && (
        <div className="alert alert-error" role="alert">
          {error}
        </div>
      )}

      <div className="card" style={{ marginBottom: '1.25rem' }}>
        <h2 className="card-title">1. Módulo</h2>
        <p className="page-subtitle" style={{ marginBottom: '0.75rem' }}>
          Elige el tipo de registro a procesar.
        </p>
        <div className="form-group">
          <label className="form-label" htmlFor={`${formId}-module`}>
            Módulo
          </label>
          <select
            id={`${formId}-module`}
            className="form-input"
            value={module}
            onChange={(e) => onModuleChange(e.target.value as BulkModule | '')}
            aria-describedby={selectedModule?.hint ? `${formId}-module-hint` : undefined}
          >
            <option value="">Seleccionar…</option>
            {availableModules.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
          {selectedModule?.hint && (
            <p id={`${formId}-module-hint`} className="page-subtitle" style={{ marginTop: '0.5rem', marginBottom: 0 }}>
              {selectedModule.hint}
            </p>
          )}
        </div>
      </div>

      <div
        className="card"
        style={{ marginBottom: '1.25rem', opacity: module ? 1 : 0.55 }}
        aria-disabled={!module}
      >
        <h2 className="card-title">2. Acción</h2>
        <p className="page-subtitle" style={{ marginBottom: '0.75rem' }}>
          Crear, actualizar, desactivar o eliminar según el módulo.
        </p>
        <div className="form-group">
          <label className="form-label" htmlFor={`${formId}-action`}>
            Acción
          </label>
          <select
            id={`${formId}-action`}
            className="form-input"
            value={action}
            disabled={!module}
            onChange={(e) => onActionChange(e.target.value as BulkAction | '')}
          >
            <option value="">Seleccionar…</option>
            {ALL_ACTIONS.map((a) => {
              const enabled = allowedActions.includes(a)
              return (
                <option key={a} value={a} disabled={!enabled}>
                  {ACTION_LABELS[a]}
                  {!enabled ? ' (no disponible)' : ''}
                </option>
              )
            })}
          </select>
        </div>
      </div>

      <div
        className="card"
        style={{ marginBottom: '1.25rem', opacity: module && action ? 1 : 0.55 }}
      >
        <h2 className="card-title">3. Plantilla y archivo</h2>
        <p className="page-subtitle" style={{ marginBottom: '0.75rem' }}>
          Descarga la plantilla Excel (.xlsx), completa las filas y súbela en formato Excel (.xlsx o .xls) o CSV (.csv).
        </p>
        <div className="page-filters">
          <div className="form-group">
            <label className="form-label" htmlFor={`${formId}-file`}>
              Archivo Excel o CSV
            </label>
            <input
              id={`${formId}-file`}
              className="form-input"
              type="file"
              accept={ACCEPT}
              disabled={!module || !action}
              onChange={onFile}
            />
            {file && (
              <p className="page-subtitle" style={{ marginTop: '0.35rem', marginBottom: 0 }}>
                {file.name}
              </p>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-secondary"
            disabled={!module || !action || templateMutation.isPending}
            onClick={() => templateMutation.mutate()}
          >
            {templateMutation.isPending ? 'Descargando…' : 'Descargar plantilla Excel'}
          </button>
          <button
            type="button"
            className="btn btn-primary"
            disabled={!canUpload || importMutation.isPending}
            onClick={() => importMutation.mutate()}
          >
            {importMutation.isPending ? 'Procesando…' : 'Ejecutar carga'}
          </button>
        </div>
        {step < 3 && (
          <p className="page-subtitle" style={{ marginTop: '0.75rem', marginBottom: 0 }}>
            Completa los pasos anteriores para habilitar la carga.
          </p>
        )}
      </div>

      {result && (
        <section className="card" aria-labelledby={`${formId}-results-title`}>
          <h2 id={`${formId}-results-title`} className="card-title">
            4. Resultados
          </h2>
          <div
            className={result.errorCount > 0 ? 'alert alert-error' : 'alert'}
            role="status"
            style={{ marginBottom: '1rem' }}
          >
            <strong>Resumen:</strong> {result.successCount} exitosos · {result.errorCount} fallidos ·{' '}
            {result.successCount + result.errorCount} total
            {result.warning ? ` · ${result.warning}` : ''}
          </div>

          {result.successCount > 0 && (
            <div style={{ marginBottom: '1rem' }}>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                aria-expanded={showSuccesses}
                onClick={() => setShowSuccesses((v) => !v)}
              >
                {showSuccesses ? 'Ocultar' : 'Ver'} detalle de exitosos ({result.successCount})
              </button>
              {showSuccesses && (
                <p className="page-subtitle" style={{ marginTop: '0.5rem', marginBottom: 0 }}>
                  {result.successCount} fila{result.successCount === 1 ? '' : 's'} procesada
                  {result.successCount === 1 ? '' : 's'} correctamente.
                </p>
              )}
            </div>
          )}

          {result.errors.length > 0 ? (
            <>
              <h3 className="card-title" style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>
                Filas con error
              </h3>
              <DataList label="Errores de carga masiva">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th scope="col">Línea</th>
                      <th scope="col">Datos</th>
                      <th scope="col">Motivo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.errors.map((err) => (
                      <tr key={`${err.rowNumber}-${err.message}`}>
                        <td data-label="Línea">{err.rowNumber}</td>
                        <td data-label="Datos">{err.raw?.trim() || '—'}</td>
                        <td data-label="Motivo">{err.message}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </DataList>
            </>
          ) : (
            <p className="page-subtitle" style={{ marginBottom: 0 }}>
              Todas las filas se procesaron correctamente.
            </p>
          )}
        </section>
      )}
    </div>
  )
}
