import React, { createContext, useContext, useState } from 'react'
import { supabase } from '@/utils/supabaseClient'
import {
  ROLE,
  ROLE_META,
  ROLE_PERMISSIONS,
  checkPermission,
  type Permission,
  type RoleId,
} from '@/shared/lib/permissions'

// ─── Types ────────────────────────────────────────────────────────────────────

interface User {
  userId: string
  username: string
  passwordHash: string
  fullName: string
  roleId: number
  barangayId: number
  isActive: boolean
  // Joined columns from Supabase select
  roles?: { role_name: string }
  barangays?: { barangay_name: string }
}

interface AuthContextValue {
  currentUser: User | null
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void

  // ── Role booleans ──────────────────────────────────────────────────────────
  /** Brgy. Captain (role 1) */
  isCaptain: boolean
  /** Brgy. Secretary (role 2) */
  isSecretary: boolean
  /** Brgy. Kagawad (role 3) */
  isKagawad: boolean
  /** Tanod (role 4) */
  isTanod: boolean

  // ── Legacy convenience flags (kept for backward compat) ───────────────────
  /** Captain or Secretary — full system access */
  isAdmin: boolean
  /** Kagawad or Tanod — partial access */
  isOfficial: boolean

  // ── Permission check ───────────────────────────────────────────────────────
  hasPermission: (perm: Permission) => boolean
  /** Can add/edit/delete data records (false for Tanod) */
  canEdit: boolean

  // ── Display helpers ────────────────────────────────────────────────────────
  getUserRole: () => string | null
  getUserBarangay: () => string | null
  getRoleBadge: () => string | null
  getRoleColor: () => 'pink' | 'teal' | 'slate' | null
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null)

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null)

  const login = async (username: string, password: string) => {
    try {
      const { data: users, error } = await supabase
        .from('users')
        .select('*, roles(role_name), barangays(barangay_name)')
        .eq('username', username)
        .eq('password_hash', password)
        .eq('is_active', true)

      if (error) {
        console.error('Login error:', error)
        return { success: false, error: 'System error during login.' }
      }

      if (users && users.length > 0) {
        const u = users[0]
        setCurrentUser({
          ...u,
          userId: u.user_id,
          fullName: u.full_name,
          passwordHash: u.password_hash,
          isActive: u.is_active,
          roleId: u.role_id,
          barangayId: u.barangay_id,
        } as User)
        return { success: true }
      }
      return { success: false, error: 'Invalid username or password.' }
    } catch (err) {
      console.error(err)
      return { success: false, error: 'System error during login.' }
    }
  }

  const logout = () => {
    setCurrentUser(null)
    localStorage.removeItem('access_token')
  }

  // ── Role flags ─────────────────────────────────────────────────────────────
  const roleId = currentUser?.roleId
  const isCaptain   = roleId === ROLE.CAPTAIN
  const isSecretary = roleId === ROLE.SECRETARY
  const isKagawad   = roleId === ROLE.KAGAWAD
  const isTanod     = roleId === ROLE.TANOD

  // Legacy
  const isAdmin    = isCaptain || isSecretary
  const isOfficial = isKagawad || isTanod

  // ── Permission check ───────────────────────────────────────────────────────
  const hasPermission = (perm: Permission): boolean => checkPermission(roleId, perm)

  /** Tanod is view-only — cannot create or modify records */
  const canEdit = !isTanod && !!currentUser

  // ── Display helpers ────────────────────────────────────────────────────────
  const getUserRole = () => {
    if (!currentUser) return null
    return (currentUser as any).roles?.role_name || 'Unknown'
  }

  const getUserBarangay = () => {
    return 'Brgy. 46 Zone 6'
  }

  const getRoleBadge = () => {
    if (!roleId) return null
    return ROLE_META[roleId as RoleId]?.badge ?? null
  }

  const getRoleColor = (): 'pink' | 'teal' | 'slate' | null => {
    if (!roleId) return null
    const color = ROLE_META[roleId as RoleId]?.color
    if (color === 'pink' || color === 'teal' || color === 'slate') return color
    return null
  }

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        login,
        logout,
        isCaptain,
        isSecretary,
        isKagawad,
        isTanod,
        isAdmin,
        isOfficial,
        hasPermission,
        canEdit,
        getUserRole,
        getUserBarangay,
        getRoleBadge,
        getRoleColor,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an <AuthProvider>')
  }
  return context
}

export default AuthContext
