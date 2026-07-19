import { useQuery } from '@tanstack/react-query'
import { roles as mockRoles } from '@/mocks'
import type { Role } from '../types/role.types'

export const roleKeys = {
  all: ['roles'] as const,
  lists: () => [...roleKeys.all, 'list'] as const,
}

export function useRoles() {
  return useQuery<Role[]>({
    queryKey: roleKeys.lists(),
    queryFn: async () => mockRoles as Role[],
    // TODO: Replace with rolesService.getAll().then(r => r.data.data)
  })
}
