// ─── Role Types ───────────────────────────────────────────────────────────────

export interface Role {
  roleId: number
  roleName: string
  description?: string
  permissions: Permission[]
  isSystem: boolean // System roles cannot be deleted
}

export type Permission =
  | 'residents:read'
  | 'residents:write'
  | 'residents:delete'
  | 'households:read'
  | 'households:write'
  | 'households:delete'
  | 'certificates:read'
  | 'certificates:write'
  | 'certificates:approve'
  | 'certificates:generate'
  | 'reports:read'
  | 'reports:generate'
  | 'users:read'
  | 'users:write'
  | 'users:delete'
  | 'roles:read'
  | 'roles:write'
  | 'settings:read'
  | 'settings:write'
  | 'barangays:read'
  | 'barangays:write'

export interface CreateRoleDto {
  roleName: string
  description?: string
  permissions: Permission[]
}

export interface UpdateRoleDto extends Partial<CreateRoleDto> {}
