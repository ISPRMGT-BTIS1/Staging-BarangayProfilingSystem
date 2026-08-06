import { useState, useEffect } from 'react'
import { supabase } from '../../../utils/supabaseClient'
import { CertificateList } from '../components/CertificateList'

const TYPE_LABELS: Record<string, string> = {
  BARANGAY_CLEARANCE: 'Barangay Clearance',
  OATH_OF_UNDERTAKING: 'Oath of Undertaking',
  APPLICATION_BARANGAY_CLEARANCE: 'Application for Barangay Clearance',
  CERTIFICATION_SLIP: 'Certification Slip',
  CERTIFICATION_OF_INDIGENCY: 'Certification of Indigency',
  CERTIFICATION_FINANCIAL_ASSISTANCE: 'Certification for Financial Assistance',
  CERTIFICATION_FIRST_TIME_JOBSEEKER: 'Certification for First Time Jobseekers',
  CERTIFICATION_OF_GUARDIANSHIP: 'Certification of Guardianship',
  CERTIFICATION_GOOD_MORAL: 'Certification of Good Moral',
  CERTIFICATION_OF_ONENESS: 'Certificate of Oneness',
}

const TYPE_BADGE_COLORS: Record<string, string> = {
  BARANGAY_CLEARANCE: 'bg-blue-50 text-blue-700 border-blue-200',
  OATH_OF_UNDERTAKING: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  APPLICATION_BARANGAY_CLEARANCE: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  CERTIFICATION_SLIP: 'bg-slate-50 text-slate-700 border-slate-200',
  CERTIFICATION_OF_INDIGENCY: 'bg-amber-50 text-amber-700 border-amber-200',
  CERTIFICATION_FINANCIAL_ASSISTANCE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  CERTIFICATION_FIRST_TIME_JOBSEEKER: 'bg-violet-50 text-violet-700 border-violet-200',
  CERTIFICATION_OF_GUARDIANSHIP: 'bg-rose-50 text-rose-700 border-rose-200',
  CERTIFICATION_GOOD_MORAL: 'bg-teal-50 text-teal-700 border-teal-200',
  CERTIFICATION_OF_ONENESS: 'bg-pink-50 text-pink-700 border-pink-200',
}

interface CertRecord {
  id: number
  certificate_type: string
  resident_name: string | null
  resident_id: string | null
  purpose: string | null
  issued_by: string | null
  issued_at: string
  or_number: string | null
  control_number: string | null
  status: string
}

