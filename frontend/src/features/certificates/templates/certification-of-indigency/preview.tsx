import React from "react";
import { PASAY_CITY_LOGO_BASE64, BARANGAY_46_LOGO_BASE64 } from "../../../../assets/embeddedLogos";

const CITY_LOGO = PASAY_CITY_LOGO_BASE64;
const BRGY_LOGO = BARANGAY_46_LOGO_BASE64;

export interface IndigencyData {
  fullName?: string;
  ageStatus?: string;
  nationality?: string;
  address?: string;
  purpose?: string;
  issuedDate?: string;
  punongBarangay?: string;
  language?: "en" | "tl";
}

export interface CertificateIndigencyPreviewProps {
  data: IndigencyData;
}

export const CertificateIndigencyPreview = React.forwardRef<
  HTMLDivElement,
  CertificateIndigencyPreviewProps
>(({ data }, ref) => {
  const isTagalog = data.language === "tl";

  /** Display the value if filled in, otherwise render a blank underline placeholder */
  const renderField = (value?: string, fallback = "________________________") =>
    value && value.trim() !== "" ? value : fallback;

  return (
    <div
      id="indigency-print-root"
      ref={ref}
      className="w-[210mm]  bg-white text-black p-16 mx-auto relative font-serif print:shadow-none"
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
            <p className="text-[15px]">
              {isTagalog ? "Republika ng Pilipinas" : "Republic of the Philippines"}
            </p>
            <p className="text-[15px] font-bold uppercase tracking-wide">
              {isTagalog
                ? "Tanggapan ng Sangguniang Barangay"
                : "Office of the Sangguniang Barangay"}
            </p>
            <p className="text-[15px] font-bold uppercase tracking-wide">
              Barangay 46, Zone 06
            </p>
            <p className="text-[15px]">
              {isTagalog ? "Lungsod ng Pasay, Kalakhang Maynila" : "Pasay City, Metro Manila"}
            </p>
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
            {isTagalog ? "SERTIPIKA NG KAHIRAPAN" : "Certificate of Indigency"}
          </h1>
        </div>

        {/* ── Salutation ────────────────────────────────────────────────── */}
        <div className="mb-8 px-4">
          <p className="font-bold text-[15px] tracking-wide">
            {isTagalog ? "SA LAHAT NG MAY KINAUUKULAN:" : "TO WHOM IT MAY CONCERN:"}
          </p>
        </div>

        {/* ── Body Paragraphs ───────────────────────────────────────────── */}
        <div className="space-y-6 text-justify leading-[2.2] text-[16px] px-4">
          {isTagalog ? (
            /* ── Tagalog Version (Exact Barangay 46 Official Wording) ────── */
            <>
              <p className="indent-12">
                Ito ay nagpapatunay na si{" "}
                <strong className="uppercase underline decoration-1 underline-offset-4 font-bold">
                  {renderField(data.fullName, "________________________")}
                </strong>
                ,{" "}
                <em className="font-semibold">
                  {renderField(data.ageStatus, "nasa hustong gulang")}
                </em>
                ,{" "}
                <em className="font-semibold">
                  {renderField(data.nationality, "Pilipino")}
                </em>
                , at kasalukuyang naninirahan sa{" "}
                <strong className="italic">
                  {renderField(data.address, "___________________________________")}
                </strong>
                , ay isang lehitimong residente ng Barangay na ito.
              </p>

              <p className="indent-12">
                Pinatutunayan din na siya ay kilala ng lumagda sa ibaba bilang isang
                taong may mabuting asal, mabuting moral na pagkatao, at masunurin sa
                batas. Bukod dito, si{" "}
                <strong className="italic uppercase">
                  {data.fullName && data.fullName.trim() !== ""
                    ? `${data.fullName.trim()}`
                    : "________________________"}
                </strong>{" "}
                ay kinikilala bilang isa sa mga{" "}
                <strong className="italic">mahihirap na mamamayan (Indigent constituents)</strong>{" "}
                sa ating Barangay.
              </p>

              <p className="indent-12">
                Ang sertipikasyong ito ay ipinagkakaloob sa kahilingan ng nabanggit
                na tao at para sa anumang legal na layunin na kanyang paggamitan
                {data.purpose && data.purpose.trim() !== "" && (
                  <span className="font-semibold"> ({data.purpose})</span>
                )}
                .
              </p>

              <p className="indent-12 pt-4">
                Iginawad ngayong{" "}
                <strong>
                  {renderField(data.issuedDate, "ika-____ ng ____________ 2026.")}
                </strong>
              </p>
            </>
          ) : (
            /* ── English Version ────────────────────────────────────── */
            <>
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

              <p className="indent-12">
                This certificate is being issued upon the request{" "}
                <strong className="italic">
                  {renderField(
                    data.purpose,
                    "of the aforementioned name, for whatever legal intent and purpose it may serve best."
                  )}
                </strong>
              </p>

              <p className="indent-12 pt-4">
                Issued this{" "}
                <strong>
                  {renderField(data.issuedDate, "____ day of ____________ 2026.")}
                </strong>
              </p>
            </>
          )}
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

        <p className="text-[13px] italic font-semibold">
          {isTagalog ? "Hindi balido kung walang opisyal na selyo." : "Not valid without seal"}
        </p>
      </div>
    </div>
  );
});

CertificateIndigencyPreview.displayName = "CertificateIndigencyPreview";

export default CertificateIndigencyPreview;
