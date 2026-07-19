import React from 'react'

export interface ApplicationBarangayClearanceData {
  /** Full name — e.g. "Juan Santos Dela Cruz" */
  name: string
  /** Street address — e.g. "12A Rizal Avenue, Barangay San Jose" */
  address: string
  /** Age in years */
  age: number | string
  /** Gender / Kasarian — e.g. "Male" / "Female" / "Lalaki" / "Babae" */
  gender: string
  /** Purpose of the clearance request */
  purpose: string
  /** Name of parent/s if the applicant is a minor; empty string if not */
  parentName?: string
}

interface Props {
  data: ApplicationBarangayClearanceData
  /** Forwarded ref used by react-to-print */
  printRef?: React.Ref<HTMLDivElement>
}

/**
 * ApplicationBarangayClearancePreview
 *
 * Renders the "APPLICATION FOR BARANGAY CLEARANCE/CERTIFICATION SLIP" form
 * pre-filled with the provided data.
 *
 * Designed to be used with:
 *   - `window.print()` — the component renders itself in a print-friendly way
 *   - `react-to-print` — pass `printRef` to the wrapping div
 *
 * Print behaviour is controlled by the <style> block inside the component so
 * it works even without a global print stylesheet.
 */
export const ApplicationBarangayClearancePreview = React.forwardRef<
  HTMLDivElement,
  Props
>(({ data }, ref) => {
  return (
    <>
      {/* ── Scoped print styles ─────────────────────────────────────────── */}
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #abc-print-root,
          #abc-print-root * { visibility: visible !important; }
          #abc-print-root {
            position: fixed !important;
            top: 0; left: 0;
            width: 100%; height: 100%;
            margin: 0; padding: 0;
          }
        }
      `}</style>

      {/* ── Certificate document ─────────────────────────────────────────── */}
      <div
        id="abc-print-root"
        ref={ref}
        style={{
          fontFamily: '"Arial Black", Arial, sans-serif',
          background: '#ffffff',
          padding: '48px 52px',
          width: '576px',           /* ~6 in at 96 dpi — half-page portrait */
          minHeight: '720px',
          border: '2px solid #000',
          boxSizing: 'border-box',
          margin: '0 auto',
          color: '#000',
        }}
      >
        {/* ── Title ─────────────────────────────────────────────────────── */}
        <h1
          style={{
            textAlign: 'center',
            fontFamily: '"Arial Black", Arial, sans-serif',
            fontWeight: 900,
            fontSize: '20px',
            lineHeight: 1.25,
            textDecoration: 'underline',
            textTransform: 'uppercase',
            marginBottom: '36px',
            letterSpacing: '0.02em',
          }}
        >
          Application for Barangay<br />
          Clearance/Certification Slip
        </h1>

        {/* ── Fields ────────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
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
              fontSize: '15px',
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
            marginTop: '60px',
          }}
        />
      </div>
    </>
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
