import { apiClient } from '@/shared/lib/axios'
import type { PaginationParams } from '@/shared/types/api.types'
import type { CreateResidentDto, UpdateResidentDto } from '../types/resident.types'

/**
 * Residents service — wraps NestJS /residents endpoints.
 */
export const residentsService = {
  /** GET /residents — paginated, searchable list */
  getAll: (params?: PaginationParams) =>
    apiClient.get('/residents', { params }),

  /** GET /residents/:id — single resident with household and family info */
  getById: (id: string) =>
    apiClient.get(`/residents/${id}`),

  /** POST /residents */
  create: (data: CreateResidentDto) =>
    apiClient.post('/residents', data),

  /** PATCH /residents/:id */
  update: (id: string, data: UpdateResidentDto) =>
    apiClient.patch(`/residents/${id}`, data),

  /** DELETE /residents/:id */
  remove: (id: string) =>
    apiClient.delete(`/residents/${id}`),

  /** POST /residents/import/csv — bulk CSV import */
  importCsv: (formData: FormData) =>
    apiClient.post('/residents/import/csv', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
}
