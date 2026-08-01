const COLOMBIA_TZ = 'America/Bogota'
/** Colombia has no DST; matches America/Bogota / SA Pacific Standard Time. */
const COLOMBIA_OFFSET = '-05:00'

const dateTimeFormatter = new Intl.DateTimeFormat('es-CO', {
  timeZone: COLOMBIA_TZ,
  dateStyle: 'short',
  timeStyle: 'medium',
})

const dateFormatter = new Intl.DateTimeFormat('es-CO', {
  timeZone: COLOMBIA_TZ,
  dateStyle: 'short',
})

/**
 * Parses API datetimes. Naive ISO (no Z/offset) is treated as Colombia wall-clock
 * to match datetime2 values stored without timezone.
 */
export function parseApiDate(value: string | Date): Date {
  if (value instanceof Date) return value
  const s = value.trim()
  if (!s) return new Date(NaN)
  if (/[zZ]|[+-]\d{2}:?\d{2}$/.test(s)) return new Date(s)
  if (s.includes('T')) return new Date(`${s}${COLOMBIA_OFFSET}`)
  return new Date(`${s}T00:00:00${COLOMBIA_OFFSET}`)
}

/** Formats an API datetime in Colombia time (America/Bogota). */
export function formatDateTime(value: string | Date | null | undefined): string {
  if (value == null || value === '') return ''
  const date = parseApiDate(value)
  if (Number.isNaN(date.getTime())) return ''
  return dateTimeFormatter.format(date)
}

export function formatDate(value: string | Date | null | undefined): string {
  if (value == null || value === '') return ''
  const date = parseApiDate(value)
  if (Number.isNaN(date.getTime())) return ''
  return dateFormatter.format(date)
}
