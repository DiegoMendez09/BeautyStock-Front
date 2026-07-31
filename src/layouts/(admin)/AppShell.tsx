import { Outlet } from 'react-router-dom'
import { SkipLink } from '../../components/a11y/SkipLink'
import { FaqWidget } from '../../components/faq/FaqWidget'
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
      <SkipLink />
      {!collapsed && (
        <button
          type="button"
          className="app-shell__backdrop"
          aria-label="Cerrar menú de navegación"
          onClick={closeSidebar}
        />
      )}
      <Sidebar collapsed={collapsed} onToggle={toggleSidebar} />
      <div className="app-shell__main">
        <TopBar collapsed={collapsed} onToggleSidebar={toggleSidebar} />
        <main id="main-content" className="app-shell__content" tabIndex={-1}>
          <Outlet />
        </main>
      </div>
      <FaqWidget />
    </div>
  )
}
