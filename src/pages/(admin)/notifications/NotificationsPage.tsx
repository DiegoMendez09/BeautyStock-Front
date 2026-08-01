import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getNotifications, markNotificationRead } from '../../../api/ops'
import { DataList } from '../../../components/ui/DataList'
import { useInventoryHub } from '../../../hooks/useInventoryHub'
import { severityLabel } from '../../../lib/labels'
import { formatDateTime } from '../../../lib/datetime'
import { useState } from 'react'
export function NotificationsPage() {
  const [toast, setToast] = useState('')
  const queryClient = useQueryClient()
  const { data: items = [], isLoading, isError } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => getNotifications(40),
  })

  useInventoryHub({
    onLowStock: (msg) => {
      setToast(`Existencias bajas: ${msg.sku} → ${msg.stockOnHand}`)
    },
  })

  const readMutation = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  })

  return (
    <div className="page">
      <header className="page-header">
        <h1 className="page-title">Notificaciones</h1>
        <p className="page-subtitle">Alertas de inventario en tiempo real</p>
      </header>

      {toast && <div className="alert alert-success">{toast}</div>}
      {isError && <div className="alert alert-error">No se pudieron cargar las notificaciones</div>}

      {isLoading ? (
        <div className="loading-screen" style={{ minHeight: 160 }}>
          <div className="spinner" />
        </div>
      ) : items.length === 0 ? (
        <div className="empty-state">Sin notificaciones</div>
      ) : (
        <DataList label="Notificaciones">
          <table className="data-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Título</th>
                <th>Mensaje</th>
                <th>Severidad</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.notificationId}>
                  <td data-label="Fecha">{formatDateTime(item.createdAt)}</td>
                  <td data-label="Título">{item.title}</td>
                  <td data-label="Mensaje">{item.message}</td>
                  <td data-label="Severidad">{severityLabel(item.severity)}</td>
                  <td data-label="" className="data-table__actions">
                    {!item.isRead && (
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => readMutation.mutate(item.notificationId)}
                      >
                        Marcar leída
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </DataList>
      )}
    </div>
  )
}
