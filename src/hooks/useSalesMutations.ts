import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createSale } from '../api/sales'
import type { CreateSaleRequest } from '../types'
import { queryKeys } from '../lib/queryClient'

export function useCreateSaleMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: CreateSaleRequest) => createSale(request),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.products })
      void queryClient.invalidateQueries({ queryKey: queryKeys.sales })
    },
  })
}
