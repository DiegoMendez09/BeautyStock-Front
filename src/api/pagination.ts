import { buildQueryString } from '../lib/queryParams'

export interface PageParams {
  page?: number
  pageSize?: number
}

export const DEFAULT_PAGE = 1
export const DEFAULT_PAGE_SIZE = 20
export const PAGE_SIZE_OPTIONS = [10, 20, 50] as const

/** Construye el query string de una lista paginada, combinando page/pageSize con filtros propios del recurso. */
export function buildPagedQuery(
  params: Record<string, string | number | boolean | null | undefined> = {},
): string {
  return buildQueryString(params)
}
