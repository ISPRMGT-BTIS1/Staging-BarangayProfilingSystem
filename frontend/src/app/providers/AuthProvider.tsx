import React, { createContext, useContext, useState } from 'react'
import { users, roles, barangays } from '@/mocks'

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

  const login = (username: string, password: string) => {
    const user = (users as User[]).find(
      (u) => u.username === username && u.passwordHash === password && u.isActive,
    )
    if (user) {
      setCurrentUser(user)
      return { success: true }
    }
    return { success: false, error: 'Invalid username or password.' }
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
