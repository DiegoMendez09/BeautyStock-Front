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

/** Descarga un archivo binario (p. ej. PDF) y dispara la descarga en el navegador. */
export async function downloadBlob(path: string, filename: string): Promise<void> {
  let response: Response
  try {
    response = await fetch(`${baseUrl}${path}`, {
      credentials: 'include',
      headers: { Accept: 'application/pdf' },
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
      message = 'No tienes permiso para exportar este PDF.'
    } else if (response.status === 401) {
      message = 'Sesión expirada. Vuelve a iniciar sesión.'
    } else {
      message = await readErrorMessage(response)
    }
    throw new ApiClientError(message, response.status)
  }

  const blob = await response.blob()
  const url = URL.createObjectURL(blob)
  try {
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    link.remove()
  } finally {
    URL.revokeObjectURL(url)
  }
}
