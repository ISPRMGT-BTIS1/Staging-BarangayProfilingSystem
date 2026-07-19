import { useQuery } from '@tanstack/react-query'
import { households as mockHouseholds } from '@/mocks'
import type { Household } from '../types/household.types'

export const householdKeys = {
  all: ['households'] as const,
  lists: () => [...householdKeys.all, 'list'] as const,
  detail: (id: string) => [...householdKeys.all, 'detail', id] as const,
}

export function useHouseholds(search?: string) {
  return useQuery<Household[]>({
    queryKey: householdKeys.list ? [householdKeys.lists(), { search }] : householdKeys.lists(),
    queryFn: async () => {
      // TODO: Replace with householdsService.getAll().then(r => r.data.data)
      const list = mockHouseholds as Household[]
      if (!search) return list
      const q = search.toLowerCase()
      return list.filter(
        (h) =>
          h.householdId.toLowerCase().includes(q) ||
          h.houseNumber.toLowerCase().includes(q),
      )
    },
  })
}

export function useHousehold(id: string) {
  return useQuery<Household>({
    queryKey: householdKeys.detail(id),
    queryFn: async () => {
      const found = (mockHouseholds as Household[]).find((h) => h.householdId === id)
      if (!found) throw new Error(`Household ${id} not found`)
      return found
    },
    enabled: Boolean(id),
  })
}
