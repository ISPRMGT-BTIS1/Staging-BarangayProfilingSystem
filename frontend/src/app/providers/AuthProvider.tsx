import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react'
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

// ─── Constants ────────────────────────────────────────────────────────────────

const SESSION_KEY = 'brgy_session_user'
/** How long before showing the "Still there?" prompt (ms) */
const INACTIVITY_LIMIT_MS = 10 * 60 * 1000   // 10 minutes
/** How long the prompt stays before auto-logout (ms) */
const PROMPT_COUNTDOWN_S  = 60                 // 60 seconds

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null)

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // ── Restore session on first mount ────────────────────────────────────────
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const stored = sessionStorage.getItem(SESSION_KEY)
      return stored ? (JSON.parse(stored) as User) : null
    } catch {
      return null
    }
  })

  // ── Inactivity timer state ────────────────────────────────────────────────
  const [showInactivePrompt, setShowInactivePrompt] = useState(false)
  const [countdown, setCountdown]                   = useState(PROMPT_COUNTDOWN_S)

  const inactivityTimer  = useRef<ReturnType<typeof setTimeout> | null>(null)
  const countdownInterval = useRef<ReturnType<typeof setInterval> | null>(null)

  // ── Persist user to sessionStorage whenever it changes ───────────────────
  useEffect(() => {
    if (currentUser) {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(currentUser))
    } else {
      sessionStorage.removeItem(SESSION_KEY)
    }
  }, [currentUser])

  // ── Reset the inactivity timer ────────────────────────────────────────────
  const resetInactivityTimer = useCallback(() => {
    if (!currentUser) return

    // Dismiss prompt if it was showing
    setShowInactivePrompt(false)
    setCountdown(PROMPT_COUNTDOWN_S)
    if (countdownInterval.current) {
      clearInterval(countdownInterval.current)
      countdownInterval.current = null
    }

    // Restart the inactivity timeout
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current)
    inactivityTimer.current = setTimeout(() => {
      setShowInactivePrompt(true)
      setCountdown(PROMPT_COUNTDOWN_S)

      // Start countdown to auto-logout
      countdownInterval.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownInterval.current!)
            countdownInterval.current = null
            handleAutoLogout()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }, INACTIVITY_LIMIT_MS)
  }, [currentUser]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleAutoLogout = () => {
    setCurrentUser(null)
    setShowInactivePrompt(false)
    sessionStorage.removeItem(SESSION_KEY)
  }

  // ── Bind user-activity listeners ─────────────────────────────────────────
  useEffect(() => {
    if (!currentUser) {
      // Clear timers when logged out
      if (inactivityTimer.current)   clearTimeout(inactivityTimer.current)
      if (countdownInterval.current) clearInterval(countdownInterval.current)
      setShowInactivePrompt(false)
      return
    }

    const EVENTS = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click']
    const handler = () => resetInactivityTimer()

    EVENTS.forEach((ev) => window.addEventListener(ev, handler, { passive: true }))
    resetInactivityTimer() // kick off on login / mount

    return () => {
      EVENTS.forEach((ev) => window.removeEventListener(ev, handler))
      if (inactivityTimer.current)   clearTimeout(inactivityTimer.current)
      if (countdownInterval.current) clearInterval(countdownInterval.current)
    }
  }, [currentUser, resetInactivityTimer])

  // ── Auth actions ──────────────────────────────────────────────────────────
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
    if (inactivityTimer.current)   clearTimeout(inactivityTimer.current)
    if (countdownInterval.current) clearInterval(countdownInterval.current)
    setCurrentUser(null)
    setShowInactivePrompt(false)
    sessionStorage.removeItem(SESSION_KEY)
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

      {/* ── Inactivity Prompt ───────────────────────────────────────────── */}
      {showInactivePrompt && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl border border-[#F4C2D7] max-w-sm w-full mx-4 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#D86B98] to-[#C45480] px-6 py-5 text-white">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <svg className="h-5 w-5 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 8v4m0 4h.01" />
                  </svg>
                </div>
                <div>
                  <p className="font-bold text-base font-serif">Still there?</p>
                  <p className="text-white/80 text-xs mt-0.5">You've been inactive for 10 minutes</p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="px-6 py-5">
              <p className="text-sm text-slate-600 leading-relaxed">
                For security, you'll be automatically logged out in{' '}
                <span className="font-bold text-[#D86B98] tabular-nums text-base">{countdown}s</span>{' '}
                if there's no activity.
              </p>

              {/* Countdown bar */}
              <div className="mt-4 h-1.5 rounded-full bg-[#FDF0F5] overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#D86B98] to-[#C45480] transition-all duration-1000"
                  style={{ width: `${(countdown / PROMPT_COUNTDOWN_S) * 100}%` }}
                />
              </div>

              {/* Actions */}
              <div className="mt-5 flex gap-3">
                <button
                  onClick={resetInactivityTimer}
                  className="flex-1 bg-[#D86B98] hover:bg-[#C45480] text-white text-sm font-bold py-2.5 rounded-xl transition-all cursor-pointer"
                >
                  Yes, I'm here
                </button>
                <button
                  onClick={logout}
                  className="flex-1 border border-slate-200 text-slate-500 hover:bg-slate-50 text-sm font-semibold py-2.5 rounded-xl transition-all cursor-pointer"
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
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


