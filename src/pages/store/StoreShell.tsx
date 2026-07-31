import { Link, Outlet } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useCartStore } from '../../stores/cartStore'
import './StoreShell.css'

export function StoreShell() {
  const { isAuthenticated, user, logout } = useAuth()
  const totalItems = useCartStore((s) => s.totalItems())

  return (
    <div className="store-shell">
      <header className="store-header">
        <div className="store-header__inner">
          <Link to="/tienda" className="store-header__brand">
            <span className="store-header__logo">BeautyStock</span>
            <span className="store-header__tag">Tienda</span>
          </Link>

          <nav className="store-header__nav">
            <Link to="/tienda" className="store-header__link">
              Catálogo
            </Link>
            <Link to="/tienda/carrito" className="store-header__cart">
              Carrito
              {totalItems > 0 && <span className="store-header__badge">{totalItems}</span>}
            </Link>
            {isAuthenticated ? (
              <>
                <Link to="/" className="store-header__link">
                  Panel
                </Link>
                <button
                  type="button"
                  className="store-header__login"
                  onClick={() => void logout()}
                >
                  {user?.fullName.split(' ')[0] ?? 'Salir'}
                </button>
              </>
            ) : (
              <Link to="/login" className="store-header__login">
                Iniciar sesión
              </Link>
            )}
          </nav>
        </div>
      </header>
      <main className="store-main">
        <Outlet />
      </main>
      <footer className="store-footer">
        <div className="store-footer__inner">
          <span>BeautyStock · Belleza y cuidado</span>
          <Link to="/login">Acceso staff</Link>
        </div>
      </footer>
    </div>
  )
}
