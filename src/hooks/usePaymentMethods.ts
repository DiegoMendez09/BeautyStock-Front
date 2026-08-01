import { useQuery } from '@tanstack/react-query'
import { getPaymentConfig } from '../api/sales'
import { toPaymentMethodOptions } from '../lib/paymentMethods'
import { P } from '../lib/permissions'
import { useAuth } from './useAuth'

/** Métodos de pago habilitados desde el API (fallback: Efectivo). */
export function usePaymentMethods(enabled = true) {
  const { isAuthenticated, hasPermission } = useAuth()
  const canLoad =
    enabled && isAuthenticated && hasPermission(P.Sales.Create)

  const query = useQuery({
    queryKey: ['sales', 'payment-config'],
    queryFn: getPaymentConfig,
    enabled: canLoad,
    staleTime: 60_000,
  })

  const methods = toPaymentMethodOptions(query.data?.methods)
  const defaultCode = methods[0]?.code ?? 'Cash'

  return { methods, defaultCode, isLoading: query.isLoading }
}
