// ─── Report Types ─────────────────────────────────────────────────────────────

export type ReportType =
  | 'POPULATION_SUMMARY'
  | 'RESIDENT_LIST'
  | 'HOUSEHOLD_LIST'
  | 'SENIOR_CITIZENS'
  | 'PWD_LIST'
  | 'VOTER_LIST'
  | 'YOUTH_LIST'
  | 'INDIGENT_LIST'
  | 'SOLO_PARENT_LIST'
  | 'AGE_DISTRIBUTION'
  | 'BIRTHDAY_CELEBRATORS'

export interface ReportFilter {
  barangayId?: number
  startDate?: string
  endDate?: string
  sex?: 'Male' | 'Female'
  minAge?: number
  maxAge?: number
  streetId?: string
}

export interface ReportRequest {
  type: ReportType
  filters?: ReportFilter
  format?: 'PDF' | 'XLSX' | 'CSV'
}
