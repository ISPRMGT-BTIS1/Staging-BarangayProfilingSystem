import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/shared/hooks/useAuth'

// ─── Nav Config ───────────────────────────────────────────────────────────────

interface NavItem {
  path: string
  label: string
  adminOnly?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { path: '/dashboard',    label: 'Dashboard' },
  { path: '/residents',    label: 'Residents' },
  { path: '/households',   label: 'Households' },
  { path: '/barangays',    label: 'Barangays' },
  { path: '/certificates', label: 'Certificates' },
  { path: '/reports',      label: 'Reports' },
  { path: '/users',        label: 'Users',   adminOnly: true },
  { path: '/roles',        label: 'Roles',   adminOnly: true },
  { path: '/settings',     label: 'Settings' },
]

// ─── Icons ────────────────────────────────────────────────────────────────────

function NavIcon({ id, active }: { id: string; active: boolean }) {
  const stroke = active ? 'text-[#16324A]' : 'text-slate-300 group-hover:text-white'
  const cls = `h-4 w-4 fill-none stroke-current ${stroke}`

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
    case '/barangays':
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

// ─── Component ────────────────────────────────────────────────────────────────

export function Sidebar() {
  const { currentUser, logout, isAdmin, getUserRole } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const visibleItems = NAV_ITEMS.filter((item) => !item.adminOnly || isAdmin)

  const getInitials = (name?: string) => {
    if (!name) return 'U'
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
  }

  return (
    <aside className="w-64 bg-[#16324A] text-white flex flex-col justify-between border-r border-[#16324A] select-none h-[calc(100vh-4rem)] sticky top-16 z-30">
      <nav className="flex-1 py-6 px-4 space-y-1">
        {visibleItems.map((item) => {
          const isActive = location.pathname === item.path ||
            (item.path !== '/dashboard' && location.pathname.startsWith(item.path))
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center space-x-3 px-4 py-3 group text-sm font-medium tracking-wide uppercase text-left rounded-xs transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#F2F4F1] text-[#16324A] font-semibold border-l-4 border-[#C8932B]'
                  : 'text-slate-300 hover:text-white hover:bg-[#1f4260]'
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

      <div className="border-t border-[#1f4260] p-4 bg-[#0f2436] space-y-3">
        <div className="flex items-center space-x-3 bg-[#16324A]/50 p-2.5 rounded-sm border border-[#1f4260]/60">
          <div className="h-8 w-8 rounded-full bg-[#C8932B] flex items-center justify-center font-bold text-white text-xs shadow-inner">
            {getInitials(currentUser?.fullName)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate font-sans">
              {currentUser?.fullName ?? 'Guest User'}
            </p>
            <p className="text-[10px] text-slate-300 uppercase tracking-wider font-mono truncate">
              {getUserRole() ?? 'Guest'}
            </p>
          </div>
        </div>

        <button
          onClick={logout}
          className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-xs font-medium uppercase tracking-wider text-slate-300 hover:text-red-300 hover:bg-red-950/20 border border-[#1f4260] rounded-xs cursor-pointer transition-all"
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
