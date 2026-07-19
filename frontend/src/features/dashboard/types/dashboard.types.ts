// ─── Dashboard Types ──────────────────────────────────────────────────────────

export interface DashboardStats {
  totalResidents: number
  totalHouseholds: number
  activeResidents: number
  inactiveResidents: number
  maleCount: number
  femaleCount: number
  seniorCitizenCount: number
  youthCount: number
  voterCount: number
  pwdCount: number
  indigentCount: number
  soloParentCount: number
}

export interface BirthdayCelebrator {
  residentId: string
  fullName: string
  birthDate: string
  age: number
}

export interface PopulationByBarangay {
  barangayName: string
  count: number
}
