import { ApiClientError, downloadBlob } from './client'

const baseUrl = import.meta.env.VITE_API_URL ?? ''

export type BulkAction = 'create' | 'update' | 'deactivate' | 'delete'

export type BulkModule =
  | 'categories'
  | 'brands'
  | 'products'
  | 'customers'
  | 'faq'
  | 'suppliers'

export interface BulkRowError {
  rowNumber: number
  message: string
}

export interface BulkImportResult {
  successCount: number
  errorCount: number
  errors: BulkRowError[]
  warning?: string | null
}

export async function downloadBulkTemplate(module: BulkModule, action: BulkAction): Promise<void> {
  await downloadBlob(
    `/api/v1/bulk/${module}/template.csv?action=${action}`,
    `plantilla-${module}-${action}.csv`,
  )
}

export async function uploadBulkCsv(
  module: BulkModule,
  action: BulkAction,
  csvText: string,
): Promise<BulkImportResult> {
  let response: Response
  try {
    response = await fetch(`${baseUrl}/api/v1/bulk/${module}?action=${action}`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'text/csv; charset=utf-8',
      },
      body: csvText,
    })
  } catch {
    throw new ApiClientError(
      'No se pudo conectar con el servidor. Verifica que la API esté en ejecución.',
      0,
    )
  }

  if (!response.ok) {
    let message = 'No se pudo procesar la carga masiva'
    try {
      const errorBody = (await response.json()) as { message?: string }
      if (errorBody.message?.trim()) message = errorBody.message.trim()
    } catch {
      // ignore
    }
    throw new ApiClientError(message, response.status)
  }

  return response.json() as Promise<BulkImportResult>
}
