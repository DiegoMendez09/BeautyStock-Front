import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
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
      navigate('/login')
    })()
  }

  return (
    <header className="topbar">
      <div className="topbar__left">
        <button
          type="button"
          className="topbar__toggle"
          onClick={onToggleSidebar}
          aria-label={collapsed ? 'Expandir menú' : 'Colapsar menú'}
          title={collapsed ? 'Expandir menú' : 'Colapsar menú'}
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
              <span className="topbar__role">{user.role}</span>
            </div>
          </>
        )}
        <button type="button" className="topbar__logout" onClick={handleLogout}>
          Cerrar sesión
        </button>
      </div>
    </header>
  )
}
