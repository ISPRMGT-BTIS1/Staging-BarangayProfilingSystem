// ─── Settings Types ───────────────────────────────────────────────────────────

export interface SystemSettings {
  id: number
  barangayId: number
  systemName: string
  officialLogoUrl?: string
  primaryColor?: string
  defaultCertificateFooter?: string
  auditLogRetentionDays: number
  allowSelfRegistration: boolean
  requireApprovalForCertificates: boolean
  updatedAt: string
}

export interface UpdateSettingsDto extends Partial<Omit<SystemSettings, 'id' | 'barangayId' | 'updatedAt'>> {}
