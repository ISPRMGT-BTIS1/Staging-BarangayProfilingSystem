import { apiClient } from '@/shared/lib/axios'
import type { UpdateSettingsDto } from '../types/settings.types'

export const settingsService = {
  get: (barangayId: number) => apiClient.get(`/settings/${barangayId}`),
  update: (barangayId: number, data: UpdateSettingsDto) =>
    apiClient.patch(`/settings/${barangayId}`, data),
  getAuditLog: (barangayId: number, page = 1, limit = 50) =>
    apiClient.get(`/settings/${barangayId}/audit-log`, { params: { page, limit } }),
}
