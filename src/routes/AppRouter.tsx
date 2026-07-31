import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import { useAuth } from '../hooks/useAuth'
import { AuditPage } from '../pages/audit/AuditPage'
import { CustomersPage } from '../pages/customers/CustomersPage'
import { DashboardPage } from '../pages/DashboardPage'
import { FaqAdminPage } from '../pages/faq/FaqAdminPage'
import { CategoriesPage } from '../pages/inventory/CategoriesPage'
import { ProductsPage } from '../pages/inventory/ProductsPage'
import { LoginPage } from '../pages/LoginPage'
import { ReportsPage } from '../pages/reports/ReportsPage'
import { PosPage } from '../pages/sales/PosPage'
import { UsersPage } from '../pages/users/UsersPage'
import type { ReactNode } from 'react'

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}

export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="inventario/productos" element={<ProductsPage />} />
        <Route path="inventario/categorias" element={<CategoriesPage />} />
        <Route path="ventas/pos" element={<PosPage />} />
        <Route path="clientes" element={<CustomersPage />} />
        <Route path="compras" element={<ReportsPage />} />
        <Route path="reportes" element={<ReportsPage />} />
        <Route path="notificaciones" element={<DashboardPage />} />
        <Route path="faq" element={<FaqAdminPage />} />
        <Route path="auditoria" element={<AuditPage />} />
        <Route path="usuarios" element={<UsersPage />} />
        <Route path="configuracion" element={<UsersPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
