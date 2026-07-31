import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import { useAuth } from '../hooks/useAuth'
import { AuditPage } from '../pages/audit/AuditPage'
import { CustomersPage } from '../pages/customers/CustomersPage'
import { DashboardPage } from '../pages/DashboardPage'
import { FaqAdminPage } from '../pages/faq/FaqAdminPage'
import { BrandsPage } from '../pages/inventory/BrandsPage'
import { CategoriesPage } from '../pages/inventory/CategoriesPage'
import { ProductsPage } from '../pages/inventory/ProductsPage'
import { LoginPage } from '../pages/LoginPage'
import { NotificationsPage } from '../pages/notifications/NotificationsPage'
import { PurchasesPage } from '../pages/purchases/PurchasesPage'
import { ReportsPage } from '../pages/reports/ReportsPage'
import { PosPage } from '../pages/sales/PosPage'
import { SalesHistoryPage } from '../pages/sales/SalesHistoryPage'
import { SettingsPage } from '../pages/settings/SettingsPage'
import { CartPage } from '../pages/store/CartPage'
import { MarketplacePage } from '../pages/store/MarketplacePage'
import { ProductDetailPage } from '../pages/store/ProductDetailPage'
import { StoreShell } from '../pages/store/StoreShell'
import { UsersPage } from '../pages/users/UsersPage'
import type { ReactNode } from 'react'

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return children
}

export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route path="/tienda" element={<StoreShell />}>
        <Route index element={<MarketplacePage />} />
        <Route path="producto/:id" element={<ProductDetailPage />} />
        <Route path="carrito" element={<CartPage />} />
      </Route>

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
        <Route path="inventario/marcas" element={<BrandsPage />} />
        <Route path="ventas/pos" element={<PosPage />} />
        <Route path="ventas/historial" element={<SalesHistoryPage />} />
        <Route path="clientes" element={<CustomersPage />} />
        <Route path="compras" element={<PurchasesPage />} />
        <Route path="reportes" element={<ReportsPage />} />
        <Route path="notificaciones" element={<NotificationsPage />} />
        <Route path="faq" element={<FaqAdminPage />} />
        <Route path="auditoria" element={<AuditPage />} />
        <Route path="usuarios" element={<UsersPage />} />
        <Route path="configuracion" element={<SettingsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/tienda" replace />} />
    </Routes>
  )
}
