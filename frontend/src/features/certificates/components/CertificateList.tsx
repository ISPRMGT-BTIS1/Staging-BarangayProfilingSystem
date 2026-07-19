import { CertificateType, CERTIFICATE_TYPE_LABELS } from '../types/certificate.types'

interface CertificateCardProps {
  type: CertificateType
  onRequest: (type: CertificateType) => void
}

function CertificateCard({ type, onRequest }: CertificateCardProps) {
  return (
    <div className="ledger-container p-4 flex items-center justify-between hover:shadow-sm transition-shadow">
      <div className="flex items-center space-x-3">
        <div className="h-8 w-8 rounded-xs bg-[#16324A]/5 border border-[#D1D7CE] flex items-center justify-center flex-shrink-0">
          <svg className="h-4 w-4 text-[#16324A] fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
            <rect x="9" y="3" width="6" height="4" rx="2" />
            <path d="M9 12h6" /><path d="M9 16h4" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-[#16324A] font-serif">{CERTIFICATE_TYPE_LABELS[type]}</p>
          <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider mt-0.5">{type}</p>
        </div>
      </div>
      <button
        onClick={() => onRequest(type)}
        className="text-xs font-semibold uppercase tracking-wider px-3 py-1.5 border border-[#16324A] text-[#16324A] rounded-xs hover:bg-[#16324A] hover:text-white transition-all cursor-pointer"
      >
        Request
      </button>
    </div>
  )
}

export function CertificateList() {
  const handleRequest = (type: CertificateType) => {
    // TODO: Open CertificateRequestForm modal for the selected type
    alert(`Certificate request for "${CERTIFICATE_TYPE_LABELS[type]}" — form will open here.`)
  }

  return (
    <div className="space-y-2">
      {Object.values(CertificateType).map((type) => (
        <CertificateCard key={type} type={type} onRequest={handleRequest} />
      ))}
    </div>
  )
}
