import { useQuery } from '@tanstack/react-query'
import { users as mockUsers } from '@/mocks'
import type { SystemUser } from '../types/user.types'

export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  detail: (id: string) => [...userKeys.all, 'detail', id] as const,
}

export function useUsers() {
  return useQuery<SystemUser[]>({
    queryKey: userKeys.lists(),
    queryFn: async () => mockUsers as SystemUser[],
    // TODO: Replace with usersService.getAll().then(r => r.data.data)
  })
}
