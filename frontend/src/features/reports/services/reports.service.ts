import { apiClient } from '@/shared/lib/axios'
import type { ReportRequest } from '../types/report.types'

export const reportsService = {
  /** GET /reports — list of saved/generated reports */
  getAll: () => apiClient.get('/reports'),

  /**
   * POST /reports/generate — trigger report generation on the backend.
   * Returns a file blob (PDF/XLSX/CSV) via responseType: 'blob'.
   */
  generate: (data: ReportRequest) =>
    apiClient.post('/reports/generate', data, { responseType: 'blob' }),

  /** GET /reports/preview — returns JSON data for client-side rendering */
  preview: (data: ReportRequest) =>
    apiClient.post('/reports/preview', data),
}
