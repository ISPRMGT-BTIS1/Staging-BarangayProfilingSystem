import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/shared/hooks/useAuth'
import { AppShell } from '@/shared/components/layout/AppShell'

// ─── Lazy-loaded feature pages ────────────────────────────────────────────────
// Using React.lazy ensures each feature is a separate code-split chunk.
// Add new feature pages here as they are implemented.

const LoginPage          = React.lazy(() => import('@/features/auth/pages/LoginPage'))
const DashboardPage      = React.lazy(() => import('@/features/dashboard/pages/DashboardPage'))
const ResidentsPage      = React.lazy(() => import('@/features/residents/pages/ResidentsPage'))
const ResidentDetailPage = React.lazy(() => import('@/features/residents/pages/ResidentDetailPage'))
const HouseholdsPage     = React.lazy(() => import('@/features/households/pages/HouseholdsPage'))
const BarangaysPage      = React.lazy(() => import('@/features/barangays/pages/BarangaysPage'))
const CertificatesPage   = React.lazy(() => import('@/features/certificates/pages/CertificatesPage'))
const ReportsPage        = React.lazy(() => import('@/features/reports/pages/ReportsPage'))
const UsersPage          = React.lazy(() => import('@/features/users/pages/UsersPage'))
const RolesPage          = React.lazy(() => import('@/features/roles/pages/RolesPage'))
const SettingsPage       = React.lazy(() => import('@/features/settings/pages/SettingsPage'))

// ─── Route Guards ─────────────────────────────────────────────────────────────

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAuth()
  if (!currentUser) return <Navigate to="/login" replace />
  return <>{children}</>
}

function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { currentUser, isAdmin } = useAuth()
  if (!currentUser) return <Navigate to="/login" replace />
  if (!isAdmin) return <Navigate to="/dashboard" replace />
  return <>{children}</>
}

function GuestOnly({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAuth()
  if (currentUser) return <Navigate to="/dashboard" replace />
  return <>{children}</>
}

// ─── Router ───────────────────────────────────────────────────────────────────

export function AppRouter() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-[#F2F4F1] flex items-center justify-center">
          <span className="text-sm text-slate-400 font-mono animate-pulse">Loading…</span>
        </div>
      }
    >
      <Routes>
        {/* Public */}
        <Route
          path="/login"
          element={
            <GuestOnly>
              <LoginPage />
            </GuestOnly>
          }
        />

        {/* Protected — inside AppShell (Sidebar + TopBar) */}
        <Route
          element={
            <RequireAuth>
              <AppShell />
            </RequireAuth>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard"    element={<DashboardPage />} />
          <Route path="/residents"    element={<ResidentsPage />} />
          <Route path="/residents/:id" element={<ResidentDetailPage />} />
          <Route path="/households"   element={<HouseholdsPage />} />
          <Route path="/barangays"    element={<BarangaysPage />} />
          <Route path="/certificates" element={<CertificatesPage />} />
          <Route path="/reports"      element={<ReportsPage />} />
          <Route path="/settings"     element={<SettingsPage />} />

          {/* Admin-only */}
          <Route
            path="/users"
            element={
              <RequireAdmin>
                <UsersPage />
              </RequireAdmin>
            }
          />
          <Route
            path="/roles"
            element={
              <RequireAdmin>
                <RolesPage />
              </RequireAdmin>
            }
          />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </React.Suspense>
  )
}
