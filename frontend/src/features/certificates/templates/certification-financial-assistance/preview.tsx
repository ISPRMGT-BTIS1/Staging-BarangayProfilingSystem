import { forwardRef } from 'react';
import { PASAY_CITY_LOGO_BASE64, BARANGAY_46_LOGO_BASE64 } from "../../../../assets/embeddedLogos";

const CITY_LOGO = PASAY_CITY_LOGO_BASE64; 
const BRGY_LOGO = BARANGAY_46_LOGO_BASE64;

const TAGALOG_MONTHS = [
  "Enero", "Pebrero", "Marso", "Abril", "Mayo", "Hunyo",
  "Hulyo", "Agosto", "Setyembre", "Oktubre", "Nobyembre", "Disyembre"
];

interface PreviewData {
  name: string;
  address: string;
  age: string;
  gender: string;
  civilStatus: string;
  purpose: string;
  language?: "en" | "tl";
}

interface PreviewProps {
  data: PreviewData;
}

export const CertificationFinancialAssistancePreview = forwardRef<HTMLDivElement, PreviewProps>(({ data }, ref) => {
  const { name, address, age, gender, civilStatus, purpose, language } = data;
  const isTagalog = language === "tl";
  
  // Format current date
  const date = new Date();
  const day = date.getDate();
  const month = date.toLocaleString('default', { month: 'long' });
  const year = date.getFullYear();

  const getOrdinal = (n: number) => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  // Helper to determine pronoun based on gender
  const getPronoun = (g: string) => {
    if (!g) return 'he/she';
    if (g.toLowerCase() === 'male') return 'he';
    if (g.toLowerCase() === 'female') return 'she';
    return 'he/she';
  };

  return (
    <div 
      ref={ref}
      id="fin-assist-print-root"
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
          className="text-5xl font-bold uppercase tracking-wide" 
          style={{ color: '#4a0000', transform: 'scaleY(1.2)' }}
        >
          {isTagalog ? "SERTIPIKASYON" : "CERTIFICATION"}
        </h1>
      </div>

      {/* ── Document Body ─────────────────────────────────────────────── */}
      <div className="text-justify leading-[2.2] space-y-6 text-[16px] px-4">
        <p className="font-bold mb-4">
          {isTagalog ? "SA LAHAT NG MAY KINAUUKULAN:" : "TO WHOM IT MAY CONCERN:"}
        </p>
        
        {isTagalog ? (
          <>
            <p className="indent-12">
              Ito ay nagpapatunay na si <strong className="uppercase underline decoration-1 underline-offset-4 font-bold">{name || "[PANGALAN]"}</strong>, <strong>{age || "[EDAD]"}</strong> taong gulang, {civilStatus ? `(${civilStatus.toLowerCase()})` : ""}, Pilipino, at kasalukuyang naninirahan sa <strong>{address || "[TIRAHAN]"}</strong>, ay isang lehitimong residente ng Barangay na ito.
            </p>
            
            <p className="indent-12">
              Pinatutunayan din na siya ay kilala ng lumagda sa ibaba bilang isang taong may mabuting asal, mabuting moral na pagkatao, at masunurin sa batas.
            </p>
            
            <p className="indent-12">
              Ang sertipikasyong ito ay ipinagkakaloob sa kahilingan ng nabanggit na tao para sa <strong className="uppercase italic">TULONG FINANSIYAL (FINANCIAL ASSISTANCE)</strong>{purpose ? ` (${purpose})` : ""}, at para sa anumang legal na layunin na kanyang paggamitan.
            </p>
            
            <p className="indent-12 mt-8">
              Iginawad ngayong <strong>ika-{day} ng {TAGALOG_MONTHS[date.getMonth()]} {year}</strong>.
            </p>
          </>
        ) : (
          <>
            <p className="indent-12">
              This is to certify that <strong className="uppercase underline decoration-1 underline-offset-4">{name || "[NAME]"}</strong>; <strong>{age || "[AGE]"}</strong> years of aged, {civilStatus ? `(${civilStatus.toLowerCase()})` : "(civil status)"} Filipino, and presently residing at <strong>{address || "[ADDRESS]"}</strong>, is a bona fide resident of this Barangay.
            </p>
            
            <p className="indent-12">
              This further certifies that {getPronoun(gender)} is well known to the undersigned, to be of good moral character and has never been subjected to any disciplinary action per our Barangay record
            </p>
            
            <p className="indent-12">
              This certification is being issued upon the request of <strong className="uppercase italic">{name || "[NAME]"}</strong>, for <strong>FINANCIAL ASSISTANCE</strong>{purpose ? ` (${purpose})` : ""}; and for whatever legal intent it may serve best.
            </p>
            
            <p className="indent-12 mt-8">
              Issued this <strong>{getOrdinal(day)}</strong> day of <strong>{month}, {year}</strong>.
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

CertificationFinancialAssistancePreview.displayName = "CertificationFinancialAssistancePreview";
