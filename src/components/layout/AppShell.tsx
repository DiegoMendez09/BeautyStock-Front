import { Outlet } from 'react-router-dom'
import { FaqWidget } from '../faq/FaqWidget'
import { useInventoryHub } from '../../hooks/useInventoryHub'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import './AppShell.css'

export function AppShell() {
  useInventoryHub()

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="app-shell__main">
        <TopBar />
        <main className="app-shell__content">
          <Outlet />
        </main>
      </div>
      <FaqWidget />
    </div>
  )
}
