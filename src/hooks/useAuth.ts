import { useAuthStore } from '../stores/authStore'

/** Compatibilidad con componentes existentes. */
export function useAuth() {
  const user = useAuthStore((s) => s.user)
  const menu = useAuthStore((s) => s.menu)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const isLoading = useAuthStore((s) => s.isBootstrapping)
  const login = useAuthStore((s) => s.login)
  const logout = useAuthStore((s) => s.logout)
  const hasPermission = useAuthStore((s) => s.hasPermission)

  return {
    user,
    menu,
    isAuthenticated,
    isLoading,
    login,
    logout,
    hasPermission,
  }
}
