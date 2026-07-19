// ─── Auth Types ───────────────────────────────────────────────────────────────

export interface LoginCredentials {
  username: string
  password: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken?: string
}

export interface AuthUser {
  userId: string
  username: string
  fullName: string
  roleId: number
  barangayId: number
  isActive: boolean
}

export interface LoginResponse {
  user: AuthUser
  tokens: AuthTokens
}
