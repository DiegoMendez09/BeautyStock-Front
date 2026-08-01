import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { roleLabel } from '../../lib/labels'
import './TopBar.css'

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

interface TopBarProps {
  collapsed: boolean
  onToggleSidebar: () => void
}

export function TopBar({ collapsed, onToggleSidebar }: TopBarProps) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    void (async () => {
      await logout()
      navigate('/tienda')
    })()
  }

  return (
    <header className="topbar">
      <div className="topbar__left">
        <button
          type="button"
          className="topbar__toggle"
          onClick={onToggleSidebar}
          aria-label={collapsed ? 'Abrir menú de navegación' : 'Cerrar menú de navegación'}
          title={collapsed ? 'Abrir menú' : 'Cerrar menú'}
        >
          ☰
        </button>
        <div className="topbar__greeting">
          {user ? `Bienvenido, ${user.fullName.split(' ')[0]}` : ''}
        </div>
      </div>
      <div className="topbar__user">
        {user && (
          <>
            <div className="topbar__avatar">{getInitials(user.fullName)}</div>
            <div className="topbar__info">
              <span className="topbar__name">{user.fullName}</span>
              <span className="topbar__role">{roleLabel(user.role)}</span>
            </div>
          </>
        )}
        <Link to="/tienda" className="topbar__logout">
          Tienda
        </Link>
        <button type="button" className="topbar__logout" onClick={handleLogout}>
          Cerrar sesión
        </button>
      </div>
    </header>
  )
}
