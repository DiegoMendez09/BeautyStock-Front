import { useState, type FormEvent } from 'react'
import { Link, Outlet, useNavigate, useSearchParams } from 'react-router-dom'
import { SkipLink } from '../../components/a11y/SkipLink'
import { useAuth } from '../../hooks/useAuth'
import { useCartStore } from '../../stores/cartStore'
import './StoreShell.css'

export function StoreShell() {
  const { isAuthenticated, user, logout } = useAuth()
  const totalItems = useCartStore((s) => s.totalItems())
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('q') ?? '')

  const handleSearch = (e: FormEvent) => {
    e.preventDefault()
    const q = search.trim()
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    navigate(`/tienda${params.toString() ? `?${params}` : ''}`)
  }

  return (
    <div className="store-shell">
      <SkipLink />
      <header className="ml-header">
        <div className="ml-header__inner">
          <Link
            to="/tienda"
            className="ml-header__brand"
            onClick={() => setSearch('')}
            aria-label="BeautyStock — ir al inicio de la tienda"
          >
            <span className="ml-header__logo">BeautyStock</span>
          </Link>

          <form className="ml-search" onSubmit={handleSearch} role="search">
            <label htmlFor="store-search" className="sr-only">
              Buscar productos
            </label>
            <input
              id="store-search"
              className="ml-search__input"
              placeholder="Buscar productos, marcas y más…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoComplete="off"
            />
            <button type="submit" className="ml-search__btn">
              Buscar
            </button>
          </form>

          <nav className="ml-header__nav" aria-label="Cuenta y carrito">
            <Link to="/tienda/carrito" className="ml-header__cart">
              Carrito
              {totalItems > 0 && (
                <span className="ml-header__badge" aria-label={`${totalItems} artículos`}>
                  {totalItems}
                </span>
              )}
            </Link>
            {isAuthenticated ? (
              <>
                <Link to="/panel" className="ml-header__link">
                  Panel
                </Link>
                <button
                  type="button"
                  className="ml-header__user"
                  onClick={() => void logout()}
                  aria-label={`Cerrar sesión de ${user?.fullName ?? 'usuario'}`}
                >
                  {user?.fullName.split(' ')[0] ?? 'Salir'}
                </button>
              </>
            ) : (
              <Link to="/login" className="ml-header__user">
                Ingresar
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main id="main-content" className="store-main" tabIndex={-1}>
        <Outlet />
      </main>

      <footer className="store-footer">
        <div className="store-footer__inner">
          <span>BeautyStock · Productos de belleza</span>
        </div>
      </footer>
    </div>
  )
}
