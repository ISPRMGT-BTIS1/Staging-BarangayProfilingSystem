import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { residents as mockResidents } from '@/mocks'
import type { Resident, UpdateResidentDto } from '../types/resident.types'

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const residentKeys = {
  all: ['residents'] as const,
  lists: () => [...residentKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...residentKeys.lists(), filters] as const,
  details: () => [...residentKeys.all, 'detail'] as const,
  detail: (id: string) => [...residentKeys.details(), id] as const,
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

/**
 * Fetches all residents.
 * TODO: Replace queryFn body with residentsService.getAll(params).then(r => r.data.data)
 */
export function useResidents(search?: string) {
  return useQuery<Resident[]>({
    queryKey: residentKeys.list({ search }),
    queryFn: async () => {
      const list = mockResidents as Resident[]
      if (!search) return list
      const q = search.toLowerCase()
      return list.filter(
        (r) =>
          r.firstName.toLowerCase().includes(q) ||
          r.lastName.toLowerCase().includes(q) ||
          r.residentId.toLowerCase().includes(q),
      )
    },
  })
}

/**
 * Fetches a single resident by ID.
 * TODO: Replace queryFn body with residentsService.getById(id).then(r => r.data.data)
 */
export function useResident(id: string) {
  return useQuery<Resident>({
    queryKey: residentKeys.detail(id),
    queryFn: async () => {
      const found = (mockResidents as Resident[]).find((r) => r.residentId === id)
      if (!found) throw new Error(`Resident ${id} not found`)
      return found
    },
    enabled: Boolean(id),
  })
}

/**
 * Mutation hook for updating a resident.
 * Optimistically invalidates the resident list + detail cache on success.
 */
export function useUpdateResident() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateResidentDto }) =>
      Promise.resolve({ id, ...data }), // TODO: residentsService.update(id, data)
    onSuccess: (_data, { id }) => {
      void queryClient.invalidateQueries({ queryKey: residentKeys.lists() })
      void queryClient.invalidateQueries({ queryKey: residentKeys.detail(id) })
    },
  })
}
