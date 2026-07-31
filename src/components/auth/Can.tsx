import type { ReactNode } from 'react'
import { useAuthStore } from '../../stores/authStore'
import {
  allPermissionsGranted,
  anyPermissionGranted,
  permissionGranted,
  type PermissionCode,
} from '../../lib/permissions'

type CanProps = {
  /** Un permiso requerido */
  permission?: PermissionCode
  /** Al menos uno de estos permisos */
  anyOf?: PermissionCode[]
  /** Todos estos permisos */
  allOf?: PermissionCode[]
  /** Si true, invierte el resultado */
  not?: boolean
  children: ReactNode
  fallback?: ReactNode
}

/**
 * Renderiza children solo si el usuario cumple la condición de permisos.
 * SuperAdministrator siempre pasa. `Module.Manage` implica Create/Update/Delete/View.
 */
export function Can({ permission, anyOf, allOf, not = false, children, fallback = null }: CanProps) {
  const user = useAuthStore((s) => s.user)

  let allowed = false
  if (permission) {
    allowed = permissionGranted(user?.permissions, user?.role, permission)
  } else if (anyOf?.length) {
    allowed = anyPermissionGranted(user?.permissions, user?.role, anyOf)
  } else if (allOf?.length) {
    allowed = allPermissionsGranted(user?.permissions, user?.role, allOf)
  }

  if (not) allowed = !allowed

  return allowed ? children : fallback
}
