import { NavLink } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import type { ModuleMenuItem } from '../../types'
import './Sidebar.css'

const ICON_MAP: Record<string, string> = {
  dashboard: '◈',
  products: '▣',
  categories: '▤',
  pos: '◉',
  customers: '◎',
  reports: '▥',
  faq: '?',
  audit: '◫',
  users: '◌',
  inventory: '▣',
  sales: '◉',
  default: '·',
}

function getIcon(iconKey: string): string {
  return ICON_MAP[iconKey] ?? ICON_MAP.default
}

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
          iconKey: 'categories',
        },
      ]
    }
    if (item.code === 'Inventory') {
      return [{ ...item, name: 'Productos', routePath: '/inventario/productos' }]
    }
    if (item.code === 'Sales') {
      return [
        { ...item, name: 'POS', routePath: '/ventas/pos' },
        {
          ...item,
          moduleId: item.moduleId * 100 + 2,
          name: 'Histor ventas',
          routePath: '/ventas/historial',
          iconKey: 'sales',
        },
      ]
    }
    return [item]
  })
}

export function Sidebar() {
  const { menu } = useAuth()
  const items = expandMenu(menu)

  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <div className="sidebar__logo">BeautyStock</div>
        <div className="sidebar__tagline">Inventario de belleza</div>
      </div>
      <nav className="sidebar__nav">
        {items.map((item) => (
          <NavLink
            key={`${item.moduleId}-${item.routePath}`}
            to={item.routePath}
            end={item.routePath === '/'}
            className={({ isActive }) =>
              `sidebar__link${isActive ? ' sidebar__link--active' : ''}`
            }
          >
            <span className="sidebar__icon">{getIcon(item.iconKey)}</span>
            {item.name}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
