import { apiClient } from '@/shared/lib/axios'

/**
 * Dashboard service — wraps NestJS /dashboard endpoints.
 */
export const dashboardService = {
  /** GET /dashboard/stats — aggregate population statistics */
  getStats: () =>
    apiClient.get('/dashboard/stats'),

  /** GET /dashboard/birthday-celebrators?month=N — residents with birthday this month */
  getBirthdayCelebrators: (month?: number) =>
    apiClient.get('/dashboard/birthday-celebrators', { params: { month } }),

  /** GET /dashboard/population-by-barangay */
  getPopulationByBarangay: () =>
    apiClient.get('/dashboard/population-by-barangay'),
}
