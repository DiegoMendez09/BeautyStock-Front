import {
  keepPreviousData,
  useQuery,
  type QueryKey,
  type UseQueryOptions,
  type UseQueryResult,
} from '@tanstack/react-query'
import type { PagedResult } from '../types'
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '../api/pagination'

export type PagedQueryParams = {
  page?: number
  pageSize?: number
}

/**
 * Consulta paginada alineada al contrato del backend (`PagedResult`).
 * Conserva la página anterior mientras carga (UX sin parpadeo).
 */
export function usePagedQuery<TItem, TParams extends PagedQueryParams>(
  queryKey: QueryKey,
  queryFn: (params: TParams) => Promise<PagedResult<TItem>>,
  params: TParams,
  options?: Omit<
    UseQueryOptions<PagedResult<TItem>, Error, PagedResult<TItem>, QueryKey>,
    'queryKey' | 'queryFn'
  >,
): UseQueryResult<PagedResult<TItem>, Error> & {
  page: number
  pageSize: number
  items: TItem[]
} {
  const page = params.page && params.page > 0 ? params.page : DEFAULT_PAGE
  const pageSize =
    params.pageSize && params.pageSize > 0 ? params.pageSize : DEFAULT_PAGE_SIZE

  const resolved = { ...params, page, pageSize } as TParams

  const query = useQuery({
    queryKey,
    queryFn: () => queryFn(resolved),
    placeholderData: keepPreviousData,
    ...options,
  })

  return {
    ...query,
    page: query.data?.page ?? page,
    pageSize: query.data?.pageSize ?? pageSize,
    items: query.data?.items ?? [],
  }
}
