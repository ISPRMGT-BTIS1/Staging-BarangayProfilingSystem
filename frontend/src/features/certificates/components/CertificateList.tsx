import { useState } from 'react'
import { CertificateType, CERTIFICATE_TYPE_LABELS } from '../types/certificate.types'
import ApplicationBarangayClearanceModal from './ApplicationBarangayClearanceModal'
import CertificationFinancialAssistanceModal from './CertificationFinancialAssistanceModal'
import CertificationJobseekersModal from './CertificationJobseekersModal'
import CertificationGoodMoralModal from './CertificationGoodMoralModal'
import CertificationOfGuardianshipModal from './CertificationOfGuardianshipModal'
import CertificationOfIndigencyModal from './CertificationOfIndigencyModal'
import OathOfUndertakingModal from './OathOfUndertakingModal'
import EventAttendanceModal from './EventAttendanceModal'

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
  const [activeModal, setActiveModal] = useState<CertificateType | null>(null)

  const handleRequest = (type: CertificateType) => {
    setActiveModal(type)
  }

  const handleClose = () => {
    setActiveModal(null)
  }

  return (
    <>
      <div className="space-y-2">
        {Object.values(CertificateType).map((type) => (
          <CertificateCard key={type} type={type} onRequest={handleRequest} />
        ))}
      </div>

      {/* ── Modals — one per implemented certificate type ───────────── */}
      <ApplicationBarangayClearanceModal
        isOpen={activeModal === CertificateType.APPLICATION_BARANGAY_CLEARANCE}
        onClose={handleClose}
      />
      <CertificationFinancialAssistanceModal
        isOpen={activeModal === CertificateType.CERTIFICATION_FINANCIAL_ASSISTANCE}
        onClose={handleClose}
      />
      <CertificationJobseekersModal
        isOpen={activeModal === CertificateType.CERTIFICATION_FIRST_TIME_JOBSEEKER}
        onClose={handleClose}
      />

      <CertificationGoodMoralModal
        isOpen={activeModal === CertificateType.CERTIFICATION_GOOD_MORAL}
        onClose={handleClose}
      />
      <CertificationOfGuardianshipModal
        isOpen={activeModal === CertificateType.CERTIFICATION_OF_GUARDIANSHIP}
        onClose={handleClose}
      />
      <CertificationOfIndigencyModal
        isOpen={activeModal === CertificateType.CERTIFICATION_OF_INDIGENCY}
        onClose={handleClose}
      />
      <OathOfUndertakingModal
        isOpen={activeModal === CertificateType.OATH_OF_UNDERTAKING}
        onClose={handleClose}
      />
      <EventAttendanceModal
        isOpen={activeModal === CertificateType.EVENT_ATTENDANCE_SHEET}
        onClose={handleClose}
      />

      {/* Other types: show a "coming soon" toast for now */}
      {activeModal !== null &&
        activeModal !== CertificateType.APPLICATION_BARANGAY_CLEARANCE &&
        activeModal !== CertificateType.CERTIFICATION_FINANCIAL_ASSISTANCE &&
        activeModal !== CertificateType.CERTIFICATION_FIRST_TIME_JOBSEEKER &&
        activeModal !== CertificateType.CERTIFICATION_GOOD_MORAL &&
        activeModal !== CertificateType.CERTIFICATION_OF_GUARDIANSHIP &&
        activeModal !== CertificateType.CERTIFICATION_OF_INDIGENCY &&
        activeModal !== CertificateType.OATH_OF_UNDERTAKING &&
        activeModal !== CertificateType.EVENT_ATTENDANCE_SHEET && (
          <div className="fixed bottom-6 right-6 z-50 ledger-container px-5 py-3 flex items-center gap-3 shadow-lg animate-in slide-in-from-bottom-2">
            <svg className="h-4 w-4 text-[#C8932B] fill-none stroke-current flex-shrink-0" viewBox="0 0 24 24" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4m0 4h.01" />
            </svg>
            <div>
              <p className="text-xs font-semibold text-[#16324A]">
                {CERTIFICATE_TYPE_LABELS[activeModal]}
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Form not yet implemented — coming soon.
              </p>
            </div>
            <button
              onClick={handleClose}
              className="ml-2 text-slate-400 hover:text-[#16324A] cursor-pointer"
            >
              ×
            </button>
          </div>
        )}
    </>
  )
}
