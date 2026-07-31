import { useEffect, useState } from 'react'

const STORAGE_KEY = 'bs-sidebar-collapsed'

function readInitial(): boolean {
  if (typeof window === 'undefined') return false
  return window.localStorage.getItem(STORAGE_KEY) === 'true'
}

/** Estado de colapso del sidebar, persistido en localStorage entre sesiones. */
export function useSidebarCollapsed() {
  const [collapsed, setCollapsed] = useState<boolean>(readInitial)

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, String(collapsed))
  }, [collapsed])

  return [collapsed, setCollapsed] as const
}
