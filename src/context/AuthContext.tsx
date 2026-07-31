import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { login as apiLogin, getMe, getMenu } from '../api/auth'
import { clearToken, getToken, setToken } from '../api/client'
import type { ModuleMenuItem, User } from '../types'

const DASHBOARD_ITEM: ModuleMenuItem = {
  moduleId: 0,
  code: 'Dashboard',
  name: 'Panel',
  routePath: '/',
  iconKey: 'dashboard',
  sortOrder: 0,
}

const FALLBACK_MENU: ModuleMenuItem[] = [
  DASHBOARD_ITEM,
  { moduleId: 1, code: 'Inventory', name: 'Inventario', routePath: '/inventario/productos', iconKey: 'inventory', sortOrder: 1 },
  { moduleId: 2, code: 'Catalog', name: 'Catálogo', routePath: '/inventario/categorias', iconKey: 'catalog', sortOrder: 2 },
  { moduleId: 3, code: 'Sales', name: 'Ventas', routePath: '/ventas/pos', iconKey: 'sales', sortOrder: 3 },
  { moduleId: 4, code: 'Customers', name: 'Clientes', routePath: '/clientes', iconKey: 'customers', sortOrder: 4 },
  { moduleId: 5, code: 'Reports', name: 'Reportes', routePath: '/reportes', iconKey: 'reports', sortOrder: 5 },
  { moduleId: 6, code: 'Faq', name: 'FAQ', routePath: '/faq', iconKey: 'faq', sortOrder: 6 },
  { moduleId: 7, code: 'Audit', name: 'Auditoría', routePath: '/auditoria', iconKey: 'audit', sortOrder: 7 },
  { moduleId: 8, code: 'Users', name: 'Usuarios', routePath: '/usuarios', iconKey: 'users', sortOrder: 8 },
]

export interface AuthContextValue {
  token: string | null
  user: User | null
  menu: ModuleMenuItem[]
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  hasPermission: (permission: string) => boolean
}

export const AuthContext = createContext<AuthContextValue | null>(null)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [token, setTokenState] = useState<string | null>(() => getToken())
  const [user, setUser] = useState<User | null>(null)
  const [menu, setMenu] = useState<ModuleMenuItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadMenu = useCallback(async () => {
    try {
      const modules = await getMenu()
      const sorted = [...modules]
        .filter((m) => Boolean(m.routePath))
        .sort((a, b) => a.sortOrder - b.sortOrder)
      setMenu([DASHBOARD_ITEM, ...sorted])
    } catch {
      setMenu(FALLBACK_MENU)
    }
  }, [])

  const bootstrap = useCallback(async () => {
    const storedToken = getToken()
    if (!storedToken) {
      setIsLoading(false)
      return
    }

    try {
      const me = await getMe()
      setUser(me)
      setTokenState(storedToken)
      await loadMenu()
    } catch {
      clearToken()
      setTokenState(null)
      setUser(null)
      setMenu([])
    } finally {
      setIsLoading(false)
    }
  }, [loadMenu])

  useEffect(() => {
    void bootstrap()
  }, [bootstrap])

  const login = useCallback(
    async (email: string, password: string) => {
      const response = await apiLogin({ email, password })
      setToken(response.token)
      setTokenState(response.token)
      setUser(response.user)
      await loadMenu()
    },
    [loadMenu],
  )

  const logout = useCallback(() => {
    clearToken()
    setTokenState(null)
    setUser(null)
    setMenu([])
  }, [])

  const hasPermission = useCallback(
    (permission: string) => {
      if (!user) return false
      return user.permissions.includes(permission)
    },
    [user],
  )

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      user,
      menu,
      isAuthenticated: !!token && !!user,
      isLoading,
      login,
      logout,
      hasPermission,
    }),
    [token, user, menu, isLoading, login, logout, hasPermission],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
