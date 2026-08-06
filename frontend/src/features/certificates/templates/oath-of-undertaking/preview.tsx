import { forwardRef } from "react";
import { PASAY_CITY_LOGO_BASE64, BARANGAY_46_LOGO_BASE64 } from "../../../../assets/embeddedLogos";

const CITY_LOGO = PASAY_CITY_LOGO_BASE64;
const BRGY_LOGO = BARANGAY_46_LOGO_BASE64;

export interface OathOfUndertakingData {
  fullName?: string;
  age?: string;
  residencyYears?: string;
  residencyStartDate?: string;
  address?: string;
  issuedDay?: string;
  issuedMonthYear?: string;
  cityMunicipality?: string;
  witnessName?: string;
  witnessPosition?: string;
  language?: "en" | "tl";
}

interface OathOfUndertakingPreviewProps {
  data: OathOfUndertakingData;
}

export const OathOfUndertakingPreview = forwardRef<
  HTMLDivElement,
  OathOfUndertakingPreviewProps
>(({ data }, ref) => {
  const isTagalog = data.language === "tl";

  const renderField = (value?: string, fallback = "________________________") =>
    value && value.trim() !== "" ? value : fallback;

  return (
    <div
      id="oath-print-root"
      ref={ref}
      className="w-[210mm] bg-white text-black p-10 mx-auto relative font-sans print:shadow-none flex flex-col"
    >
      <div>
        {/* ── Header with Logos ─────────────────────────────────────────── */}
        <div className="mb-8 flex items-center justify-between pb-2">
          <div className="w-28 flex justify-center flex-shrink-0">
            <img
              src={CITY_LOGO}
              alt="Pasay City Logo"
              className="w-28 h-auto object-contain"
            />
          </div>

          <div className="text-center space-y-0.5 px-2 flex-1">
            <p className="text-[13px] font-bold uppercase tracking-wide">
              {isTagalog ? "REPUBLIKA NG PILIPINAS" : "REPUBLIC OF THE PHILIPPINES"}
            </p>
            <p className="text-[12px] font-bold uppercase tracking-wide">
              {isTagalog ? "TANGGAPAN NG SANGGUNIANG BARANGAY" : "OFFICE OF THE SANGGUNIANG BARANGAY"}
            </p>
            <p className="text-[14px] font-extrabold uppercase tracking-wide">
              BARANGAY 46, ZONE 06
            </p>
            <p className="text-[11.5px] font-medium">{isTagalog ? "Lungsod ng Pasay, Kalakhang Maynila" : "Pasay City, Metro Manila"}</p>
            <p className="text-[11px] font-normal" style={{ color: '#1e3a8a' }}>
              Barangay46zone06pasay@gmail.com
            </p>
          </div>

          <div className="w-28 flex justify-center flex-shrink-0">
            <img
              src={BRGY_LOGO}
              alt="Barangay 46 Logo"
              className="w-24 h-24 object-contain"
            />
          </div>
        </div>

        {/* ── Banner Title ────────────────────────────────────────────── */}
        <div
          className="text-white text-center py-1.5 px-4 my-4 rounded-xs"
          style={{ backgroundColor: '#1B365D' }}
        >
          <h1 className="text-[16px] font-extrabold uppercase tracking-widest">
            {isTagalog ? "PANUNUMPA NG PAGTANGGAP AT PAGTUPAD (OATH OF UNDERTAKING)" : "OATH OF UNDERTAKING"}
          </h1>
        </div>

        {/* ── Main Declaration ─────────────────────────────────────────── */}
        {isTagalog ? (
          <>
            <p className="text-justify text-[12.5px] leading-[1.55] mb-4 font-normal">
              Ako si{" "}
              <strong className="font-bold uppercase">
                {renderField(data.fullName, "JUAN DELA CRUZ")}
              </strong>
              ,{" "}
              <strong className="font-bold">
                {renderField(data.age, "23")} taong gulang
              </strong>
              , lehitimong residente ng Barangay na ito nang higit sa{" "}
              <strong className="font-bold">
                {renderField(data.residencyYears, "Dalawampu't isang (21)")} taon
              </strong>{" "}
              na may address sa{" "}
              <strong className="font-bold">
                {renderField(data.address, "# 1794 Tramo St., Pasay City")}
              </strong>
              ; na kumukuha ng benepisyo ng{" "}
              <strong className="font-bold">
                REPUBLIC ACT 11261 (FIRST TIME JOBSEEKERS ASSISTANCE ACT OF 2019)
              </strong>
              , ay buong pusong nanunumpa at sumasang-ayon sa mga sumusunod:
            </p>

            <ol className="list-decimal pl-6 space-y-1.5 text-justify text-[12px] leading-[1.45]">
              <li>
                Na ito ang unang pagkakataon na ako ay aktibong maghahanap ng trabaho, kaya humihiling ng Sertipikasyon ng Barangay upang magamit ang benepisyo ng batas;
              </li>
              <li>
                Na natatanto ko na ang benepisyo at pribilehiyo sa ilalim ng nasabing batas ay balido lamang sa loob ng <strong className="font-bold">isang (1) taon</strong> mula sa petsa ng pagkakaloob;
              </li>
              <li>Na minsan ko lamang magagamit ang benepisyo ng batas na ito;</li>
              <li>
                Na nauunawaan ko na ang aking personal na impormasyon ay isasama sa Talaan ng First Time Jobseekers at hindi gagamitin sa anumang ilegal na layunin;
              </li>
              <li>
                Na ipapaalam at/o iuulat ko sa Barangay kapag ako ay nakakuha na ng trabaho;
              </li>
              <li>
                Na ako ay hindi benepisyaryo ng Job Start Program sa ilalim ng RA No. 10869 at iba pang katulad na batas;
              </li>
              <li>
                Na ang sertipikasyong ito ay hindi ko gagamitin sa anumang kahinungalingan o pangingikil;
              </li>
              <li>
                Na ang panunumpa na ito ay ginawa lamang para sa layunin ng RA No. 11261.
              </li>
            </ol>
          </>
        ) : (
          <>
            <p className="text-justify text-[12.5px] leading-[1.55] mb-4 font-normal">
              I,{" "}
              <strong className="font-bold uppercase">
                {renderField(data.fullName, "JUAN DELA CRUZ")}
              </strong>
              ,{" "}
              <strong className="font-bold">
                {renderField(data.age, "23")} years of age
              </strong>
              , a bona fide resident of this Barangay for{" "}
              <strong className="font-bold">
                {renderField(data.residencyYears, "Twenty-one (21)")} year
              </strong>{" "}
              and{" "}
              <strong className="font-bold">
                {renderField(data.residencyStartDate, "June 2007")} to date
              </strong>
              , with address at{" "}
              <strong className="font-bold">
                {renderField(data.address, "# 1794 Tramo St., Pasay City")}
              </strong>
              ; availing the benefits of{" "}
              <strong className="font-bold">
                REPUBLIC ACT 11261, otherwise known as the FIRST TIME JOBSEEKER ACT
                OF 2019
              </strong>
              , do hereby declare and agree to abide and be bound by the following:
            </p>

            <ol className="list-decimal pl-6 space-y-1.5 text-justify text-[12px] leading-[1.45]">
              <li>
                That is the first time that I will actively look for a job, and
                therefore requesting that a Barangay Certificate be issued in my
                favor to avail the benefit of the law;
              </li>
              <li>
                That I am aware that the benefit and privilege/s under the said law
                shall be valid only for{" "}
                <strong className="font-bold">one (1) year</strong> from the date
                that the Barangay Certificate has been issued
              </li>
              <li>That I can only avail of the law once.</li>
              <li>
                That I understand that my personal information shall be included in
                the Roster / list of First Time Jobseeker and will not be used for
                any unlawful purposes
              </li>
              <li>
                That I will inform and / or report to the Barangay personally,
                through text or other means, or through family / relatives once I
                get employed; and
              </li>
              <li>
                That I am not a beneficiary of the Job Start Program under RA NO.
                10869 and other laws that give similar exemptions for the documents
                or transaction exempted under RA No. 11261
              </li>
              <li>
                That if issued the request Certification, I will not use the same in
                any fraud, neither falsify nor help and / or assist in the
                fabrication of the said certification.
              </li>
              <li>
                That this undertaking is made solely for the purpose of obtaining a
                Barangay certification consistent with the object of RA No. 11261
                and not for other purposes; and
              </li>
              <li>
                That I consent to the use of my personal information pursuant to the
                Data Privacy Act and other applicable laws, rules, and regulations.
              </li>
            </ol>
          </>
        )}

        {/* ── Date & Location ──────────────────────────────────────────── */}
        <div className="mt-6 text-[12.5px]">
          {isTagalog ? "Nilagdaan ngayong " : "Signed this "}
          <strong className="font-bold">
            {renderField(data.issuedDay, "13TH")}
          </strong>{" "}
          {isTagalog ? "araw ng " : "day of "}
          <strong className="font-bold">
            {renderField(data.issuedMonthYear, "July 2026")}
          </strong>
          {isTagalog ? "; sa Lungsod / Bayan ng " : "; in the City / Municipality of "}
          <strong className="font-bold">
            {renderField(data.cityMunicipality, "Pasay")}
          </strong>
          .
        </div>
      </div>

      {/* ── Signature Section ─────────────────────────────────────────── */}
      <div className="mb-2 mt-10">
        <div className="grid grid-cols-2 gap-12">
          <div className="flex flex-col text-left">
            <span className="font-semibold text-[12px] mb-10">
              {isTagalog ? "Nilagdaan ni:" : "Signed By:"}
            </span>
            <div className="text-center">
              <p className="font-bold uppercase text-[12.5px] tracking-wide">
                {renderField(data.fullName, "JUAN DELA CRUZ")}
              </p>
              <p className="text-[11px] font-medium" style={{ color: '#374151' }}>
                First Time Jobseeker
              </p>
            </div>
          </div>

          <div className="flex flex-col text-left">
            <span className="font-semibold text-[12px] mb-10">
              {isTagalog ? "Nasaksihan ni:" : "Witnessed by:"}
            </span>
            <div className="text-center">
              <p className="font-bold uppercase text-[12.5px] tracking-wide">
                {renderField(data.witnessName, "HON. MICHAEL H. LAUZON")}
              </p>
              <p className="text-[11px] font-medium" style={{ color: '#374151' }}>
                {renderField(data.witnessPosition, "Barangay Kagawad")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

OathOfUndertakingPreview.displayName = "OathOfUndertakingPreview";

export default OathOfUndertakingPreview;
