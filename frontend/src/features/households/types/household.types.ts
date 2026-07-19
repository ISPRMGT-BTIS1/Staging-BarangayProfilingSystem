// ─── Household Types ──────────────────────────────────────────────────────────

export interface Household {
  householdId: string
  houseNumber: string
  streetId: string
  barangayId: number
  classification: HouseholdClassification
  toiletType?: string
  waterSource?: string
  electricitySource?: string
  headResidentId?: string
}

export type HouseholdClassification =
  | 'A' | 'B' | 'C' | 'D' | 'E'

export interface CreateHouseholdDto extends Omit<Household, 'householdId'> {}
export interface UpdateHouseholdDto extends Partial<CreateHouseholdDto> {}
