import { NavLink } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import type { ModuleMenuItem } from '../../types'
import { SidebarMenuIcon, SidebarNavIcon } from './SidebarIcons'
import './Sidebar.css'

function expandMenu(menu: ModuleMenuItem[]): ModuleMenuItem[] {
  return menu.flatMap((item) => {
    if (item.code === 'Catalog') {
      return [
        { ...item, name: 'Categorías', routePath: '/inventario/categorias', iconKey: 'categories' },
        {
          ...item,
          moduleId: item.moduleId * 100 + 1,
          name: 'Marcas',
          routePath: '/inventario/marcas',
          iconKey: 'brands',
        },
      ]
    }
    if (item.code === 'Inventory') {
      return [{ ...item, name: 'Productos', routePath: '/inventario/productos', iconKey: 'products' }]
    }
    if (item.code === 'Sales') {
      return [
        { ...item, name: 'Punto de venta', routePath: '/ventas/pos', iconKey: 'pos' },
        {
          ...item,
          moduleId: item.moduleId * 100 + 2,
          name: 'Historial',
          routePath: '/ventas/historial',
          iconKey: 'history',
        },
      ]
    }
    if (item.code === 'Reports') {
      return [
        { ...item, name: 'Reportes', routePath: '/reportes', iconKey: 'reports' },
        {
          ...item,
          moduleId: item.moduleId * 100 + 3,
          name: 'Trazabilidad',
          routePath: '/trazabilidad',
          iconKey: 'audit',
        },
      ]
    }
    if (item.code === 'Purchases') {
      return [{ ...item, iconKey: 'purchases' }]
    }
    if (item.code === 'Notifications') {
      return [{ ...item, iconKey: 'notifications' }]
    }
    if (item.code === 'Settings') {
      return [{ ...item, iconKey: 'settings' }]
    }
    return [item]
  })
}

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { menu } = useAuth()
  const items = expandMenu(menu)

  return (
    <aside className={`sidebar${collapsed ? ' sidebar--collapsed' : ''}`}>
      <div className="sidebar__brand">
        <button
          type="button"
          className="sidebar__toggle"
          onClick={onToggle}
          aria-label={collapsed ? 'Expandir menú' : 'Colapsar menú'}
          title={collapsed ? 'Expandir menú' : 'Colapsar menú'}
        >
          <SidebarMenuIcon />
        </button>
        {!collapsed && (
          <div className="sidebar__brand-text">
            <div className="sidebar__logo">BeautyStock</div>
            <div className="sidebar__tagline">Inventario de belleza</div>
          </div>
        )}
      </div>
      <nav className="sidebar__nav">
        {items.map((item) => (
          <NavLink
            key={`${item.moduleId}-${item.routePath}`}
            to={item.routePath}
            end={item.routePath === '/' || item.routePath === '/panel'}
            title={collapsed ? item.name : undefined}
            className={({ isActive }) =>
              `sidebar__link${isActive ? ' sidebar__link--active' : ''}`
            }
          >
            <span className="sidebar__icon">
              <SidebarNavIcon iconKey={item.iconKey} />
            </span>
            {!collapsed && <span className="sidebar__label">{item.name}</span>}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
