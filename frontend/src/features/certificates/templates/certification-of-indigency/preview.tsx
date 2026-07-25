import React from "react";

// Replace with actual asset paths when logos are available
// e.g. import pasayLogo from "../../../../assets/pasay-logo.jpg";
const CITY_LOGO = "https://via.placeholder.com/150?text=City+Logo";
const BRGY_LOGO = "https://via.placeholder.com/150?text=Brgy+Logo";

export interface IndigencyData {
  fullName?: string;
  ageStatus?: string;
  nationality?: string;
  address?: string;
  purpose?: string;
  issuedDate?: string;
  punongBarangay?: string;
}

export interface CertificateIndigencyPreviewProps {
  data: IndigencyData;
}

export const CertificateIndigencyPreview = React.forwardRef<
  HTMLDivElement,
  CertificateIndigencyPreviewProps
>(({ data }, ref) => {
  /** Display the value if filled in, otherwise render a blank underline placeholder */
  const renderField = (value?: string, fallback = "________________________") =>
    value && value.trim() !== "" ? value : fallback;

  return (
    <div
      id="indigency-print-root"
      ref={ref}
      className="w-[210mm] min-h-[297mm] bg-white text-black p-16 mx-auto relative font-serif print:shadow-none"
    >
      <div>
        {/* ── Header with Logos ─────────────────────────────────────────── */}
        <div className="flex justify-between items-start mb-12">
          <div className="w-28 h-28 flex-shrink-0">
            <img
              src={CITY_LOGO}
              alt="Pasay City Logo"
              className="w-full h-full object-contain"
            />
          </div>

          <div className="text-center flex-1 px-4 leading-tight mt-2 space-y-0.5">
            <p className="text-[15px]">Republic of the Philippines</p>
            <p className="text-[15px] font-bold uppercase tracking-wide">
              Office of the Sangguniang Barangay
            </p>
            <p className="text-[15px] font-bold uppercase tracking-wide">
              Barangay 46, Zone 06
            </p>
            <p className="text-[15px]">Pasay City, Metro Manila</p>
          </div>

          <div className="w-28 h-28 flex-shrink-0">
            <img
              src={BRGY_LOGO}
              alt="Barangay 46 Logo"
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* ── Document Title ────────────────────────────────────────────── */}
        <div className="text-center my-10">
          <h1
            className="text-4xl font-extrabold uppercase tracking-widest font-serif"
            style={{ color: "#4a0000", transform: "scaleY(1.1)" }}
          >
            Certificate of Indigency
          </h1>
        </div>

        {/* ── Salutation ────────────────────────────────────────────────── */}
        <div className="mb-8 px-4">
          <p className="font-bold text-[15px] tracking-wide">TO WHOM IT MAY CONCERN:</p>
        </div>

        {/* ── Body Paragraphs ───────────────────────────────────────────── */}
        <div className="space-y-6 text-justify leading-[2.2] text-[16px] px-4">
          {/* Paragraph 1 */}
          <p className="indent-12">
            This is to certify that{" "}
            <strong className="uppercase underline decoration-1 underline-offset-4">
              {renderField(data.fullName, "________________________")}
            </strong>
            ;{" "}
            <em className="font-semibold">
              {renderField(data.ageStatus, "________")}
            </em>
            ,{" "}
            <em className="font-semibold">
              {renderField(data.nationality, "________")}
            </em>{" "}
            and presently residing at{" "}
            <strong className="italic">
              {renderField(data.address, "___________________________________")}
            </strong>
            ; is a bona fide resident of this Barangay.
          </p>

          {/* Paragraph 2 */}
          <p className="indent-12">
            This further certifies that he/she is well known to the undersigned,
            to be of good moral character and a law-abiding citizen. Moreover,{" "}
            <strong className="italic uppercase">
              {data.fullName && data.fullName.trim() !== ""
                ? `MR./MS. ${data.fullName.trim().split(" ").pop()}`
                : "________________________"}
            </strong>{" "}
            is acknowledged as one of the{" "}
            <strong className="italic">Indigent constituents</strong> in the
            Barangay.
          </p>

          {/* Paragraph 3 */}
          <p className="indent-12">
            This certificate is being issued upon the request{" "}
            <strong className="italic">
              {renderField(
                data.purpose,
                "of the aforementioned name, for whatever legal intent and purpose it may serve best."
              )}
            </strong>
          </p>

          {/* Issued Date */}
          <p className="indent-12 pt-4">
            Issued this{" "}
            <strong>
              {renderField(data.issuedDate, "____ day of ____________ 2026.")}
            </strong>
          </p>
        </div>
      </div>

      {/* ── Signature & Footer ────────────────────────────────────────────── */}
      <div className="mt-16 px-4">
        <div className="flex justify-end text-center mb-6">
          <div className="inline-block">
            <p className="font-bold uppercase text-[16px]">
              {renderField(data.punongBarangay, "PERLITA B. ADVINCULA")}
            </p>
            <p className="text-[15px] italic">Punong Barangay</p>
          </div>
        </div>

        <p className="text-[13px] italic font-semibold">Not valid without seal</p>
      </div>
    </div>
  );
});

CertificateIndigencyPreview.displayName = "CertificateIndigencyPreview";

export default CertificateIndigencyPreview;
