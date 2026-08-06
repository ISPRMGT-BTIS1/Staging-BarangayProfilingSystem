import React from 'react'
import { PASAY_CITY_LOGO_BASE64, BARANGAY_46_LOGO_BASE64 } from "../../../../assets/embeddedLogos";

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
  /** Language template: 'en' | 'tl' */
  language?: "en" | "tl"
  /** Optional purpose */
  purpose?: string
}

interface Props {
  data: CertificationOfGoodMoralData
  /** Forwarded ref used by react-to-print */
  printRef?: React.Ref<HTMLDivElement>
}

const CITY_LOGO = PASAY_CITY_LOGO_BASE64;
const BRGY_LOGO = BARANGAY_46_LOGO_BASE64;

const TAGALOG_MONTHS = [
  "Enero", "Pebrero", "Marso", "Abril", "Mayo", "Hunyo",
  "Hulyo", "Agosto", "Setyembre", "Oktubre", "Nobyembre", "Disyembre"
];

export const CertificationOfGoodMoralPreview = React.forwardRef<
  HTMLDivElement,
  Props
>(({ data }, ref) => {
  const isTagalog = data.language === "tl";
  const formattedDate = formatIssuedDate(data.dateIssued, isTagalog ? "tl" : "en");

  return (
    <div
      id="cogm-print-root"
      ref={ref}
      className="w-[210mm] min-h-[255mm] bg-white text-black p-14 mx-auto relative font-serif print:shadow-none print:min-h-0 print:p-10"
    >
      {/* ── Header with Logos ─────────────────────────────────────────── */}
      <div className="flex justify-between items-start mb-12">
        <div className="w-28 h-28 flex-shrink-0">
          <img src={data.leftLogoSrc || CITY_LOGO} alt="City Logo" className="w-full h-full object-contain" />
        </div>

        <div className="text-center flex-1 px-4 leading-tight mt-2">
          <p className="text-[15px]">
            {isTagalog ? "Republika ng Pilipinas" : "Republic of the Philippines"}
          </p>
          <p className="text-[15px] font-bold mt-1 uppercase">
            {isTagalog ? "TANGGAPAN NG SANGGUNIANG BARANGAY" : "OFFICE OF THE SANGGUNIANG BARANGAY"}
          </p>
          <p className="text-[15px] uppercase">{data.barangayName || "BARANGAY 46, ZONE 06"}</p>
          <p className="text-[15px]">{isTagalog ? "Lungsod ng Pasay, Kalakhang Maynila" : (data.cityName || "Pasay City, Metro Manila")}</p>
        </div>

        <div className="w-28 h-28 flex-shrink-0">
          <img src={data.rightLogoSrc || BRGY_LOGO} alt="Barangay Logo" className="w-full h-full object-contain" />
        </div>
      </div>

      {/* ── Document Title ────────────────────────────────────────────── */}
      <div className="text-center mb-10 mt-6">
        <h1
          className="text-4xl font-bold uppercase tracking-wide"
          style={{ color: '#4a0000', transform: 'scaleY(1.2)' }}
        >
          {isTagalog ? "SERTIPIKO NG MAGANDANG ASAL" : "CERTIFICATION OF GOOD MORAL"}
        </h1>
      </div>

      {/* ── Document Body ─────────────────────────────────────────────── */}
      <div className="text-justify leading-[2.2] space-y-6 text-[16px] px-4 font-serif">
        <p className="font-bold mb-4">
          {isTagalog ? "SA LAHAT NG MAY KINAUUKULAN:" : "TO WHOM IT MAY CONCERN:"}
        </p>

        {isTagalog ? (
          <>
            <p className="indent-12">
              Ito ay nagpapatunay na si{' '}
              <strong className="uppercase underline decoration-1 underline-offset-4 font-bold">
                {data.salutation ? `${data.salutation} ` : ''}
                {data.name || "[PANGALAN]"},
              </strong>{' '}
              <span className="italic">nasa hustong gulang, {data.nationality || 'Pilipino'}, at</span>{' '}
              kasalukuyang naninirahan sa <strong className="italic">{data.address || "[TIRAHAN]"}</strong>, ay isang lehitimong residente ng Barangay na ito.
            </p>

            <p className="indent-12">
              Pinatutunayan din na siya ay kilala ng lumagda sa ibaba bilang isang
              taong may mabuting asal, mabuting moral na pagkatao, at masunurin sa
              batas.
            </p>

            <p className="indent-12">
              Ang sertipikasyong ito ay ipinagkakaloob sa kahilingan ng nabanggit
              na tao at para sa anumang legal na layunin na kanyang paggamitan
              {data.purpose && data.purpose.trim() !== "" && (
                <span className="font-semibold"> ({data.purpose})</span>
              )}
              .
            </p>

            <p className="indent-12 mt-8">
              Iginawad ngayong <strong>{formattedDate}</strong>.
            </p>
          </>
        ) : (
          <>
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
          </>
        )}
      </div>

      {/* ── Signatures ────────────────────────────────────────────────── */}
      <div className="mt-24 flex justify-between items-end px-4">
        <div className="text-[13px] italic font-semibold">
          {isTagalog ? "Hindi balido kung walang opisyal na selyo." : "Not valid without seal"}
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

function formatIssuedDate(input: Date | string, lang = "en"): string {
  const date = typeof input === 'string' ? new Date(input) : input

  const day = date.getDate()
  const year = date.getFullYear()

  if (lang === "tl") {
    const month = TAGALOG_MONTHS[date.getMonth()];
    return `ika-${day} ng ${month} ${year}.`;
  }

  const month = date.toLocaleString('en-US', { month: 'long' })
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
