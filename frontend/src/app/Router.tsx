import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/shared/hooks/useAuth'
import { AppShell } from '@/shared/components/layout/AppShell'
import { PERM, type Permission } from '@/shared/lib/permissions'

// ─── Lazy-loaded feature pages ────────────────────────────────────────────────

const LoginPage          = React.lazy(() => import('@/features/auth/pages/LoginPage'))
const DashboardPage      = React.lazy(() => import('@/features/dashboard/pages/DashboardPage'))
const ResidentsPage      = React.lazy(() => import('@/features/residents/pages/ResidentsPage'))
const ResidentDetailPage = React.lazy(() => import('@/features/residents/pages/ResidentDetailPage'))
const HouseholdsPage     = React.lazy(() => import('@/features/households/pages/HouseholdsPage'))
const EventsPage         = React.lazy(() => import('@/components/EventsView'))
const StreetsPage        = React.lazy(() => import('@/features/barangays/pages/BarangaysPage'))
const CertificatesPage   = React.lazy(() => import('@/features/certificates/pages/CertificatesPage'))
const ReportsPage        = React.lazy(() => import('@/features/reports/pages/ReportsPage'))
const UsersPage          = React.lazy(() => import('@/features/users/pages/UsersPage'))
const RolesPage          = React.lazy(() => import('@/features/roles/pages/RolesPage'))
const SettingsPage       = React.lazy(() => import('@/features/settings/pages/SettingsPage'))

// ─── Route Guards ─────────────────────────────────────────────────────────────

/** Redirect unauthenticated users to /login */
function RequireAuth({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAuth()
  if (!currentUser) return <Navigate to="/login" replace />
  return <>{children}</>
}

/** Only allow users with a specific permission; others go to /dashboard */
function RequirePermission({
  permission,
  children,
}: {
  permission: Permission
  children: React.ReactNode
}) {
  const { currentUser, hasPermission } = useAuth()
  if (!currentUser) return <Navigate to="/login" replace />
  if (!hasPermission(permission)) return <Navigate to="/dashboard" replace />
  return <>{children}</>
}

/** Keep legacy RequireAdmin name — full access roles only (Captain + Secretary) */
function RequireAdmin({ children }: { children: React.ReactNode }) {
  return (
    <RequirePermission permission={PERM.VIEW_USERS}>
      {children}
    </RequirePermission>
  )
}

/** Redirect already-authenticated users away from login */
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
        <div className="min-h-screen bg-[#F7EEF2] flex items-center justify-center">
          <span className="text-sm text-[#8A244E] font-mono animate-pulse">Loading…</span>
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

          {/* All roles */}
          <Route path="/dashboard" element={<DashboardPage />} />

          {/* Residents — all roles can view; Tanod gets read-only via canEdit */}
          <Route
            path="/residents"
            element={
              <RequirePermission permission={PERM.VIEW_RESIDENTS}>
                <ResidentsPage />
              </RequirePermission>
            }
          />
          <Route
            path="/residents/:id"
            element={
              <RequirePermission permission={PERM.VIEW_RESIDENTS}>
                <ResidentDetailPage />
              </RequirePermission>
            }
          />

          {/* Households — Captain, Secretary, Kagawad only */}
          <Route
            path="/households"
            element={
              <RequirePermission permission={PERM.VIEW_HOUSEHOLDS}>
                <HouseholdsPage />
              </RequirePermission>
            }
          />

          {/* Events — all roles can view */}
          <Route
            path="/events"
            element={
              <RequirePermission permission={PERM.VIEW_EVENTS}>
                <EventsPage />
              </RequirePermission>
            }
          />

          {/* Streets — Captain, Secretary, Kagawad */}
          <Route
            path="/streets"
            element={
              <RequirePermission permission={PERM.VIEW_BARANGAYS}>
                <StreetsPage />
              </RequirePermission>
            }
          />
          {/* Redirect old /barangays links to /streets */}
          <Route path="/barangays" element={<Navigate to="/streets" replace />} />

          {/* Certificates — Captain, Secretary, Kagawad */}
          <Route
            path="/certificates"
            element={
              <RequirePermission permission={PERM.VIEW_CERTIFICATES}>
                <CertificatesPage />
              </RequirePermission>
            }
          />

          {/* Reports — Captain, Secretary, Kagawad */}
          <Route
            path="/reports"
            element={
              <RequirePermission permission={PERM.VIEW_REPORTS}>
                <ReportsPage />
              </RequirePermission>
            }
          />

          {/* Settings — Captain, Secretary only */}
          <Route
            path="/settings"
            element={
              <RequirePermission permission={PERM.VIEW_SETTINGS}>
                <SettingsPage />
              </RequirePermission>
            }
          />

          {/* Admin-only — Captain + Secretary */}
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
