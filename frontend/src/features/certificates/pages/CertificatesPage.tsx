import { CertificateList } from '../components/CertificateList'

export default function CertificatesPage() {
  return (
    <div className="flex-1 p-6 overflow-y-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-serif text-[#16324A]">Certificates</h1>
        <p className="text-sm text-slate-500 font-sans mt-1">
          Request, fill, and print barangay certificate documents
        </p>
      </div>

      <div className="ledger-container p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-[#D1D7CE] pb-3">
          <h3 className="text-sm font-serif font-bold text-[#16324A]">
            Available Certificate Types
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-[#2E5A44] bg-[rgba(46,90,68,0.06)] border border-[#2E5A44]/30 px-2 py-0.5 rounded-sm uppercase tracking-wider">
              1 Live
            </span>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider bg-[#F2F4F1] border border-[#D1D7CE] px-2 py-0.5 rounded-sm">
              8 Coming Soon
            </span>
          </div>
        </div>

        <CertificateList />
      </div>
    </div>
  )
}
