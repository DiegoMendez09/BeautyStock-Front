import { apiClient } from './client'
import type { NotificationItem, LoginLogItem } from '../types'

export async function getNotifications(take = 30): Promise<NotificationItem[]> {
  return apiClient<NotificationItem[]>(`/api/v1/notifications?take=${take}`)
}

export async function markNotificationRead(id: number): Promise<void> {
  await apiClient<void>(`/api/v1/notifications/${id}/read`, { method: 'POST' })
}

export async function getLoginAudit(take = 50): Promise<LoginLogItem[]> {
  return apiClient<LoginLogItem[]>(`/api/v1/audit/logins?take=${take}`)
}
