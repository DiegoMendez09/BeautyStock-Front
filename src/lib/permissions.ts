/** Códigos de permiso alineados con el backend (PermissionCodes). */
export const P = {
  Catalog: {
    View: 'Catalog.View',
    Create: 'Catalog.Create',
    Update: 'Catalog.Update',
    Delete: 'Catalog.Delete',
    Manage: 'Catalog.Manage',
  },
  Inventory: {
    View: 'Inventory.View',
    Create: 'Inventory.Create',
    Update: 'Inventory.Update',
    Delete: 'Inventory.Delete',
    Manage: 'Inventory.Manage',
  },
  Customers: {
    View: 'Customers.View',
    Create: 'Customers.Create',
    Update: 'Customers.Update',
    Delete: 'Customers.Delete',
    Manage: 'Customers.Manage',
  },
  Users: {
    View: 'Users.View',
    Manage: 'Users.Manage',
  },
  Faq: {
    View: 'Faq.View',
    Manage: 'Faq.Manage',
  },
  Sales: {
    View: 'Sales.View',
    Create: 'Sales.Create',
  },
  Notifications: {
    View: 'Notifications.View',
  },
  Audit: {
    View: 'Audit.View',
  },
} as const

export type PermissionCode = string

export function permissionGranted(
  permissions: string[] | undefined,
  role: string | undefined,
  required: PermissionCode,
): boolean {
  if (!role) return false
  if (role === 'SuperAdministrator') return true
  if (!permissions?.length) return false
  if (permissions.includes('*') || permissions.includes(required)) return true

  const dot = required.indexOf('.')
  if (dot > 0) {
    const moduleManage = `${required.slice(0, dot)}.Manage`
    if (permissions.includes(moduleManage)) return true
  }

  return false
}

export function anyPermissionGranted(
  permissions: string[] | undefined,
  role: string | undefined,
  required: PermissionCode[],
): boolean {
  return required.some((p) => permissionGranted(permissions, role, p))
}

export function allPermissionsGranted(
  permissions: string[] | undefined,
  role: string | undefined,
  required: PermissionCode[],
): boolean {
  return required.every((p) => permissionGranted(permissions, role, p))
}
