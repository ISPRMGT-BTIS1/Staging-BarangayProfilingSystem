import React, { createContext, useContext, useState } from 'react'
import { roles, barangays } from '@/mocks'
import { supabase } from '@/services/supabaseService'

// ─── Types ────────────────────────────────────────────────────────────────────

interface User {
  userId: string
  username: string
  passwordHash: string
  fullName: string
  roleId: number
  barangayId: number
  isActive: boolean
}

interface AuthContextValue {
  currentUser: User | null
  login: (username: string, password: string) => { success: boolean; error?: string }
  logout: () => void
  isAdmin: boolean
  isOfficial: boolean
  getUserRole: () => string | null
  getUserBarangay: () => string | null
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
          roleId: u.role_id,
          barangayId: u.barangay_id
        } as unknown as User)
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

  const isAdmin = currentUser?.roleId === 1
  const isOfficial = currentUser?.roleId === 2

  const getUserRole = () => {
    if (!currentUser) return null
    const role = (roles as Array<{ roleId: number; roleName: string }>).find(
      (r) => r.roleId === currentUser.roleId,
    )
    return role?.roleName ?? 'Unknown'
  }

  const getUserBarangay = () => {
    if (!currentUser) return null
    const brgy = (barangays as Array<{ id: number; name: string }>).find(
      (b) => b.id === currentUser.barangayId,
    )
    return brgy?.name ?? 'Unknown'
  }

  return (
    <AuthContext.Provider
      value={{ currentUser, login, logout, isAdmin, isOfficial, getUserRole, getUserBarangay }}
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
