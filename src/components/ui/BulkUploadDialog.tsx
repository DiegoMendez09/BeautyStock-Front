import { useMutation } from '@tanstack/react-query'
import { useState, type ChangeEvent } from 'react'
import {
  downloadBulkTemplate,
  uploadBulkFile,
  type BulkAction,
  type BulkImportResult,
  type BulkModule,
} from '../../api/bulk'

const ACTION_OPTIONS: { value: BulkAction; label: string }[] = [
  { value: 'create', label: 'Crear' },
  { value: 'update', label: 'Actualizar' },
  { value: 'deactivate', label: 'Desactivar' },
  { value: 'delete', label: 'Eliminar' },
]

const ACCEPT =
  '.xlsx,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv'

interface BulkUploadDialogProps {
  module: BulkModule
  title?: string
  /** Acciones permitidas para este módulo (p. ej. productos sin create). */
  allowedActions?: BulkAction[]
  onSuccess?: () => void
}

export function BulkUploadDialog({
  module,
  title = 'Carga masiva',
  allowedActions = ['create', 'update', 'deactivate', 'delete'],
  onSuccess,
}: BulkUploadDialogProps) {
  const [open, setOpen] = useState(false)
  const [action, setAction] = useState<BulkAction>(allowedActions[0] ?? 'create')
  const [file, setFile] = useState<File | null>(null)
  const [result, setResult] = useState<BulkImportResult | null>(null)
  const [error, setError] = useState('')

  const actions = ACTION_OPTIONS.filter((o) => allowedActions.includes(o.value))

  const importMutation = useMutation({
    mutationFn: () => {
      if (!file) throw new Error('Selecciona un archivo Excel')
      return uploadBulkFile(module, action, file)
    },
    onMutate: () => {
      setError('')
      setResult(null)
    },
    onSuccess: (data) => {
      setResult(data)
      onSuccess?.()
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : 'No se pudo completar la carga masiva')
    },
  })

  const templateMutation = useMutation({
    mutationFn: () => downloadBulkTemplate(module, action),
    onError: (err) => {
      setError(err instanceof Error ? err.message : 'No se pudo descargar la plantilla')
    },
  })

  const onFile = (e: ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] ?? null
    setFile(selected)
    setResult(null)
    setError('')
  }

  if (!open) {
    return (
      <button type="button" className="btn btn-secondary" onClick={() => setOpen(true)}>
        Carga masiva
      </button>
    )
  }

  return (
    <div className="card" style={{ marginBottom: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center' }}>
        <h2 className="card-title" style={{ margin: 0 }}>
          {title}
        </h2>
        <button type="button" className="btn btn-secondary" onClick={() => setOpen(false)}>
          Cerrar
        </button>
      </div>
      <p className="page-subtitle" style={{ marginBottom: '0.75rem' }}>
        Descarga la plantilla Excel, completa las filas y súbelas. Cada fila se valida por separado.
      </p>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="page-filters">
        <div className="form-group">
          <label className="form-label">Acción</label>
          <select
            className="form-input"
            value={action}
            onChange={(e) => {
              setAction(e.target.value as BulkAction)
              setResult(null)
            }}
          >
            {actions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Archivo Excel</label>
          <input className="form-input" type="file" accept={ACCEPT} onChange={onFile} />
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
          disabled={templateMutation.isPending}
          onClick={() => templateMutation.mutate()}
        >
          {templateMutation.isPending ? 'Descargando…' : 'Descargar plantilla Excel'}
        </button>
        <button
          type="button"
          className="btn btn-primary"
          disabled={importMutation.isPending || !file}
          onClick={() => importMutation.mutate()}
        >
          {importMutation.isPending ? 'Procesando…' : 'Ejecutar carga'}
        </button>
      </div>

      {result && (
        <div style={{ marginTop: '1rem' }}>
          <div className={result.errorCount > 0 ? 'alert alert-error' : 'alert'} role="status">
            Correctas: {result.successCount} · Errores: {result.errorCount}
            {result.warning ? ` · ${result.warning}` : ''}
          </div>
          {result.errors.length > 0 && (
            <ul style={{ margin: '0.5rem 0 0', paddingLeft: '1.25rem', fontSize: '0.9rem' }}>
              {result.errors.slice(0, 30).map((err) => (
                <li key={`${err.rowNumber}-${err.message}`}>
                  Fila {err.rowNumber}: {err.message}
                </li>
              ))}
              {result.errors.length > 30 && (
                <li>… y {result.errors.length - 30} errores más</li>
              )}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
