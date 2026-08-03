import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/shared/hooks/useAuth'
import { PERM, ROLE_META, type RoleId } from '@/shared/lib/permissions'

// ─── Nav Config ───────────────────────────────────────────────────────────────

interface NavItem {
  path: string
  label: string
  permission: string  // must match a PERM value
}

const NAV_ITEMS: NavItem[] = [
  { path: '/dashboard',    label: 'Dashboard',    permission: PERM.VIEW_DASHBOARD },
  { path: '/residents',    label: 'Residents',    permission: PERM.VIEW_RESIDENTS },
  { path: '/households',   label: 'Households',   permission: PERM.VIEW_HOUSEHOLDS },
  { path: '/events',       label: 'Events',       permission: PERM.VIEW_EVENTS },
  { path: '/streets',      label: 'Streets',      permission: PERM.VIEW_BARANGAYS },
  { path: '/certificates', label: 'Certificates', permission: PERM.VIEW_CERTIFICATES },
  { path: '/reports',      label: 'Reports',      permission: PERM.VIEW_REPORTS },
  { path: '/users',        label: 'Users',        permission: PERM.VIEW_USERS },
  { path: '/roles',        label: 'Roles',        permission: PERM.VIEW_ROLES },
  { path: '/settings',     label: 'Settings',     permission: PERM.VIEW_SETTINGS },
]

// ─── Icons ────────────────────────────────────────────────────────────────────

function NavIcon({ id, active }: { id: string; active: boolean }) {
  const stroke = active ? 'text-[#8A244E]' : 'text-white/60 group-hover:text-white'
  const cls = `h-5 w-5 fill-none stroke-current ${stroke}`

  switch (id) {
    case '/dashboard':
      return (
        <svg className={cls} viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="9" /><rect x="14" y="3" width="7" height="5" />
          <rect x="14" y="12" width="7" height="9" /><rect x="3" y="16" width="7" height="5" />
        </svg>
      )
    case '/residents':
      return (
        <svg className={cls} viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      )
    case '/households':
      return (
        <svg className={cls} viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      )
    case '/events':
      return (
        <svg className={cls} viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      )
    case '/streets':
      return (
        <svg className={cls} viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 7l6-3 6 3 6-3v13l-6 3-6-3-6 3V7z" />
          <path d="M9 4v13" /><path d="M15 7v13" />
        </svg>
      )
    case '/certificates':
      return (
        <svg className={cls} viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
          <rect x="9" y="3" width="6" height="4" rx="2" />
          <path d="M9 12h6" /><path d="M9 16h4" />
        </svg>
      )
    case '/reports':
      return (
        <svg className={cls} viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
          <path d="M14 2v4a2 2 0 0 0 2 2h4" />
          <path d="M10 9H8" /><path d="M16 13H8" /><path d="M16 17H8" />
        </svg>
      )
    case '/users':
      return (
        <svg className={cls} viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      )
    case '/roles':
      return (
        <svg className={cls} viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M19 8l2 2-4 4" /><path d="M21 8l-2 2" />
        </svg>
      )
    case '/settings':
      return (
        <svg className={cls} viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      )
    default:
      return null
  }
}

// ─── Role Badge ───────────────────────────────────────────────────────────────

function RoleBadge({ roleId }: { roleId: number | undefined }) {
  if (!roleId) return null
  const meta = ROLE_META[roleId as RoleId]
  if (!meta) return null

  const colorClasses =
    meta.color === 'pink'
      ? 'bg-white/20 text-white border-white/30'
      : meta.color === 'teal'
      ? 'bg-teal-500/20 text-teal-100 border-teal-300/30'
      : 'bg-white/10 text-white/60 border-white/20'

  return (
    <span className={`text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded border font-mono ${colorClasses}`}>
      {meta.badge}
    </span>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Sidebar() {
  const { currentUser, logout, hasPermission, getUserRole, getRoleBadge } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Filter nav items to only those the current user has permission to see
  const visibleItems = NAV_ITEMS.filter((item) =>
    hasPermission(item.permission as any)
  )

  const getInitials = (name?: string) => {
    if (!name) return 'U'
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
  }

  return (
    <aside className="w-64 bg-[#8A244E] text-white flex flex-col justify-between border-r border-[#6A1838] select-none h-[calc(100vh-4rem)] sticky top-16 z-30">
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {visibleItems.map((item) => {
          const isActive =
            location.pathname === item.path ||
            (item.path !== '/dashboard' && location.pathname.startsWith(item.path))
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center space-x-3 px-4 py-3 group text-sm font-semibold tracking-wide uppercase text-left rounded-xl transition-all cursor-pointer ${
                isActive
                  ? 'bg-white text-[#8A244E] shadow-sm'
                  : 'text-white/80 hover:text-white hover:bg-white/15'
              }`}
            >
              <span className="flex-shrink-0">
                <NavIcon id={item.path} active={isActive} />
              </span>
              <span>{item.label}</span>
            </button>
          )
        })}
      </nav>

      {/* Footer — user profile + sign out */}
      <div className="border-t border-[#6A1838]/60 p-4 bg-[#6A1838]/30 space-y-3">
        <div className="flex items-center space-x-3 bg-white/10 p-2.5 rounded-xl border border-white/20">
          <div className="h-9 w-9 rounded-full bg-[#2D5F2E] flex items-center justify-center font-bold text-white text-sm shadow-inner flex-shrink-0">
            {getInitials(currentUser?.fullName)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate font-sans">
              {currentUser?.fullName ?? 'Guest User'}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <RoleBadge roleId={currentUser?.roleId} />
            </div>
          </div>
        </div>

        <button
          onClick={logout}
          className="w-full flex items-center justify-center space-x-2 px-3 py-2.5 text-sm font-semibold uppercase tracking-wider text-white hover:text-red-200 hover:bg-red-900/30 border border-white/20 rounded-xl cursor-pointer transition-all"
        >
          <svg className="h-4 w-4 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  )
}
