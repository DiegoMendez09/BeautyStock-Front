import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { ApiClientError } from '../api/client'
import { useAuth } from '../hooks/useAuth'
import './LoginPage.css'

export function LoginPage() {
  const { login, isAuthenticated, isLoading } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      await login(email, password)
      navigate('/')
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(
          err.status === 0
            ? err.message
            : err.message || 'Credenciales inválidas',
        )
      } else {
        setError('No se pudo iniciar sesión. Intente de nuevo.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-page__bg" />
      <div className="login-page__pattern" />

      <div className="login-page__content">
        <div className="login-page__hero">
          <h1 className="login-page__brand">BeautyStock</h1>
          <p className="login-page__headline">
            Inventario inteligente para tu tienda de belleza
          </p>
          <ul className="login-page__features">
            <li>Control de stock en tiempo real</li>
            <li>Punto de venta integrado</li>
            <li>Reportes y auditoría</li>
          </ul>
        </div>

        <div className="login-page__form-panel">
          <h2 className="login-page__form-title">Iniciar sesión</h2>
          <p className="login-page__form-subtitle">
            Ingresa tus credenciales para acceder al sistema
          </p>

          {error && <div className="alert alert-error">{error}</div>}

          <form className="login-page__form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="email">
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@tienda.com"
                required
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
