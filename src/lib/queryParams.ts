/** Limita longitud y quita caracteres de control antes de enviar búsquedas a la API. */
export function sanitizeSearchInput(value: string, maxLength = 100): string {
  return value.replace(/[\u0000-\u001F\u007F]/g, '').trim().slice(0, maxLength)
}

export function buildQueryString(
  params: Record<string, string | number | boolean | null | undefined>,
): string {
  const search = new URLSearchParams()
  for (const [key, raw] of Object.entries(params)) {
    if (raw === null || raw === undefined || raw === '') continue
    search.set(key, String(raw))
  }
  const qs = search.toString()
  return qs ? `?${qs}` : ''
}
