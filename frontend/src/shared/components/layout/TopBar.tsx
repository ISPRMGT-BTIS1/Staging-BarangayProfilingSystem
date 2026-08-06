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
    <header className="h-16 border-b-2 border-[#D86B98] bg-white flex items-center justify-between px-6 sticky top-0 z-40 shadow-2xs">
      {/* App Name / Branding */}
      <div className="flex items-center space-x-3">
        <span className="text-xl font-bold tracking-tight font-serif flex items-center space-x-2 text-[#D86B98]">
          <svg className="h-5 w-5 stroke-current fill-none text-[#D86B98]" viewBox="0 0 24 24" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 18h16" /><path d="M4 10h16" />
            <path d="M5 10v8" /><path d="M12 10v8" /><path d="M19 10v8" />
            <path d="M3 6h18" /><path d="m12 2-9 4h18Z" />
          </svg>
          <span>Brgy. 46 Zone 6</span>
        </span>
        <span className="hidden sm:inline-block text-xs uppercase px-2 py-0.5 border border-[#F4C2D7] bg-[#FDF0F5] font-mono rounded text-[#D86B98] tracking-wider">
          Pasay City
        </span>
      </div>

      {/* Search Input */}
      <div className="flex-1 max-w-md mx-8 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-4 w-4 text-[#D86B98]/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          defaultValue={currentQuery}
          placeholder="Search resident name, address, or ID..."
          className="w-full pl-9 pr-4 py-2 bg-[#FDF0F5] border border-[#F4C2D7] rounded-lg text-sm focus:outline-none focus:border-[#D86B98] focus:bg-white text-[#2D3748] font-sans placeholder-[#D86B98]/50 transition-colors"
          onChange={handleSearch}
        />
      </div>

      {/* Right side: user info + Pasay logo */}
      <div className="flex items-center space-x-4">
        {currentUser && (
          <div className="hidden md:flex flex-col text-right">
            <span className="text-xs font-bold text-[#D86B98]">{currentUser.fullName}</span>
            <span className="text-[9px] text-[#386A45] font-mono font-bold uppercase tracking-wider bg-[#386A45]/10 border border-[#386A45]/20 px-1.5 py-0.5 rounded-sm">
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
