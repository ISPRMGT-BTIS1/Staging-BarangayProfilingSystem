import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/shared/hooks/useAuth'
import pasayLogo from '@/assets/pasay_logo.png'

/**
 * Persistent application top bar.
 * Branding: Barangay 46 Zone 6, Pasay City
 */
export function TopBar() {
  const { currentUser, getUserBarangay } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const searchParams = new URLSearchParams(location.search)
  const currentQuery = searchParams.get('q') || ''

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value
    if (q.trim()) {
      navigate(`/residents?q=${encodeURIComponent(q)}`)
    } else if (location.pathname.startsWith('/residents')) {
      navigate('/residents')
    }
  }

  const isResidentsActive = location.pathname.startsWith('/residents')

  return (
    <header className="h-16 bg-[#FFF8F8] flex items-center justify-between px-6 sticky top-0 z-40">
      {/* App Name / Branding */}
      <div className="flex items-center space-x-3">
        <span className="text-xl font-bold tracking-tight font-serif flex items-center space-x-2 text-[#322A2C]">
          <svg className="h-5 w-5 stroke-current fill-none text-[#322A2C]" viewBox="0 0 24 24" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 18h16" /><path d="M4 10h16" />
            <path d="M5 10v8" /><path d="M12 10v8" /><path d="M19 10v8" />
            <path d="M3 6h18" /><path d="m12 2-9 4h18Z" />
          </svg>
          <span>BRGY. System</span>
        </span>
        <span className="hidden sm:inline-block text-[10px] font-mono tracking-widest uppercase text-[#D86B98] pt-1">
          INTERNAL CONSOLE
        </span>
      </div>

      {/* Search Input */}
      <div className="flex-1 max-w-md mx-8 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-4 w-4 text-[#D86B98]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          defaultValue={currentQuery}
          placeholder="Search resident name, address, or ID..."
          className="w-full pl-9 pr-4 py-2 bg-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D86B98] text-[#322A2C] font-sans placeholder-[#322A2C]/40 transition-colors shadow-sm"
          onChange={handleSearch}
        />
      </div>

      {/* Right side: user info + Pasay logo */}
      <div className="flex items-center space-x-4">
        {currentUser && (
          <div className="hidden md:flex flex-col text-right">
            <span className="text-xs font-bold text-[#322A2C]">{currentUser.fullName}</span>
            <span className="text-[9px] text-[#D86B98] font-mono font-bold uppercase tracking-wider bg-transparent px-0 py-0.5 rounded-sm">
              {getUserBarangay()}
            </span>
          </div>
        )}

        {/* Pasay City Logo */}
        <img
          src={pasayLogo}
          alt="Lungsod Pasay – Kalakhang Maynila"
          className="h-10 w-10 rounded-full object-cover shadow-sm flex-shrink-0"
          title="Lungsod Pasay – Kalakhang Maynila"
        />
      </div>
    </header>
  )
}
