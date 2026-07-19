// ─── Resident Types ───────────────────────────────────────────────────────────

export type Sex = 'Male' | 'Female'
export type CivilStatus = 'Single' | 'Married' | 'Widowed' | 'Separated' | 'Annulled'
export type ResidentStatus = 'Active' | 'Inactive' | 'Moved' | 'Deceased'

export interface Resident {
  residentId: string
  firstName: string
  middleName?: string
  lastName: string
  suffix?: string
  birthDate: string
  sex: Sex
  civilStatus: CivilStatus
  contactNumber?: string
  occupation?: string
  company?: string
  citizenship: string
  residencySince: string
  status: ResidentStatus
  householdId: string
  familyId?: string
  parentId?: string
  barangayId: number

  // Flags
  isVoter: boolean
  isSeniorCitizen: boolean
  isPwd: boolean
  isYouth: boolean
  isIndigent: boolean
  isSoloParent: boolean
  isDependent: boolean

  // Emergency contact
  emergencyContactName?: string
  emergencyContactRelationship?: string
  emergencyContactNumber?: string
}

export interface CreateResidentDto
  extends Omit<Resident, 'residentId' | 'status'> {}

export interface UpdateResidentDto extends Partial<CreateResidentDto> {}
