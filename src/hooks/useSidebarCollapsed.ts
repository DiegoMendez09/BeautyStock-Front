import { useEffect, useState } from 'react'

const STORAGE_KEY = 'bs-sidebar-collapsed'

function readInitial(): boolean {
  if (typeof window === 'undefined') return false
  // En pantallas chicas el menú arranca cerrado (drawer).
  if (window.matchMedia('(max-width: 900px)').matches) return true
  return window.localStorage.getItem(STORAGE_KEY) === 'true'
}

/** Estado de colapso del sidebar, persistido en localStorage entre sesiones. */
export function useSidebarCollapsed() {
  const [collapsed, setCollapsed] = useState<boolean>(readInitial)

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, String(collapsed))
  }, [collapsed])

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 900px)')
    const onChange = () => {
      if (mq.matches) setCollapsed(true)
    }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  return [collapsed, setCollapsed] as const
}
