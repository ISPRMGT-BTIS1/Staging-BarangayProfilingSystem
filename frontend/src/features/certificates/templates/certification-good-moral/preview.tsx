import React from 'react'

export interface CertificationOfGoodMoralData {
  /** Full name of the person being certified — e.g. "Juan Dela Cruz" */
  name: string
  /** Salutation prefix — e.g. "Mr." / "Ms." / "Mrs." */
  salutation?: string
  /** Street address — e.g. "#1794 Tramo St. Pasay City" */
  address: string
  /** Nationality — e.g. "Filipino" */
  nationality?: string
  /** Date the certificate is issued */
  dateIssued: Date | string
  /** Barangay Captain / Punong Barangay full name — e.g. "Perlita B. Advincula" */
  captainName: string
  /** Barangay details for the header */
  barangayName: string   // e.g. "Barangay 46, Zone 06"
  cityName: string        // e.g. "Pasay City, Metro Manila"
  /** Optional seal/logo images shown top-left and top-right */
  leftLogoSrc?: string
  rightLogoSrc?: string
}

interface Props {
  data: CertificationOfGoodMoralData
  /** Forwarded ref used by react-to-print */
  printRef?: React.Ref<HTMLDivElement>
}

/**
 * CertificationOfGoodMoralPreview
 *
 * Renders the "CERTIFICATION OF GOOD MORAL" character certificate
 * pre-filled with the provided data.
 *
 * Designed to be used with:
 *   - `window.print()` — the component renders itself in a print-friendly way
 *   - `react-to-print` — pass `printRef` to the wrapping div
 *
 * Print behaviour is controlled by the <style> block inside the component so
 * it works even without a global print stylesheet.
 */
const CITY_LOGO = "https://via.placeholder.com/150?text=City+Logo";
const BRGY_LOGO = "https://via.placeholder.com/150?text=Brgy+Logo";

export const CertificationOfGoodMoralPreview = React.forwardRef<
  HTMLDivElement,
  Props
>(({ data }, ref) => {
  const formattedDate = formatIssuedDate(data.dateIssued)

  return (
    <div
      id="cogm-print-root"
      ref={ref}
      className="w-[210mm] min-h-[297mm] bg-white text-black p-16 mx-auto relative font-serif print:shadow-none"
    >


      {/* ── Header with Logos ─────────────────────────────────────────── */}
      <div className="flex justify-between items-start mb-12">
        <div className="w-28 h-28 flex-shrink-0">
          <img src={data.leftLogoSrc || CITY_LOGO} alt="City Logo" className="w-full h-full object-contain" />
        </div>

        <div className="text-center flex-1 px-4 leading-tight mt-2">
          <p className="text-[15px]">Republic of the Philippines</p>
          <p className="text-[15px] font-bold mt-1">OFFICE OF THE SANGGUNIANG BARANGAY</p>
          <p className="text-[15px] uppercase">{data.barangayName || "BARANGAY 46, ZONE 06"}</p>
          <p className="text-[15px]">{data.cityName || "Pasay City, Metro Manila"}</p>
        </div>

        <div className="w-28 h-28 flex-shrink-0">
          <img src={data.rightLogoSrc || BRGY_LOGO} alt="Barangay Logo" className="w-full h-full object-contain" />
        </div>
      </div>

      {/* ── Document Title ────────────────────────────────────────────── */}
      <div className="text-center mb-10 mt-6">
        <h1
          className="text-3xl font-bold uppercase tracking-wide"
          style={{ color: '#4a0000', transform: 'scaleY(1.2)' }}
        >
          CERTIFICATION OF GOOD MORAL
        </h1>
      </div>

      {/* ── Document Body ─────────────────────────────────────────────── */}
      <div className="text-justify leading-[2.2] space-y-6 text-[16px] px-4 font-serif">
        <p className="font-bold mb-4">TO WHOM IT MAY CONCERN:</p>

        <p className="indent-12">
          This is to certify that{' '}
          <strong className="uppercase underline decoration-1 underline-offset-4">
            {data.salutation ? `${data.salutation} ` : ''}
            {data.name || "[NAME]"},
          </strong>{' '}
          <span className="italic">of legal age, {data.nationality || 'Filipino'}, and</span>{' '}
          presently residing at <strong className="italic">{data.address || "[ADDRESS]"}</strong> resident of this Barangay.
        </p>

        <p className="indent-12">
          This further certifies that he/she is well known to the
          undersigned, to be of good moral character and a law-abiding
          citizen.
        </p>

        <p className="indent-12">
          This certification is being issued upon the request <strong className="italic">of the aforementioned name, for whatever legal intent and purpose it may serve them best.</strong>
        </p>

        <p className="indent-12 mt-8">
          Issued this <strong>{formattedDate}</strong>.
        </p>
      </div>

      {/* ── Signatures ────────────────────────────────────────────────── */}
      <div className="mt-24 flex justify-between items-end px-4">
        <div className="text-[13px] italic font-semibold">
          Not valid without seal
        </div>

        <div className="text-center w-72">
          <p className="font-bold uppercase text-[16px]">{data.captainName || "Perlita B. Advincula"}</p>
          <p className="text-[15px] italic">Punong Barangay</p>
        </div>
      </div>
    </div>
  )
})

CertificationOfGoodMoralPreview.displayName = 'CertificationOfGoodMoralPreview'

/* ── Internal helpers ──────────────────────────────────────────────────────── */

/** Formats a date as e.g. "13th day of July, 2026" */
function formatIssuedDate(input: Date | string): string {
  const date = typeof input === 'string' ? new Date(input) : input

  const day = date.getDate()
  const month = date.toLocaleString('en-US', { month: 'long' })
  const year = date.getFullYear()

  const suffix = getOrdinalSuffix(day)

  return `${day}${suffix} day of ${month}, ${year}`
}

function getOrdinalSuffix(day: number): string {
  if (day >= 11 && day <= 13) return 'th'
  switch (day % 10) {
    case 1:
      return 'st'
    case 2:
      return 'nd'
    case 3:
      return 'rd'
    default:
      return 'th'
  }
}
