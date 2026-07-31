import { Outlet } from 'react-router-dom'
import { FaqWidget } from '../faq/FaqWidget'
import { useInventoryHub } from '../../hooks/useInventoryHub'
import { useSidebarCollapsed } from '../../hooks/useSidebarCollapsed'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import './AppShell.css'

export function AppShell() {
  useInventoryHub()
  const [collapsed, setCollapsed] = useSidebarCollapsed()
  const toggleSidebar = () => setCollapsed((prev) => !prev)
  const closeSidebar = () => setCollapsed(true)

  return (
    <div className={`app-shell${collapsed ? ' app-shell--collapsed' : ''}`}>
      {!collapsed && (
        <button
          type="button"
          className="app-shell__backdrop"
          aria-label="Cerrar menú"
          onClick={closeSidebar}
        />
      )}
      <Sidebar collapsed={collapsed} onToggle={toggleSidebar} />
      <div className="app-shell__main">
        <TopBar collapsed={collapsed} onToggleSidebar={toggleSidebar} />
        <main className="app-shell__content">
          <Outlet />
        </main>
      </div>
      <FaqWidget />
    </div>
  )
}
