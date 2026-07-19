// ─── Barangay Types ───────────────────────────────────────────────────────────

export interface Barangay {
  id: number
  name: string
  code: string
  municipality: string
  province: string
  region: string
  sealSymbol?: string
  captainName?: string
  secretaryName?: string
  treasurerName?: string
  address?: string
  contactNumber?: string
  isActive: boolean
}

export interface Street {
  streetId: string
  streetName: string
  barangayId: number
}

export interface CreateBarangayDto extends Omit<Barangay, 'id'> {}
export interface UpdateBarangayDto extends Partial<CreateBarangayDto> {}
