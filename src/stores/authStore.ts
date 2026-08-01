import { create } from 'zustand'
import { login as apiLogin, logout as apiLogout, getMe, getMenu } from '../api/auth'
import { queryClient } from '../lib/queryClient'
import { anyPermissionGranted, permissionGranted, P } from '../lib/permissions'
import type { ModuleMenuItem, User } from '../types'

const DASHBOARD_ITEM: ModuleMenuItem = {
  moduleId: 0,
  code: 'Dashboard',
  name: 'Panel',
  routePath: '/panel',
  iconKey: 'dashboard',
  sortOrder: 0,
}

const BULK_UPLOAD_ITEM: ModuleMenuItem = {
  moduleId: -12,
  code: 'BulkUpload',
  name: 'Carga masiva',
  routePath: '/panel/carga-masiva',
  iconKey: 'bulk',
  sortOrder: 12,
}

const BULK_MENU_PERMS = [
  P.BulkUpload.Manage,
  P.Catalog.Create,
  P.Catalog.Update,
  P.Catalog.Delete,
  P.Catalog.Manage,
  P.Customers.Create,
  P.Customers.Update,
  P.Customers.Delete,
  P.Customers.Manage,
  P.Faq.Manage,
  P.Purchases.Create,
  P.Purchases.Delete,
  P.Purchases.Update,
]

const FALLBACK_MENU: ModuleMenuItem[] = [
  DASHBOARD_ITEM,
  { moduleId: 1, code: 'Inventory', name: 'Inventario', routePath: '/inventario/productos', iconKey: 'inventory', sortOrder: 1 },
  { moduleId: 2, code: 'Catalog', name: 'Catálogo', routePath: '/inventario/categorias', iconKey: 'catalog', sortOrder: 2 },
  { moduleId: 3, code: 'Sales', name: 'Ventas', routePath: '/ventas/pos', iconKey: 'sales', sortOrder: 3 },
  { moduleId: 4, code: 'Customers', name: 'Clientes', routePath: '/clientes', iconKey: 'customers', sortOrder: 4 },
  { moduleId: 5, code: 'Reports', name: 'Reportes', routePath: '/reportes', iconKey: 'reports', sortOrder: 5 },
  { moduleId: 6, code: 'Faq', name: 'Preguntas frecuentes', routePath: '/faq', iconKey: 'faq', sortOrder: 6 },
  { moduleId: 7, code: 'Audit', name: 'Auditoría', routePath: '/auditoria', iconKey: 'audit', sortOrder: 7 },
  { moduleId: 8, code: 'Users', name: 'Usuarios', routePath: '/usuarios', iconKey: 'users', sortOrder: 8 },
  BULK_UPLOAD_ITEM,
]

function withBulkUploadMenu(menu: ModuleMenuItem[], user: User | null): ModuleMenuItem[] {
  const hasBulkRoute = menu.some(
    (m) =>
      m.code === 'BulkUpload' ||
      m.routePath === '/panel/carga-masiva' ||
      m.routePath === '/carga-masiva',
  )
  if (hasBulkRoute) {
    return menu.map((m) =>
      m.code === 'BulkUpload' || m.routePath?.includes('carga-masiva')
        ? { ...m, name: 'Carga masiva', routePath: '/panel/carga-masiva', iconKey: m.iconKey || 'bulk' }
        : m,
    )
  }

  const canSee =
    user?.role === 'Administrator' ||
    user?.role === 'SuperAdministrator' ||
    anyPermissionGranted(user?.permissions, user?.role, BULK_MENU_PERMS)

  if (!canSee) return menu

  return [...menu, BULK_UPLOAD_ITEM].sort((a, b) => a.sortOrder - b.sortOrder)
}

async function loadMenuSafe(user: User | null): Promise<ModuleMenuItem[]> {
  try {
    const modules = await getMenu()
    const menu = [
      DASHBOARD_ITEM,
      ...[...modules]
        .filter((m) => Boolean(m.routePath))
        .sort((a, b) => a.sortOrder - b.sortOrder),
    ]
    return withBulkUploadMenu(menu, user)
  } catch {
    return withBulkUploadMenu(FALLBACK_MENU, user)
  }
}

function isPublicAuthPath(pathname: string = window.location.pathname): boolean {
  return pathname === '/login' || pathname.startsWith('/login/')
}

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
      const menu = await loadMenuSafe(user)
      set({ user, menu, isAuthenticated: true, isBootstrapping: false })
    } catch {
      set({ user: null, menu: [], isAuthenticated: false, isBootstrapping: false })
    }
  },

  login: async (email, password) => {
    queryClient.clear()
    const response = await apiLogin({ email, password })
    const menu = await loadMenuSafe(response.user)
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
