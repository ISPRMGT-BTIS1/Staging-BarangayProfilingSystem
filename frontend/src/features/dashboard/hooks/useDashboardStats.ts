import { useQuery } from '@tanstack/react-query'
import type { DashboardStats, BirthdayCelebrator } from '../types/dashboard.types'

// Query keys — centralize to avoid string typos across the app
export const dashboardKeys = {
  all: ['dashboard'] as const,
  stats: () => [...dashboardKeys.all, 'stats'] as const,
  celebrators: (month: number) => [...dashboardKeys.all, 'celebrators', month] as const,
}

export function useDashboardStats(residents: any[]) {
  return useQuery<DashboardStats>({
    queryKey: [...dashboardKeys.stats(), residents],
    queryFn: async (): Promise<DashboardStats> => {
      const list = residents as Array<Record<string, unknown>>
      return {
        totalResidents: list.length,
        totalHouseholds: new Set(list.map((r) => r.householdId)).size,
        activeResidents: list.filter((r) => r.isActive).length,
        inactiveResidents: list.filter((r) => !r.isActive).length,
        maleCount: list.filter((r) => r.sex === 'Male').length,
        femaleCount: list.filter((r) => r.sex === 'Female').length,
        seniorCitizenCount: 0, // Needs residentStatuses
        youthCount: 0,
        voterCount: 0,
        pwdCount: 0,
        indigentCount: 0,
        soloParentCount: 0,
      }
    },
    enabled: !!residents
  })
}

export function useBirthdayCelebrators(residents: any[], month: number) {
  return useQuery<BirthdayCelebrator[]>({
    queryKey: [...dashboardKeys.celebrators(month), residents],
    queryFn: async (): Promise<BirthdayCelebrator[]> => {
      const list = residents as Array<Record<string, unknown>>
      return list
        .filter((r) => {
          if (!r.dateOfBirth) return false
          return new Date(r.dateOfBirth as string).getMonth() + 1 === month
        })
        .map((r) => ({
          residentId: r.residentId as string,
          fullName: `${r.lastName}, ${r.firstName}`,
          birthDate: r.dateOfBirth as string,
          age: new Date().getFullYear() - new Date(r.dateOfBirth as string).getFullYear(),
        }))
    },
    enabled: !!residents
  })
}