export default function CertificatesPage() {
  const [records, setRecords] = useState<CertRecord[]>([])
  const [userMap, setUserMap] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState('ALL')
  const [search, setSearch] = useState('')

  const fetchRecords = async () => {
    setLoading(true)

    // Fetch users table to map user IDs (e.g. 1, 9) to user names
    try {
      const { data: usersData } = await supabase
        .from('users')
        .select('user_id, full_name, username')

      if (usersData) {
        const map: Record<string, string> = {}
        usersData.forEach((u: any) => {
          const name = u.full_name || u.username || `User #${u.user_id}`
          map[String(u.user_id)] = name
        })
        setUserMap(map)
      }
    } catch (err) {
      console.warn('Could not load users map:', err)
    }

    const { data, error } = await supabase
      .from('certificate_requests')
      .select('*')
      .order('issued_at', { ascending: false })
      .limit(200)

    if (!error && data) {
      setRecords(data as CertRecord[])
    } else if (error) {
      console.warn('Could not load certificate_requests:', error.message)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchRecords()
  }, [])

  const formatIssuedBy = (issuedBy: string | null) => {
    if (!issuedBy) return null;
    if (userMap[issuedBy]) return userMap[issuedBy];
    const numId = Number(issuedBy);
    if (!isNaN(numId) && userMap[String(numId)]) {
      return userMap[String(numId)];
    }
    return issuedBy;
  }

  const filtered = records.filter(r => {
    const matchType = filterType === 'ALL' || r.certificate_type === filterType
    const q = search.toLowerCase()
    const issuedByText = formatIssuedBy(r.issued_by) || ''
    const matchSearch = !q
      || String(r.resident_name || '').toLowerCase().includes(q)
      || String(r.resident_id || '').toLowerCase().includes(q)
      || String(r.purpose || '').toLowerCase().includes(q)
      || String(r.control_number || '').toLowerCase().includes(q)
      || String(issuedByText || '').toLowerCase().includes(q)
    return matchType && matchSearch
  })

  const formatDate = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleString('en-PH', {
      year: 'numeric', month: 'short', day: '2-digit',
      hour: '2-digit', minute: '2-digit',
    })
  }

  return (
    <div className="flex-1 p-6 overflow-y-auto space-y-6 print:p-0 print:m-0 print:overflow-visible">
      {/* Background Page Content — hidden when printing certificates */}
      <div className="space-y-6 print:hidden">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold font-serif text-[#322A2C]">Certificates</h1>
        <p className="text-sm text-slate-500 font-sans mt-1">
          Request, fill, and print barangay certificate documents
        </p>
      </div>

      {/* Certificate Types Panel */}
      <div className="ledger-container p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-[#D1D7CE] pb-3">
          <h3 className="text-sm font-serif font-bold text-[#322A2C]">
            Available Certificate Types
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-[#2E5A44] bg-[rgba(46,90,68,0.06)] border border-[#2E5A44]/30 px-2 py-0.5 rounded-sm uppercase tracking-wider">
              7 Live
            </span>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider bg-[#FFF8F8] border border-[#D1D7CE] px-2 py-0.5 rounded-sm">
              2 Coming Soon
            </span>
          </div>
        </div>

        <CertificateList />
      </div>

      {/* Certificate Request Records */}
      <div className="ledger-container p-5 space-y-4">
        {/* Records Header */}
        <div className="flex items-center justify-between border-b border-[#D1D7CE] pb-3 flex-wrap gap-3">
          <div>
            <h3 className="text-sm font-serif font-bold text-[#322A2C] flex items-center gap-2">
               Certificate Issuance Records
              <span className="text-[10px] font-mono font-normal text-slate-400 bg-[#FFF8F8] border border-[#D1D7CE] px-2 py-0.5 rounded-sm">
                {filtered.length} record{filtered.length !== 1 ? 's' : ''}
              </span>
            </h3>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              Auto-logged whenever a certificate is printed
            </p>
          </div>
          <button
            onClick={fetchRecords}
            className="text-[10px] font-mono font-semibold uppercase tracking-wider border border-[#322A2C] text-[#322A2C] hover:bg-[#322A2C] hover:text-white px-3 py-1.5 rounded-xs transition-colors cursor-pointer"
          >
            ↻ Refresh
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex flex-col">
            <label className="text-[9px] font-mono font-bold uppercase text-slate-400 mb-1">Certificate Type</label>
            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              className="bg-[#FFF8F8] border border-[#D1D7CE] rounded-xs text-xs px-2.5 py-1.5 focus:outline-none focus:border-[#322A2C] text-[#322A2C] font-semibold cursor-pointer"
            >
              <option value="ALL">All Types</option>
              {Object.entries(TYPE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col">
            <label className="text-[9px] font-mono font-bold uppercase text-slate-400 mb-1">Search</label>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Name, ID, purpose, or control no…"
              className="border border-[#D1D7CE] bg-[#FFF8F8] focus:bg-white text-[#322A2C] rounded-xs text-xs px-3 py-1.5 focus:outline-none focus:border-[#322A2C] w-64"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-10 text-slate-400 font-serif italic text-sm">
              Loading records…
            </div>
          ) : (
            <table className="ledger-table w-full">
              <thead>
                <tr>
                  <th className="w-8">#</th>
                  <th>Certificate Type / Control No.</th>
                  <th>Resident</th>
                  <th>Purpose</th>
                  <th>Issued By</th>
                  <th>Date &amp; Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-slate-400 font-serif italic bg-white">
                      {records.length === 0
                        ? 'No records yet. Print a certificate to start logging.'
                        : 'No records match the current filter.'}
                    </td>
                  </tr>
                ) : filtered.map((rec, i) => (
                  <tr key={rec.id}>
                    <td className="font-mono text-xs text-slate-400">{i + 1}</td>
                    <td>
                      <span className={`inline-block text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 rounded-sm border ${TYPE_BADGE_COLORS[rec.certificate_type] || 'bg-slate-50 text-slate-700 border-slate-200'}`}>
                        {TYPE_LABELS[rec.certificate_type] || rec.certificate_type}
                      </span>
                      {rec.control_number && (
                        <div className="text-[9px] font-mono text-slate-500 mt-1">{rec.control_number}</div>
                      )}
                    </td>
                    <td>
                      <div className="font-semibold text-xs text-[#322A2C]">
                        {rec.resident_name || <span className="text-slate-400 italic">—</span>}
                      </div>
                      {rec.resident_id && (
                        <div className="text-[9px] font-mono text-slate-400 mt-0.5">{rec.resident_id}</div>
                      )}
                    </td>
                    <td className="text-xs text-slate-500 max-w-[180px]">
                      <span className="block truncate" title={rec.purpose || undefined}>
                        {rec.purpose || <span className="text-slate-300 italic">—</span>}
                      </span>
                    </td>
                    <td className="font-mono text-xs text-slate-500">
                      {formatIssuedBy(rec.issued_by) || <span className="text-slate-300 italic">—</span>}
                    </td>
                    <td className="font-mono text-xs text-slate-500 whitespace-nowrap">
                      {formatDate(rec.issued_at)}
                    </td>
                    <td>
                      <span className="seal-stamped-active scale-90 origin-left">
                        {rec.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      </div>
    </div>
  )
}
