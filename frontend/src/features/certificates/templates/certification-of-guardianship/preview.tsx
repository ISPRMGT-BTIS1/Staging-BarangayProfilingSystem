import { forwardRef } from "react";

export interface GuardianCertificateData {
  guardianName: string;
  studentName: string;
  address: string;
  age: string | number;
  purpose: string;
  issuedDate: string;
}

interface GuardianCertificatePreviewProps {
  data: GuardianCertificateData;
}

const CITY_LOGO = "https://via.placeholder.com/150?text=City+Logo";
const BRGY_LOGO = "https://via.placeholder.com/150?text=Brgy+Logo";

const GuardianCertificatePreview = forwardRef<
  HTMLDivElement,
  GuardianCertificatePreviewProps
>(({ data }, ref) => {
  return (
    <div
      id="print-area"
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
          className="text-3xl font-bold uppercase tracking-wide"
          style={{ color: '#4a0000', transform: 'scaleY(1.2)' }}
        >
          CERTIFICATION OF GUARDIANSHIP
        </h1>
      </div>

      {/* ── Document Body ─────────────────────────────────────────────── */}
      <div className="text-justify leading-[2.2] space-y-6 text-[16px] px-4">
        <p className="font-bold mb-4">TO WHOM IT MAY CONCERN:</p>

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
          </strong>
          ,{" "}
          <strong className="italic">
            and for whatever legal intent it may serve best.
          </strong>
        </p>

        <p className="indent-12 mt-8">
          Issued this{" "}
          <strong>
            {data.issuedDate || "[ISSUED DATE]"}
          </strong>.
        </p>
      </div>

      {/* ── Signatures ────────────────────────────────────────────────── */}
      <div className="mt-24 flex justify-between items-end px-4">
        <div className="text-[13px] italic font-semibold">
          Not valid without seal
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
