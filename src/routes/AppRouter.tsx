import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AppShell } from '../layouts/(admin)/AppShell'
import { StoreShell } from '../layouts/(public)/StoreShell'
import { useAuth } from '../hooks/useAuth'
import { AuditPage } from '../pages/(admin)/audit/AuditPage'
import { CustomersPage } from '../pages/(admin)/customers/CustomersPage'
import { DashboardPage } from '../pages/(admin)/DashboardPage'
import { FaqAdminPage } from '../pages/(admin)/faq/FaqAdminPage'
import { BrandsPage } from '../pages/(admin)/inventory/BrandsPage'
import { CategoriesPage } from '../pages/(admin)/inventory/CategoriesPage'
import { ProductsPage } from '../pages/(admin)/inventory/ProductsPage'
import { NotificationsPage } from '../pages/(admin)/notifications/NotificationsPage'
import { PurchasesPage } from '../pages/(admin)/purchases/PurchasesPage'
import { ReportsPage } from '../pages/(admin)/reports/ReportsPage'
import { PosPage } from '../pages/(admin)/sales/PosPage'
import { SalesHistoryPage } from '../pages/(admin)/sales/SalesHistoryPage'
import { SettingsPage } from '../pages/(admin)/settings/SettingsPage'
import { UsersPage } from '../pages/(admin)/users/UsersPage'
import { LoginPage } from '../pages/(public)/LoginPage'
import { CartPage } from '../pages/(public)/store/CartPage'
import { MarketplacePage } from '../pages/(public)/store/MarketplacePage'
import { ProductDetailPage } from '../pages/(public)/store/ProductDetailPage'
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
      {/* Entrada por defecto = tienda */}
      <Route path="/" element={<Navigate to="/tienda" replace />} />

      <Route path="/login" element={<LoginPage />} />

      <Route path="/tienda" element={<StoreShell />}>
        <Route index element={<MarketplacePage />} />
        <Route path="producto/:id" element={<ProductDetailPage />} />
        <Route path="carrito" element={<CartPage />} />
      </Route>

      <Route
        path="/panel"
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

      {/* Compatibilidad con menú del API (rutas sin /panel) */}
      <Route
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
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
