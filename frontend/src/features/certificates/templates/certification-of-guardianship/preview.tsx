import { forwardRef } from "react";
import { PASAY_CITY_LOGO_BASE64, BARANGAY_46_LOGO_BASE64 } from "../../../../assets/embeddedLogos";

export interface GuardianCertificateData {
  guardianName: string;
  studentName: string;
  address: string;
  age: string | number;
  purpose: string;
  issuedDate: string;
  language?: "en" | "tl";
}

interface GuardianCertificatePreviewProps {
  data: GuardianCertificateData;
}

const CITY_LOGO = PASAY_CITY_LOGO_BASE64;
const BRGY_LOGO = BARANGAY_46_LOGO_BASE64;

const GuardianCertificatePreview = forwardRef<
  HTMLDivElement,
  GuardianCertificatePreviewProps
>(({ data }, ref) => {
  const isTagalog = data.language === "tl";

  return (
    <div
      id="guardianship-print-root"
      ref={ref}
      className="w-[210mm]  bg-white text-black p-16 mx-auto relative font-serif print:shadow-none"
    >
      {/* ── Header with Logos ─────────────────────────────────────────── */}
      <div className="flex justify-between items-start mb-12">
        <div className="w-28 h-28 flex-shrink-0">
          <img src={CITY_LOGO} alt="City Logo" className="w-full h-full object-contain" />
        </div>

        <div className="text-center flex-1 px-4 leading-tight mt-2">
          <p className="text-[15px]">
            {isTagalog ? "Republika ng Pilipinas" : "Republic of the Philippines"}
          </p>
          <p className="text-[15px] font-bold mt-1 uppercase">
            {isTagalog ? "TANGGAPAN NG SANGGUNIANG BARANGAY" : "OFFICE OF THE SANGGUNIANG BARANGAY"}
          </p>
          <p className="text-[15px] uppercase">BARANGAY 46, ZONE 06</p>
          <p className="text-[15px]">{isTagalog ? "Lungsod ng Pasay, Kalakhang Maynila" : "Pasay City, Metro Manila"}</p>
        </div>

        <div className="w-28 h-28 flex-shrink-0">
          <img src={BRGY_LOGO} alt="Barangay Logo" className="w-full h-full object-contain" />
        </div>
      </div>

      {/* ── Document Title ────────────────────────────────────────────── */}
      <div className="text-center mb-10 mt-6">
        <h1
          className="text-3xl font-bold uppercase tracking-wide"
          style={{ color: '#4a0000', transform: 'scaleY(1.2)' }}
        >
          {isTagalog ? "SERTIPIKASYON" : "CERTIFICATION OF GUARDIANSHIP"}
        </h1>
        {isTagalog && (
          <p className="text-xs italic font-serif text-slate-500 mt-1 tracking-wider">
            (KATIBAYAN NG PAG-AALAGA / GUARDIANSHIP)
          </p>
        )}
      </div>

      {/* ── Document Body ─────────────────────────────────────────────── */}
      <div className="text-justify leading-[2.2] space-y-6 text-[16px] px-4">
        <p className="font-bold mb-4">
          {isTagalog ? "SA LAHAT NG MAY KINAUUKULAN:" : "TO WHOM IT MAY CONCERN:"}
        </p>

        {isTagalog ? (
          <>
            <p className="indent-12">
              Ito ay nagpapatunay na si{" "}
              <strong className="uppercase underline decoration-1 underline-offset-4 font-bold">
                {data.guardianName || "[PANGALAN NG TAGAPANGALAGA]"}
              </strong>
              , nasa hustong gulang, Pilipino, at kasalukuyang naninirahan sa{" "}
              <strong className="italic">
                {data.address || "[TIRAHAN]"}
              </strong>
              , ay ang tumatayong legal na tagapangalaga ni{" "}
              <strong className="uppercase">
                {data.studentName || "[PANGALAN NG ALAGA]"}
              </strong>
              ,{" "}
              <strong>
                {data.age || "[EDAD]"}
              </strong>{" "}
              taong gulang.
            </p>

            <p className="indent-12">
              Pinatutunayan din na ang mga nabanggit na pangalan ay kilala na may mabuting asal at walang anumang masamang rekord sa ating Barangay.
            </p>

            <p className="indent-12">
              Ang sertipikasyong ito ay ipinagkakaloob sa kahilingan ng nabanggit na tagapangalaga para sa{" "}
              <strong className="uppercase">
                {data.purpose || "[LAYUNIN]"}
              </strong>{" "}
              at para sa anumang legal na layunin na kanyang paggamitan.
            </p>

            <p className="indent-12 mt-8">
              Iginawad ngayong{" "}
              <strong>
                {data.issuedDate || "ika-____ ng ____________ 2026."}
              </strong>
            </p>
          </>
        ) : (
          <>
            <p className="indent-12">
              This is to certify that{" "}
              <strong className="uppercase">
                {data.guardianName || "[GUARDIAN NAME]"}
              </strong>
              ;{" "}
              <strong className="italic">
                with residence address at
              </strong>{" "}
              <strong>
                {data.address || "[ADDRESS]"}
              </strong>{" "}
              of{" "}
              <strong className="italic">
                this Barangay
              </strong>
              , is the guardian of{" "}
              <strong className="uppercase">
                {data.studentName || "[STUDENT NAME]"}
              </strong>
              ,{" "}
              <strong>
                {data.age || "[AGE]"}
              </strong>{" "}
              years of age.
            </p>

            <p className="indent-12">
              This further certifies that aforesaid names are known to be of good
              moral character and has no derogatory records on file per our
              Barangay records.
            </p>

            <p className="indent-12">
              This certification is being issued in connection with the latter's{" "}
              <strong className="uppercase">
                {data.purpose || "[PURPOSE]"}
              </strong>{" "}
              and for whatever legal intent and purpose it may serve best.
            </p>

            <p className="indent-12 mt-8">
              Issued this{" "}
              <strong>
                {data.issuedDate || "____ day of ____________ 2026."}
              </strong>
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
          <p className="font-bold uppercase text-[16px]">PERLITA B. ADVINCULA</p>
          <p className="text-[15px] italic">Punong Barangay</p>
        </div>
      </div>
    </div>
  );
});

GuardianCertificatePreview.displayName = "GuardianCertificatePreview";

export default GuardianCertificatePreview;
