const baseUrl = import.meta.env.VITE_API_URL ?? ''

export class ApiClientError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiClientError'
    this.status = status
  }
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown
}

function spanishStatusFallback(status: number): string {
  switch (status) {
    case 400:
      return 'Solicitud no válida'
    case 401:
      return 'Debes iniciar sesión'
    case 403:
      return 'No tienes permiso'
    case 404:
      return 'No encontrado'
    case 409:
      return 'Conflicto con el estado actual'
    case 422:
      return 'Datos no válidos'
    case 500:
      return 'Error interno del servidor'
    default:
      return 'No se pudo completar la solicitud'
  }
}

async function readErrorMessage(response: Response): Promise<string> {
  try {
    const errorBody = (await response.json()) as {
      message?: string
      error?: string
      detail?: string
      title?: string
    }
    const fromBody =
      errorBody.message ?? errorBody.error ?? errorBody.detail ?? errorBody.title
    if (fromBody && fromBody.trim()) return fromBody.trim()
  } catch {
    // ignore parse errors
  }
  return spanishStatusFallback(response.status)
}

export async function apiClient<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { body, headers: customHeaders, ...rest } = options

  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(customHeaders as Record<string, string>),
  }

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
  }

  let response: Response
  try {
    response = await fetch(`${baseUrl}${path}`, {
      ...rest,
      headers,
      credentials: 'include',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new ApiClientError(
      'No se pudo conectar con el servidor. Verifica que la API esté en ejecución.',
      0,
    )
  }

  if (!response.ok) {
    throw new ApiClientError(await readErrorMessage(response), response.status)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}

function filenameFromContentDisposition(header: string | null, fallback: string): string {
  if (!header) return fallback
  const utf8 = /filename\*=(?:UTF-8''|utf-8'')([^;]+)/i.exec(header)
  if (utf8?.[1]) {
    try {
      return decodeURIComponent(utf8[1].trim().replace(/^"+|"+$/g, ''))
    } catch {
      // fall through
    }
  }
  const plain = /filename="((?:\\.|[^"\\])*)"|filename=([^;]+)/i.exec(header)
  const raw = (plain?.[1] ?? plain?.[2] ?? '').trim().replace(/^"+|"+$/g, '')
  return raw || fallback
}

/** Descarga un archivo binario (PDF, Excel, CSV, etc.) y dispara la descarga en el navegador. */
export async function downloadBlob(path: string, filename: string): Promise<void> {
  let response: Response
  try {
    response = await fetch(`${baseUrl}${path}`, {
      credentials: 'include',
      headers: { Accept: '*/*' },
    })
  } catch {
    throw new ApiClientError(
      'No se pudo conectar con el servidor. Verifica que la API esté en ejecución.',
      0,
    )
  }

  if (!response.ok) {
    let message: string
    if (response.status === 403) {
      message = 'No tienes permiso para descargar este archivo.'
    } else if (response.status === 401) {
      message = 'Sesión expirada. Vuelve a iniciar sesión.'
    } else {
      message = await readErrorMessage(response)
    }
    throw new ApiClientError(message, response.status)
  }

  const downloadName = filenameFromContentDisposition(
    response.headers.get('Content-Disposition'),
    filename,
  )
  const blob = await response.blob()
  const url = URL.createObjectURL(blob)
  try {
    const link = document.createElement('a')
    link.href = url
    link.download = downloadName
    document.body.appendChild(link)
    link.click()
    link.remove()
  } finally {
    URL.revokeObjectURL(url)
  }
}
