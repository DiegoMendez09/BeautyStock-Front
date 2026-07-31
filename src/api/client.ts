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
    let message = response.statusText
    try {
      const errorBody = (await response.json()) as { message?: string; title?: string }
      message = errorBody.message ?? errorBody.title ?? message
    } catch {
      // ignore
    }
    throw new ApiClientError(message, response.status)
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
    let message = response.statusText
    try {
      const errorBody = (await response.json()) as { message?: string; title?: string }
      message = errorBody.message ?? errorBody.title ?? message
    } catch {
      // ignore
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
