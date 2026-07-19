// ─── User Types ───────────────────────────────────────────────────────────────

export interface SystemUser {
  userId: string
  username: string
  fullName: string
  email?: string
  roleId: number
  barangayId: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateUserDto {
  username: string
  password: string
  fullName: string
  email?: string
  roleId: number
  barangayId: number
}

export interface UpdateUserDto {
  fullName?: string
  email?: string
  roleId?: number
  barangayId?: number
  isActive?: boolean
}

export interface ChangePasswordDto {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}
