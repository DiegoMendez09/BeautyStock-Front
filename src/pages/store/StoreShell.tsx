import { useState, type FormEvent } from 'react'
import { Link, Outlet, useNavigate, useSearchParams } from 'react-router-dom'
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
      <header className="ml-header">
        <div className="ml-header__inner">
          <Link to="/tienda" className="ml-header__brand" onClick={() => setSearch('')}>
            <span className="ml-header__logo">BeautyStock</span>
          </Link>

          <form className="ml-search" onSubmit={handleSearch} role="search">
            <input
              className="ml-search__input"
              placeholder="Buscar productos, marcas y más…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Buscar en la tienda"
            />
            <button type="submit" className="ml-search__btn" aria-label="Buscar">
              Buscar
            </button>
          </form>

          <nav className="ml-header__nav">
            <Link to="/tienda/carrito" className="ml-header__cart">
              Carrito
              {totalItems > 0 && <span className="ml-header__badge">{totalItems}</span>}
            </Link>
            {isAuthenticated ? (
              <>
                <Link to="/panel" className="ml-header__link">
                  Panel
                </Link>
                <button type="button" className="ml-header__user" onClick={() => void logout()}>
                  {user?.fullName.split(' ')[0] ?? 'Salir'}
                </button>
              </>
            ) : (
              <Link to="/login" className="ml-header__user">
                Ingresá
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
          <span>BeautyStock · Productos de belleza</span>
        </div>
      </footer>
    </div>
  )
}
