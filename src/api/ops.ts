import { apiClient, downloadBlob } from './client'
import { buildQueryString } from '../lib/queryParams'
import type {
  ApplicationLogItem,
  AuditLogItem,
  FaqChatLogItem,
  LoginLogItem,
  NotificationItem,
  PagedResult,
} from '../types'
import type { PageParams } from './pagination'

export async function getNotifications(take = 30): Promise<NotificationItem[]> {
  return apiClient<NotificationItem[]>(`/api/v1/notifications?take=${take}`)
}

export async function markNotificationRead(id: number): Promise<void> {
  await apiClient<void>(`/api/v1/notifications/${id}/read`, { method: 'POST' })
}

export interface LoginAuditParams extends PageParams {
  from?: string
  to?: string
  userAccountId?: number
  email?: string
  isSuccess?: boolean
}

export interface AuditLogParams extends PageParams {
  from?: string
  to?: string
  userAccountId?: number
  action?: string
  entityName?: string
  moduleCode?: string
}

export interface ApplicationLogParams extends PageParams {
  from?: string
  to?: string
  userAccountId?: number
  level?: string
  source?: string
}

export interface FaqChatLogParams extends PageParams {
  from?: string
  to?: string
  userAccountId?: number
  queryText?: string
}

export async function getLoginAudit(params: LoginAuditParams = {}): Promise<PagedResult<LoginLogItem>> {
  const qs = buildQueryString({ ...params })
  return apiClient<PagedResult<LoginLogItem>>(`/api/v1/audit/logins${qs}`)
}

export async function getAuditLogs(params: AuditLogParams = {}): Promise<PagedResult<AuditLogItem>> {
  const qs = buildQueryString({ ...params })
  return apiClient<PagedResult<AuditLogItem>>(`/api/v1/audit/logs${qs}`)
}

export async function getApplicationLogs(
  params: ApplicationLogParams = {},
): Promise<PagedResult<ApplicationLogItem>> {
  const qs = buildQueryString({ ...params })
  return apiClient<PagedResult<ApplicationLogItem>>(`/api/v1/audit/application${qs}`)
}

export async function getFaqChatLogs(
  params: FaqChatLogParams = {},
): Promise<PagedResult<FaqChatLogItem>> {
  const qs = buildQueryString({ ...params })
  return apiClient<PagedResult<FaqChatLogItem>>(`/api/v1/audit/faq-chat${qs}`)
}

export async function downloadLoginLogPdf(id: number): Promise<void> {
  await downloadBlob(`/api/v1/audit/logins/${id}/pdf`, `inicio-sesion-${id}.pdf`)
}

export async function downloadAuditLogPdf(id: number): Promise<void> {
  await downloadBlob(`/api/v1/audit/logs/${id}/pdf`, `auditoria-${id}.pdf`)
}

export async function downloadApplicationLogPdf(id: number): Promise<void> {
  await downloadBlob(`/api/v1/audit/application/${id}/pdf`, `aplicacion-${id}.pdf`)
}

export async function downloadFaqChatLogPdf(id: number): Promise<void> {
  await downloadBlob(`/api/v1/audit/faq-chat/${id}/pdf`, `chat-faq-${id}.pdf`)
}

export async function downloadLoginLogsExportPdf(
  params: Omit<LoginAuditParams, 'page' | 'pageSize'> = {},
): Promise<void> {
  const qs = buildQueryString({ ...params })
  await downloadBlob(`/api/v1/audit/logins/export/pdf${qs}`, 'historial-inicios-sesion.pdf')
}

export async function downloadAuditLogsExportPdf(
  params: Omit<AuditLogParams, 'page' | 'pageSize'> = {},
): Promise<void> {
  const qs = buildQueryString({ ...params })
  await downloadBlob(`/api/v1/audit/logs/export/pdf${qs}`, 'historial-auditoria.pdf')
}

export async function downloadApplicationLogsExportPdf(
  params: Omit<ApplicationLogParams, 'page' | 'pageSize'> = {},
): Promise<void> {
  const qs = buildQueryString({ ...params })
  await downloadBlob(`/api/v1/audit/application/export/pdf${qs}`, 'historial-aplicacion.pdf')
}

export async function downloadFaqChatLogsExportPdf(
  params: Omit<FaqChatLogParams, 'page' | 'pageSize'> = {},
): Promise<void> {
  const qs = buildQueryString({ ...params })
  await downloadBlob(`/api/v1/audit/faq-chat/export/pdf${qs}`, 'historial-chat-faq.pdf')
}
