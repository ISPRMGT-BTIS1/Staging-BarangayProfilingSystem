import { forwardRef } from 'react';

// Replace these placeholders with the actual image paths from your GDrive/assets folder
const CITY_LOGO = "https://via.placeholder.com/150?text=City+Logo";
const BRGY_LOGO = "https://via.placeholder.com/150?text=Brgy+Logo";

interface PreviewData {
  name: string;
  address: string;
  age: string;
  gender: string;
  residencyYears: string; // e.g. "21"
  residencySince: string; // e.g. "June 2007"
  witnessName?: string;
  witnessPosition?: string;
}

interface PreviewProps {
  data: PreviewData;
}

// Convert an integer to spelled-out English words (handles 0–999, enough for residency years)
const numberToWords = (num: number): string => {
  if (isNaN(num)) return "";
  if (num === 0) return "Zero";

  const ones = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
    "Seventeen", "Eighteen", "Nineteen",
  ];
  const tens = [
    "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety",
  ];

  const words = (n: number): string => {
    if (n < 20) return ones[n];
    if (n < 100) {
      const t = tens[Math.floor(n / 10)];
      const o = n % 10;
      return o ? `${t} ${ones[o].toLowerCase()}` : t;
    }
    const h = ones[Math.floor(n / 100)];
    const rest = n % 100;
    return rest ? `${h} hundred ${words(rest).toLowerCase()}` : `${h} hundred`;
  };

  return words(num);
};

export const CertificationJobseekersPreview = forwardRef<HTMLDivElement, PreviewProps>(({ data }, ref) => {
  const { name, address, age, gender, residencyYears, residencySince, witnessName, witnessPosition } = data;

  // Format current date
  const date = new Date();
  const day = date.getDate();
  const month = date.toLocaleString('default', { month: 'long' });
  const year = date.getFullYear();

  const getOrdinalSuffix = (n: number) => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return s[(v - 20) % 10] || s[v] || s[0];
  };

  // Honorific prefix based on gender
  const getHonorific = (g: string) => {
    if (!g) return 'MR./MS.';
    if (g.toLowerCase() === 'male') return 'MR.';
    if (g.toLowerCase() === 'female') return 'MS.';
    return 'MR./MS.';
  };

  const yearsNum = parseInt(residencyYears, 10);
  const yearsWords = numberToWords(yearsNum); // e.g. "Twenty one"

  return (
    <div
      ref={ref}
      className="w-[210mm] min-h-[297mm] bg-white text-black p-16 mx-auto relative font-serif print:shadow-none"
    >
      {/* ── Header with Logos ─────────────────────────────────────────── */}
      <div className="flex justify-between items-start mb-12">
        <div className="w-28 h-28 flex-shrink-0">
          <img src={CITY_LOGO} alt="City Logo" className="w-full h-full object-contain" />
        </div>

        <div className="text-center flex-1 px-4 leading-tight mt-2">
          <p className="text-[15px]">Republic of the Philippines</p>
          <p className="text-[15px] font-bold mt-1">OFFICE OF THE SANGGUNIANG BARANGAY</p>
          <p className="text-[15px] uppercase">BARANGAY 46, ZONE 06</p>
          <p className="text-[15px]">Pasay City, Metro Manila</p>
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
          CERTIFICATION
        </h1>
      </div>

      {/* ── Document Body ─────────────────────────────────────────────── */}
      <div className="text-justify leading-[2.2] space-y-6 text-[16px] px-4">
        <p className="font-bold mb-4">TO WHOM IT MAY CONCERN:</p>

        <p className="indent-12">
          This is to certify that{" "}
          <strong className="uppercase underline decoration-1 underline-offset-4">
            {getHonorific(gender)} {name || "[NAME]"}
          </strong>
          ; <strong>{age || "[AGE]"}</strong> years of age, Filipino, and presently residing at{" "}
          <strong>{address || "[ADDRESS]"}</strong>, is a bona fide resident of this Barangay for{" "}
          <strong>
            {yearsWords || "[YEARS]"} ({residencyYears || "[#]"}) years since{" "}
            {residencySince || "[MONTH YEAR]"} to date
          </strong>{" "}
          and a qualified recipient <strong>of RA 11261</strong> for the{" "}
          <strong>First Time Jobseekers Act of 2019</strong>.
        </p>

        <p className="indent-12">
          This further certifies that the holder/bearer was informed of his/her rights including the
          duties and responsibilities accorded by RA 11261 through the Oath of Undertaking he/she has
          signed and executed in the presence of our Barangay Officials.
        </p>

        <p className="indent-12 mt-8">
          Issued this{" "}
          <strong>
            {day}
            <sup>{getOrdinalSuffix(day)}</sup>
          </strong>{" "}
          day of <strong>{month} {year}</strong>.
        </p>
      </div>

      {/* ── Signatures ────────────────────────────────────────────────── */}
      <div className="mt-20 px-4">
        {/* Punong Barangay */}
        <div className="flex justify-end">
          <div className="text-center w-72">
            <p className="font-bold uppercase text-[16px]">Hon. Perlita B. Advincula</p>
            <p className="text-[15px] italic">Punong Barangay</p>
          </div>
        </div>

        {/* Witness */}
        <div className="flex justify-end mt-12">
          <div className="text-center w-72">
            <p className="text-[15px] italic mb-6">Witnessed by:</p>
            <p className="font-bold uppercase text-[16px]">{witnessName || "Hon. Michael Lauzon"}</p>
            <p className="text-[15px] italic">{witnessPosition || "Barangay Kagawad"}</p>
          </div>
        </div>

        {/* Seal note */}
        <div className="mt-8">
          <p className="text-[13px] italic font-semibold">Not valid without seal</p>
        </div>
      </div>
    </div>
  );
});

CertificationJobseekersPreview.displayName = "CertificationJobseekersPreview";
