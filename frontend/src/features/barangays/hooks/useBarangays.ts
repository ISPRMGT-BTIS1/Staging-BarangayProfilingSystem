import { useQuery } from '@tanstack/react-query'
import { barangays as mockBarangays, streets as mockStreets } from '@/mocks'
import type { Barangay, Street } from '../types/barangay.types'

export const barangayKeys = {
  all: ['barangays'] as const,
  lists: () => [...barangayKeys.all, 'list'] as const,
  detail: (id: number) => [...barangayKeys.all, 'detail', id] as const,
  streets: (barangayId: number) => [...barangayKeys.all, 'streets', barangayId] as const,
}

export function useBarangays() {
  return useQuery<Barangay[]>({
    queryKey: barangayKeys.lists(),
    queryFn: async () => mockBarangays as Barangay[],
    // TODO: Replace with barangaysService.getAll().then(r => r.data.data)
  })
}

export function useStreets(barangayId?: number) {
  return useQuery<Street[]>({
    queryKey: barangayKeys.streets(barangayId ?? 0),
    queryFn: async () => {
      const list = mockStreets as Street[]
      if (!barangayId) return list
      return list.filter((s) => s.barangayId === barangayId)
    },
    enabled: true,
  })
}
