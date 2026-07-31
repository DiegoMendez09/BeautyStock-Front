import { useQuery } from '@tanstack/react-query'
import { getDashboardReport } from '../../api/modules'
import { useAuth } from '../../hooks/useAuth'
import { P } from '../../lib/permissions'

function formatPrice(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(value)
}

export function DashboardPage() {
  const { user, hasPermission } = useAuth()
  const canReport = hasPermission(P.Reports.View)
  const { data } = useQuery({
    queryKey: ['reports', 'dashboard'],
    queryFn: getDashboardReport,
    enabled: canReport,
  })

  return (
    <div className="page">
      <header className="page-header">
        <h1 className="page-title">Panel principal</h1>
        <p className="page-subtitle">Bienvenido de nuevo, {user?.fullName ?? 'usuario'}</p>
      </header>

      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-label">Ventas hoy</div>
          <div className="kpi-value kpi-value--accent">
            {data ? formatPrice(data.salesTotalToday) : '—'}
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Productos activos</div>
          <div className="kpi-value">{data?.activeProducts ?? '—'}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Stock bajo</div>
          <div className="kpi-value">{data?.lowStockItems.length ?? '—'}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Clientes</div>
          <div className="kpi-value">{data?.activeCustomers ?? '—'}</div>
        </div>
      </div>

      <div className="card">
        <h2 className="card-title">Resumen</h2>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9375rem' }}>
          Usa el menú para productos (precios en variantes), marcas, compras, reportes y más.
          Las bajas son lógicas (Desactivar), no eliminan registros de la base.
        </p>
      </div>
    </div>
  )
}
