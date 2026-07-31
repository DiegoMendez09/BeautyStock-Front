import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createSale } from '../api/sales'
import type { CreateSaleRequest } from '../types'

export function useCreateSaleMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: CreateSaleRequest) => createSale(request),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['catalog', 'products'] })
      void queryClient.invalidateQueries({ queryKey: ['sales'] })
    },
  })
}
