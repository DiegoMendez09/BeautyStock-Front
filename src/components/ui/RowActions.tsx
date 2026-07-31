import './RowActions.css'

interface RowActionsProps {
  isActive?: boolean
  canDeactivate?: boolean
  canDelete?: boolean
  onDeactivate?: () => void
  onDelete?: () => void
  deactivatePending?: boolean
  deletePending?: boolean
  deactivateLabel?: string
  confirmDeleteMessage?: string
}

/** Acciones estándar de fila: baja lógica (Desactivar) y baja física (Eliminar, con confirmación). */
export function RowActions({
  isActive = true,
  canDeactivate = true,
  canDelete = true,
  onDeactivate,
  onDelete,
  deactivatePending = false,
  deletePending = false,
  deactivateLabel = 'Desactivar',
  confirmDeleteMessage = 'Esta acción eliminará el registro de forma permanente y no se puede deshacer. ¿Deseas continuar?',
}: RowActionsProps) {
  return (
    <div className="row-actions">
      {canDeactivate && isActive && onDeactivate && (
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          disabled={deactivatePending}
          onClick={onDeactivate}
        >
          {deactivateLabel}
        </button>
      )}
      {canDelete && onDelete && (
        <button
          type="button"
          className="btn btn-ghost btn-sm row-actions__delete"
          disabled={deletePending}
          onClick={() => {
            if (window.confirm(confirmDeleteMessage)) onDelete()
          }}
        >
          Eliminar
        </button>
      )}
    </div>
  )
}
