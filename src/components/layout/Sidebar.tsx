import { NavLink } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
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

export function Sidebar() {
  const { menu } = useAuth()

  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <div className="sidebar__logo">BeautyStock</div>
        <div className="sidebar__tagline">Inventario de belleza</div>
      </div>
      <nav className="sidebar__nav">
        {menu.map((item) => (
          <NavLink
            key={item.moduleId}
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
