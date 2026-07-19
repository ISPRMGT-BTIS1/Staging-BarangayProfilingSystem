import { apiClient } from '@/shared/lib/axios'
import type { CreateBarangayDto, UpdateBarangayDto } from '../types/barangay.types'

export const barangaysService = {
  getAll: () => apiClient.get('/barangays'),
  getById: (id: number) => apiClient.get(`/barangays/${id}`),
  getStreets: (barangayId: number) => apiClient.get(`/barangays/${barangayId}/streets`),
  create: (data: CreateBarangayDto) => apiClient.post('/barangays', data),
  update: (id: number, data: UpdateBarangayDto) => apiClient.patch(`/barangays/${id}`, data),
  remove: (id: number) => apiClient.delete(`/barangays/${id}`),
  createStreet: (barangayId: number, streetName: string) =>
    apiClient.post(`/barangays/${barangayId}/streets`, { streetName }),
}
