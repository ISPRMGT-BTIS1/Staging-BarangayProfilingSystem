import { apiClient } from '@/shared/lib/axios'
import type { CreateRoleDto, UpdateRoleDto } from '../types/role.types'

export const rolesService = {
  getAll: () => apiClient.get('/roles'),
  getById: (id: number) => apiClient.get(`/roles/${id}`),
  create: (data: CreateRoleDto) => apiClient.post('/roles', data),
  update: (id: number, data: UpdateRoleDto) => apiClient.patch(`/roles/${id}`, data),
  remove: (id: number) => apiClient.delete(`/roles/${id}`),
}
