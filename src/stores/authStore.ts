import { create } from 'zustand'
import { login as apiLogin, logout as apiLogout, getMe, getMenu } from '../api/auth'
import { queryClient } from '../lib/queryClient'
import { permissionGranted } from '../lib/permissions'
import type { ModuleMenuItem, User } from '../types'

const DASHBOARD_ITEM: ModuleMenuItem = {
  moduleId: 0,
  code: 'Dashboard',
  name: 'Panel',
  routePath: '/panel',
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
  { moduleId: 7, code: 'Audit', name: 'Auditoría', routePath: '/auditoria', iconKey: 'audit', sortOrder: 7 },
  { moduleId: 8, code: 'Users', name: 'Usuarios', routePath: '/usuarios', iconKey: 'users', sortOrder: 8 },
]

interface AuthState {
  user: User | null
  menu: ModuleMenuItem[]
  isAuthenticated: boolean
  isBootstrapping: boolean
  bootstrap: () => Promise<void>
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  hasPermission: (permission: string) => boolean
}

async function loadMenuSafe(): Promise<ModuleMenuItem[]> {
  try {
    const modules = await getMenu()
    return [
      DASHBOARD_ITEM,
      ...[...modules]
        .filter((m) => Boolean(m.routePath))
        .sort((a, b) => a.sortOrder - b.sortOrder),
    ]
  } catch {
    return FALLBACK_MENU
  }
}

function isPublicAuthPath(pathname: string = window.location.pathname): boolean {
  return pathname === '/login' || pathname.startsWith('/login/')
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  menu: [],
  isAuthenticated: false,
  // En /login no hay sesión que restaurar: evita spinner y llamada a /auth/me.
  isBootstrapping: !isPublicAuthPath(),

  bootstrap: async () => {
    if (isPublicAuthPath()) {
      set({ isBootstrapping: false })
      return
    }

    set({ isBootstrapping: true })
    try {
      const user = await getMe()
      const menu = await loadMenuSafe()
      set({ user, menu, isAuthenticated: true, isBootstrapping: false })
    } catch {
      set({ user: null, menu: [], isAuthenticated: false, isBootstrapping: false })
    }
  },

  login: async (email, password) => {
    queryClient.clear()
    const response = await apiLogin({ email, password })
    const menu = await loadMenuSafe()
    set({
      user: response.user,
      menu,
      isAuthenticated: true,
      isBootstrapping: false,
    })
  },

  logout: async () => {
    try {
      await apiLogout()
    } catch {
      // ignore network errors on logout
    }
    queryClient.clear()
    set({ user: null, menu: [], isAuthenticated: false })
  },

  hasPermission: (permission) => {
    const { user } = get()
    return permissionGranted(user?.permissions, user?.role, permission)
  },
}))
