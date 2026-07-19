import { apiClient } from '@/shared/lib/axios'
import type { PaginationParams } from '@/shared/types/api.types'
import type { CreateHouseholdDto, UpdateHouseholdDto } from '../types/household.types'

export const householdsService = {
  getAll: (params?: PaginationParams) =>
    apiClient.get('/households', { params }),
  getById: (id: string) =>
    apiClient.get(`/households/${id}`),
  getMembers: (id: string) =>
    apiClient.get(`/households/${id}/members`),
  create: (data: CreateHouseholdDto) =>
    apiClient.post('/households', data),
  update: (id: string, data: UpdateHouseholdDto) =>
    apiClient.patch(`/households/${id}`, data),
  remove: (id: string) =>
    apiClient.delete(`/households/${id}`),
}
