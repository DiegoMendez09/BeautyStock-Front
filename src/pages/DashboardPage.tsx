import { useAuth } from '../hooks/useAuth'

export function DashboardPage() {
  const { user } = useAuth()

  return (
    <div className="page">
      <header className="page-header">
        <h1 className="page-title">Panel principal</h1>
        <p className="page-subtitle">
          Bienvenido de nuevo, {user?.fullName ?? 'usuario'}
        </p>
      </header>

      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-label">Ventas hoy</div>
          <div className="kpi-value kpi-value--accent">—</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Productos activos</div>
          <div className="kpi-value">—</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Stock bajo</div>
          <div className="kpi-value">—</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Clientes</div>
          <div className="kpi-value">—</div>
        </div>
      </div>

      <div className="card">
        <h2 className="card-title">Resumen</h2>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9375rem' }}>
          Los indicadores se conectarán con la API cuando el backend esté disponible.
          Utiliza el menú lateral para navegar entre los módulos del sistema.
        </p>
      </div>
    </div>
  )
}
