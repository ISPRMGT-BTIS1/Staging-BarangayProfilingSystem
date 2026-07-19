import { apiClient } from '@/shared/lib/axios'
import type { CreateUserDto, UpdateUserDto, ChangePasswordDto } from '../types/user.types'

export const usersService = {
  getAll: () => apiClient.get('/users'),
  getById: (id: string) => apiClient.get(`/users/${id}`),
  create: (data: CreateUserDto) => apiClient.post('/users', data),
  update: (id: string, data: UpdateUserDto) => apiClient.patch(`/users/${id}`, data),
  remove: (id: string) => apiClient.delete(`/users/${id}`),
  changePassword: (id: string, data: ChangePasswordDto) =>
    apiClient.patch(`/users/${id}/change-password`, data),
  toggleActive: (id: string, isActive: boolean) =>
    apiClient.patch(`/users/${id}`, { isActive }),
}
