import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchTypeahead, type TypeaheadEntity } from '../api/typeahead'
import { queryKeys } from '../lib/queryClient'
import { sanitizeSearchInput } from '../lib/queryParams'

export function useDebouncedValue<T>(value: T, delayMs = 300): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delayMs)
    return () => window.clearTimeout(timer)
  }, [value, delayMs])

  return debounced
}

export function useTypeaheadQuery(
  entity: TypeaheadEntity,
  query: string,
  options?: { enabled?: boolean; take?: number; minLength?: number },
) {
  const minLength = options?.minLength ?? 0
  const take = options?.take ?? 20
  const sanitized = sanitizeSearchInput(query)
  const debounced = useDebouncedValue(sanitized, 300)
  const enabled =
    (options?.enabled ?? true) &&
    debounced.length >= minLength

  return useQuery({
    queryKey: queryKeys.typeahead(entity, debounced, take),
    queryFn: () => fetchTypeahead(entity, debounced, take),
    enabled,
    placeholderData: (prev) => prev,
  })
}
