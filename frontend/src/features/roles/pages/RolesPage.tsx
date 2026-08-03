import { ROLE, ROLE_META, ROLE_PERMISSIONS, PERM, type RoleId, type Permission } from '@/shared/lib/permissions'

// ─── Permission display labels ────────────────────────────────────────────────

const PERM_LABELS: { perm: Permission; label: string; group: string }[] = [
  // Dashboard
  { perm: PERM.VIEW_DASHBOARD,    label: 'View Dashboard',       group: 'Dashboard' },
  // Residents
  { perm: PERM.VIEW_RESIDENTS,    label: 'View Residents',        group: 'Residents' },
  { perm: PERM.EDIT_RESIDENTS,    label: 'Add / Edit Residents',  group: 'Residents' },
  // Households
  { perm: PERM.VIEW_HOUSEHOLDS,   label: 'View Households',       group: 'Households' },
  { perm: PERM.EDIT_HOUSEHOLDS,   label: 'Add / Edit Households', group: 'Households' },
  // Events
  { perm: PERM.VIEW_EVENTS,       label: 'View Events',           group: 'Events' },
  { perm: PERM.MANAGE_EVENTS,     label: 'Manage Events',         group: 'Events' },
  // Barangays
  { perm: PERM.VIEW_BARANGAYS,    label: 'View Barangays',        group: 'Barangays' },
  // Certificates
  { perm: PERM.VIEW_CERTIFICATES, label: 'View Certificates',     group: 'Certificates' },
  { perm: PERM.ISSUE_CERTIFICATES, label: 'Issue Certificates',  group: 'Certificates' },
  // Reports
  { perm: PERM.VIEW_REPORTS,      label: 'View Reports',          group: 'Reports' },
  // Admin
  { perm: PERM.VIEW_USERS,        label: 'View Users',            group: 'Administration' },
  { perm: PERM.MANAGE_USERS,      label: 'Manage Users',          group: 'Administration' },
  { perm: PERM.VIEW_ROLES,        label: 'View Roles',            group: 'Administration' },
  { perm: PERM.VIEW_SETTINGS,     label: 'System Settings',       group: 'Administration' },
]

const ORDERED_ROLES: RoleId[] = [ROLE.CAPTAIN, ROLE.SECRETARY, ROLE.KAGAWAD, ROLE.TANOD]

// ─── Sub-components ───────────────────────────────────────────────────────────

function GrantIcon({ granted }: { granted: boolean }) {
  if (granted) {
    return (
      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#2D5F2E]/15 text-[#2D5F2E]">
        <svg className="h-4 w-4 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </span>
    )
  }
  return (
    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-100 text-slate-300">
      <svg className="h-4 w-4 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    </span>
  )
}

function RoleCard({ roleId }: { roleId: RoleId }) {
  const meta = ROLE_META[roleId]
  const perms = ROLE_PERMISSIONS[roleId]

  const bgClass  = meta.color === 'pink'  ? 'bg-[#E8198A]'       : meta.color === 'teal' ? 'bg-teal-600'   : 'bg-slate-600'
  const tagClass = meta.color === 'pink'  ? 'bg-white/20 text-white' : meta.color === 'teal' ? 'bg-white/20 text-white' : 'bg-white/20 text-white'

  return (
    <div className={`rounded-2xl overflow-hidden shadow-lg ${bgClass}`}>
      {/* Card Header */}
      <div className="px-5 py-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-lg font-bold text-white font-serif leading-tight">{meta.name}</h3>
            <p className="text-white/70 text-xs mt-0.5 leading-relaxed">{meta.tagline}</p>
          </div>
          <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-lg whitespace-nowrap flex-shrink-0 font-mono ${tagClass}`}>
            {meta.accessLevel === 'full' ? 'Full Access' : 'Partial'}
          </span>
        </div>
        <div className="mt-3 text-white/60 text-xs font-mono">
          {perms.length} permissions granted
        </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function RolesPage() {
  // Group permissions by group label
  const groups = Array.from(new Set(PERM_LABELS.map(p => p.group)))

  return (
    <div className="flex-1 p-6 overflow-y-auto space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold font-serif text-[#E8198A]">Roles &amp; Permissions</h1>
        <p className="text-sm text-slate-500 font-sans mt-1">
          Barangay staff roles and their system access privileges
        </p>
      </div>

      {/* Role Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {ORDERED_ROLES.map(roleId => (
          <RoleCard key={roleId} roleId={roleId} />
        ))}
      </div>

      {/* Permissions Matrix */}
      <section>
        <h2 className="text-lg font-bold font-serif text-[#E8198A] mb-4">Permissions Matrix</h2>
        <div className="bg-white rounded-2xl shadow overflow-hidden border border-[#F8BBD9]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[640px]">
              <thead>
                <tr className="bg-[#FCE4EC] border-b-2 border-[#F8BBD9]">
                  <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-[#E8198A] w-56">
                    Permission
                  </th>
                  {ORDERED_ROLES.map(roleId => {
                    const meta = ROLE_META[roleId]
                    const bgDot = meta.color === 'pink' ? 'bg-[#E8198A]' : meta.color === 'teal' ? 'bg-teal-500' : 'bg-slate-400'
                    return (
                      <th key={roleId} className="px-4 py-3 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className={`w-2 h-2 rounded-full ${bgDot}`} />
                          <span className="text-xs font-bold text-[#1A1A2E] uppercase tracking-wide whitespace-nowrap">
                            {meta.name.replace('Brgy. ', '')}
                          </span>
                        </div>
                      </th>
                    )
                  })}
                </tr>
              </thead>
              <tbody>
                {groups.map((group, gi) => {
                  const groupPerms = PERM_LABELS.filter(p => p.group === group)
                  return groupPerms.map((item, i) => {
                    const isFirstInGroup = i === 0
                    return (
                      <tr
                        key={item.perm}
                        className={`border-b border-[#F8BBD9]/60 ${
                          gi % 2 === 0 ? 'bg-white' : 'bg-[#FFF0F7]'
                        } hover:bg-[#FCE4EC]/50 transition-colors`}
                      >
                        <td className="px-5 py-2.5">
                          {isFirstInGroup && (
                            <div className="text-[10px] font-bold uppercase tracking-widest text-[#E8198A]/60 mb-0.5">
                              {group}
                            </div>
                          )}
                          <span className="text-sm text-[#1A1A2E] font-medium">{item.label}</span>
                        </td>
                        {ORDERED_ROLES.map(roleId => {
                          const granted = ROLE_PERMISSIONS[roleId].includes(item.perm)
                          return (
                            <td key={roleId} className="px-4 py-2.5 text-center">
                              <GrantIcon granted={granted} />
                            </td>
                          )
                        })}
                      </tr>
                    )
                  })
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Legend */}
      <div className="flex items-center gap-6 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#2D5F2E]/15 text-[#2D5F2E]">
            <svg className="h-3.5 w-3.5 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
          </span>
          Permission granted
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-300">
            <svg className="h-3.5 w-3.5 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </span>
          Access denied
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#E8198A]" /> Captain / Secretary — Full Access
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-teal-500" /> Kagawad — Partial Access
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-slate-400" /> Tanod — View Only
        </div>
      </div>
    </div>
  )
}
