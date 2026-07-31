import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
} from '@microsoft/signalr'
import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '../stores/authStore'

export interface StockChangedMessage {
  productVariantId: number
  sku: string
  variantName: string
  productName: string
  stockOnHand: number
  reorderLevel: number
  isLowStock: boolean
  referenceType?: string
  referenceId?: string
  occurredAt: string
}

type StockHandler = (message: StockChangedMessage) => void

let sharedConnection: HubConnection | null = null
const stockListeners = new Set<StockHandler>()
const lowStockListeners = new Set<StockHandler>()

function notify(listeners: Set<StockHandler>, message: StockChangedMessage) {
  listeners.forEach((listener) => listener(message))
}

async function ensureConnection(): Promise<HubConnection> {
  if (sharedConnection && sharedConnection.state !== HubConnectionState.Disconnected) {
    return sharedConnection
  }

  const connection = new HubConnectionBuilder()
    .withUrl('/hubs/inventory', { withCredentials: true })
    .withAutomaticReconnect()
    .configureLogging(LogLevel.Warning)
    .build()

  connection.on('StockChanged', (message: StockChangedMessage) => {
    notify(stockListeners, message)
  })
  connection.on('LowStockAlert', (message: StockChangedMessage) => {
    notify(lowStockListeners, message)
  })

  await connection.start()
  sharedConnection = connection
  return connection
}

async function stopConnectionIfIdle() {
  if (stockListeners.size > 0 || lowStockListeners.size > 0) return
  if (!sharedConnection) return
  try {
    await sharedConnection.stop()
  } catch {
    // ignore
  }
  sharedConnection = null
}

/** Conecta al hub de inventario cuando hay sesión y refresca queries de catálogo. */
export function useInventoryHub(options?: {
  onStockChanged?: StockHandler
  onLowStock?: StockHandler
}) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!isAuthenticated) return

    const onStock: StockHandler = (message) => {
      void queryClient.invalidateQueries({ queryKey: ['catalog', 'products'] })
      void queryClient.invalidateQueries({ queryKey: ['notifications'] })
      options?.onStockChanged?.(message)
    }
    const onLow: StockHandler = (message) => {
      void queryClient.invalidateQueries({ queryKey: ['notifications'] })
      options?.onLowStock?.(message)
    }

    stockListeners.add(onStock)
    lowStockListeners.add(onLow)

    let cancelled = false
    void (async () => {
      try {
        if (!cancelled) await ensureConnection()
      } catch {
        // API/hub no disponible
      }
    })()

    return () => {
      cancelled = true
      stockListeners.delete(onStock)
      lowStockListeners.delete(onLow)
      void stopConnectionIfIdle()
    }
    // Handlers opcionales se leen en el momento del evento; no re-suscribir por identidad de función.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, queryClient])
}
