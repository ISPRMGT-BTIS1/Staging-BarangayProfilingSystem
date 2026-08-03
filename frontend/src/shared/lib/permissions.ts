// ─── Role IDs ─────────────────────────────────────────────────────────────────
// These must match the role_id values seeded in the `roles` table in Supabase.

export const ROLE = {
  CAPTAIN:   1,  // Brgy. Captain   — Full Access
  SECRETARY: 2,  // Brgy. Secretary — Full Access
  KAGAWAD:   3,  // Brgy. Kagawad   — Partial Access
  TANOD:     4,  // Tanod           — Partial Access (view-only on residents)
} as const

export type RoleId = (typeof ROLE)[keyof typeof ROLE]

// ─── Permission Keys ──────────────────────────────────────────────────────────
// Each string key represents one discrete capability in the app.

export const PERM = {
  // Navigation / page access
  VIEW_DASHBOARD:    'view_dashboard',
  VIEW_RESIDENTS:    'view_residents',
  VIEW_HOUSEHOLDS:   'view_households',
  VIEW_EVENTS:       'view_events',
  VIEW_BARANGAYS:    'view_barangays',
  VIEW_CERTIFICATES: 'view_certificates',
  VIEW_REPORTS:      'view_reports',
  VIEW_USERS:        'view_users',
  VIEW_ROLES:        'view_roles',
  VIEW_SETTINGS:     'view_settings',

  // Data mutation
  EDIT_RESIDENTS:    'edit_residents',    // add / edit / delete residents
  EDIT_HOUSEHOLDS:   'edit_households',
  MANAGE_EVENTS:     'manage_events',
  ISSUE_CERTIFICATES:'issue_certificates',
  MANAGE_USERS:      'manage_users',
} as const

export type Permission = (typeof PERM)[keyof typeof PERM]

// ─── Permissions Map ──────────────────────────────────────────────────────────
// Lists every permission granted to each role.

export const ROLE_PERMISSIONS: Record<RoleId, Permission[]> = {
  [ROLE.CAPTAIN]: [
    PERM.VIEW_DASHBOARD,
    PERM.VIEW_RESIDENTS,    PERM.EDIT_RESIDENTS,
    PERM.VIEW_HOUSEHOLDS,   PERM.EDIT_HOUSEHOLDS,
    PERM.VIEW_EVENTS,       PERM.MANAGE_EVENTS,
    PERM.VIEW_BARANGAYS,
    PERM.VIEW_CERTIFICATES, PERM.ISSUE_CERTIFICATES,
    PERM.VIEW_REPORTS,
    PERM.VIEW_USERS,        PERM.MANAGE_USERS,
    PERM.VIEW_ROLES,
    PERM.VIEW_SETTINGS,
  ],
  [ROLE.SECRETARY]: [
    PERM.VIEW_DASHBOARD,
    PERM.VIEW_RESIDENTS,    PERM.EDIT_RESIDENTS,
    PERM.VIEW_HOUSEHOLDS,   PERM.EDIT_HOUSEHOLDS,
    PERM.VIEW_EVENTS,       PERM.MANAGE_EVENTS,
    PERM.VIEW_BARANGAYS,
    PERM.VIEW_CERTIFICATES, PERM.ISSUE_CERTIFICATES,
    PERM.VIEW_REPORTS,
    PERM.VIEW_USERS,        PERM.MANAGE_USERS,
    PERM.VIEW_ROLES,
    PERM.VIEW_SETTINGS,
  ],
  [ROLE.KAGAWAD]: [
    PERM.VIEW_DASHBOARD,
    PERM.VIEW_RESIDENTS,    PERM.EDIT_RESIDENTS,
    PERM.VIEW_HOUSEHOLDS,   PERM.EDIT_HOUSEHOLDS,
    PERM.VIEW_EVENTS,       PERM.MANAGE_EVENTS,
    PERM.VIEW_BARANGAYS,
    PERM.VIEW_CERTIFICATES, PERM.ISSUE_CERTIFICATES,
    PERM.VIEW_REPORTS,
  ],
  [ROLE.TANOD]: [
    PERM.VIEW_DASHBOARD,
    PERM.VIEW_RESIDENTS,   // read-only (no EDIT_RESIDENTS)
    PERM.VIEW_EVENTS,      // read-only (no MANAGE_EVENTS)
  ],
}

// ─── Role Metadata ────────────────────────────────────────────────────────────
// Display info used in the UI (Roles page, sidebar badge, user table, etc.)

export interface RoleMeta {
  id: RoleId
  name: string
  tagline: string
  accessLevel: 'full' | 'partial'
  color: string       // Tailwind text/bg class fragment
  badge: string       // short badge label
}

export const ROLE_META: Record<RoleId, RoleMeta> = {
  [ROLE.CAPTAIN]: {
    id: ROLE.CAPTAIN,
    name: 'Brgy. Captain',
    tagline: 'Full system access — highest authority',
    accessLevel: 'full',
    color: 'pink',
    badge: 'CAPTAIN',
  },
  [ROLE.SECRETARY]: {
    id: ROLE.SECRETARY,
    name: 'Brgy. Secretary',
    tagline: 'Full system access — records & user management',
    accessLevel: 'full',
    color: 'pink',
    badge: 'SECRETARY',
  },
  [ROLE.KAGAWAD]: {
    id: ROLE.KAGAWAD,
    name: 'Brgy. Kagawad',
    tagline: 'Partial access — residents, households & certificates',
    accessLevel: 'partial',
    color: 'teal',
    badge: 'KAGAWAD',
  },
  [ROLE.TANOD]: {
    id: ROLE.TANOD,
    name: 'Tanod',
    tagline: 'Partial access — view residents & events only',
    accessLevel: 'partial',
    color: 'slate',
    badge: 'TANOD',
  },
}

// ─── Helper ───────────────────────────────────────────────────────────────────

export function checkPermission(roleId: number | undefined, perm: Permission): boolean {
  if (!roleId) return false
  const granted = ROLE_PERMISSIONS[roleId as RoleId]
  return !!granted?.includes(perm)
}
