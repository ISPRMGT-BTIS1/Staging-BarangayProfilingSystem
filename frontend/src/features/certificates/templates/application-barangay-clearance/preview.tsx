import React from 'react'

export interface ApplicationBarangayClearanceData {
  /** Full name — e.g. "Juan Santos Dela Cruz" */
  name: string
  /** Street address — e.g. "12A Rizal Avenue, Barangay 46 Zone 6" */
  address: string
  /** Age in years */
  age: number | string
  /** Gender / Kasarian — e.g. "Male" / "Female" / "Lalaki" / "Babae" */
  gender: string
  /** Purpose of the clearance request */
  purpose: string
  /** Name of parent/s if the applicant is a minor; empty string if not */
  parentName?: string
  /** Language template: 'en' | 'tl' */
  language?: "en" | "tl"
}

interface Props {
  data: ApplicationBarangayClearanceData
  /** Forwarded ref used by react-to-print */
  printRef?: React.Ref<HTMLDivElement>
}

export const ApplicationBarangayClearancePreview = React.forwardRef<
  HTMLDivElement,
  Props
>(({ data }, ref) => {
  const isTagalog = data.language === "tl";

  return (
    <div
      id="abc-print-root"
      ref={ref}
      className="w-full max-w-[195mm] min-h-[220mm] bg-white text-black p-8 mx-auto relative font-sans print:shadow-none print:p-6 print:m-0"
      style={{
        boxSizing: 'border-box',
        border: '2px solid #000',
      }}
    >
        {/* ── Title ─────────────────────────────────────────────────────── */}
        <h1
          style={{
            textAlign: 'center',
            fontFamily: '"Arial Black", Arial, sans-serif',
            fontWeight: 900,
            fontSize: '18px',
            lineHeight: 1.25,
            textDecoration: 'underline',
            textTransform: 'uppercase',
            marginBottom: '24px',
            letterSpacing: '0.02em',
          }}
        >
          {isTagalog ? (
            <>
              APLIKASYON SA BARANGAY<br />
              CLEARANCE / SLIP NG SERTIPIKASYON
            </>
          ) : (
            <>
              Application for Barangay<br />
              Clearance/Certification Slip
            </>
          )}
        </h1>

        {/* ── Fields ────────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* NAME */}
          <FieldRow label="NAME" value={data.name} grow />

          {/* ADDRESS */}
          <FieldRow label="ADDRESS" value={data.address} grow />

          {/* AGE */}
          <FieldRow label="AGE" value={String(data.age)} width="120px" />

          {/* GENDER / KASARIAN */}
          <FieldRow
            label="GENDER/KASARIAN"
            value={data.gender}
            width="140px"
          />

          {/* PURPOSE */}
          <FieldRow label="PURPOSE" value={data.purpose} grow />

          {/* NAME OF PARENT/S IF MINOR */}
          <div
            style={{
              fontFamily: '"Arial Black", Arial, sans-serif',
              fontWeight: 900,
              fontSize: '14px',
              letterSpacing: '0.01em',
            }}
          >
            NAME OF PARENT/S IF MINOR:
            {data.parentName ? (
              <span
                style={{
                  display: 'inline-block',
                  marginLeft: '8px',
                  borderBottom: '2px solid #000',
                  paddingBottom: '1px',
                  minWidth: '200px',
                  fontWeight: 400,
                  fontFamily: 'Arial, sans-serif',
                }}
              >
                {data.parentName}
              </span>
            ) : null}
          </div>
        </div>

        {/* ── Bottom rule ───────────────────────────────────────────────── */}
        <div
          style={{
            borderTop: '2px solid #000',
            marginTop: '36px',
          }}
        />
      </div>
  )
})

ApplicationBarangayClearancePreview.displayName =
  'ApplicationBarangayClearancePreview'

/* ── Internal helper ──────────────────────────────────────────────────────── */

interface FieldRowProps {
  label: string
  value: string
  /** If true the underline extends to fill available space */
  grow?: boolean
  /** Fixed width for the underline (used for short fields like AGE) */
  width?: string
}

function FieldRow({ label, value, grow = false, width }: FieldRowProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px' }}>
      <span
        style={{
          fontFamily: '"Arial Black", Arial, sans-serif',
          fontWeight: 900,
          fontSize: '15px',
          whiteSpace: 'nowrap',
          flexShrink: 0,
          letterSpacing: '0.01em',
          paddingBottom: '2px',
        }}
      >
        {label}:
      </span>

      <span
        style={{
          display: 'block',
          borderBottom: '2px solid #000',
          paddingBottom: '2px',
          paddingLeft: '4px',
          fontFamily: 'Arial, sans-serif',
          fontWeight: 400,
          fontSize: '14px',
          flex: grow ? 1 : undefined,
          width: !grow ? (width ?? '120px') : undefined,
          minWidth: grow ? '80px' : undefined,
        }}
      >
        {value}
      </span>
    </div>
  )
}
