import { useQuery } from '@tanstack/react-query'
import { residents } from '@/mocks'
import type { DashboardStats, BirthdayCelebrator } from '../types/dashboard.types'

// Query keys — centralize to avoid string typos across the app
export const dashboardKeys = {
  all: ['dashboard'] as const,
  stats: () => [...dashboardKeys.all, 'stats'] as const,
  celebrators: (month: number) => [...dashboardKeys.all, 'celebrators', month] as const,
}

/**
 * Fetches dashboard aggregate stats.
 * Currently derives stats from mockData. Replace queryFn with dashboardService.getStats()
 * when the NestJS API is connected.
 */
export function useDashboardStats() {
  return useQuery<DashboardStats>({
    queryKey: dashboardKeys.stats(),
    queryFn: async (): Promise<DashboardStats> => {
      // TODO: Replace with dashboardService.getStats().then(r => r.data.data)
      const list = residents as Array<Record<string, unknown>>
      return {
        totalResidents: list.length,
        totalHouseholds: new Set(list.map((r) => r.householdId)).size,
        activeResidents: list.filter((r) => r.status === 'Active').length,
        inactiveResidents: list.filter((r) => r.status !== 'Active').length,
        maleCount: list.filter((r) => r.sex === 'Male').length,
        femaleCount: list.filter((r) => r.sex === 'Female').length,
        seniorCitizenCount: list.filter((r) => r.isSeniorCitizen).length,
        youthCount: list.filter((r) => r.isYouth).length,
        voterCount: list.filter((r) => r.isVoter).length,
        pwdCount: list.filter((r) => r.isPwd).length,
        indigentCount: list.filter((r) => r.isIndigent).length,
        soloParentCount: list.filter((r) => r.isSoloParent).length,
      }
    },
  })
}

/**
 * Fetches birthday celebrators for the given month.
 */
export function useBirthdayCelebrators(month: number) {
  return useQuery<BirthdayCelebrator[]>({
    queryKey: dashboardKeys.celebrators(month),
    queryFn: async (): Promise<BirthdayCelebrator[]> => {
      // TODO: Replace with dashboardService.getBirthdayCelebrators(month).then(r => r.data.data)
      const list = residents as Array<Record<string, unknown>>
      return list
        .filter((r) => {
          if (!r.birthDate) return false
          return new Date(r.birthDate as string).getMonth() + 1 === month
        })
        .map((r) => ({
          residentId: r.residentId as string,
          fullName: `${r.lastName}, ${r.firstName}`,
          birthDate: r.birthDate as string,
          age: new Date().getFullYear() - new Date(r.birthDate as string).getFullYear(),
        }))
    },
  })
}
