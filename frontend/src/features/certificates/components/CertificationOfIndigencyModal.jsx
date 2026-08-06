import React, { useRef, useState, useEffect } from "react";
import { useData } from "../../../context/DataContext";
import { useAuth } from "@/shared/hooks/useAuth";
import { CertificateIndigencyPreview } from "../templates/certification-of-indigency/preview.tsx";
import { logCertificateRequest, generateControlNumber } from "../utils/logCertificateRequest";

// ─── helpers ────────────────────────────────────────────────────────────────

function getFullName(r) {
  if (!r) return "";
  const mid = r.middleName ? ` ${r.middleName}` : "";
  return `${r.firstName}${mid} ${r.lastName}`;
}

function todayIso() {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

function ordinalSuffix(day) {
  const j = day % 10;
  const k = day % 100;
  if (j === 1 && k !== 11) return "st";
  if (j === 2 && k !== 12) return "nd";
  if (j === 3 && k !== 13) return "rd";
  return "th";
}

const TAGALOG_MONTHS = [
  "Enero", "Pebrero", "Marso", "Abril", "Mayo", "Hunyo",
  "Hulyo", "Agosto", "Setyembre", "Oktubre", "Nobyembre", "Disyembre"
];

/** Turns an ISO date string (YYYY-MM-DD) into e.g. "22nd day of July 2026." or "ika-22 ng Hulyo 2026." */
function formatIssuedDate(isoDate, lang = "en") {
  if (!isoDate) return "";
  const d = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(d.getTime())) return "";
  const day = d.getDate();
  const year = d.getFullYear();
  if (lang === "tl") {
    const month = TAGALOG_MONTHS[d.getMonth()];
    return `ika-${day} ng ${month} ${year}.`;
  }
  const month = d.toLocaleString("en-US", { month: "long" });
  return `${day}${ordinalSuffix(day)} day of ${month} ${year}.`;
}

// ─── component ──────────────────────────────────────────────────────────────

const CAPTAIN_NAME = "PERLITA B. ADVINCULA";

export default function CertificationOfIndigencyModal({ isOpen, onClose }) {
  const { residents, helpers: { calculateAge, getFullAddress } } = useData();
  const { currentUser } = useAuth();
  const printRef = useRef(null);

  // ── resident search state ──────────────────────────────────────────────
  const [residentSearch, setResidentSearch] = useState("");
  const [selectedResident, setSelectedResident] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // ── language state: 'en' | 'tl' ────────────────────────────────────────
  const [language, setLanguage] = useState("en");

  // ── overrideable fields ────────────────────────────────────────────────
  const [fullName, setFullName] = useState("");
  const [ageStatus, setAgeStatus] = useState("");
  const [nationality, setNationality] = useState("");
  const [address, setAddress] = useState("");
  const [purpose, setPurpose] = useState("");
  const [internalPurpose, setInternalPurpose] = useState("");
  const [issuedDateRaw, setIssuedDateRaw] = useState(todayIso());
  const [punongBarangay, setPunongBarangay] = useState(CAPTAIN_NAME);
  const [controlNumber, setControlNumber] = useState("");

  // ── stage: 'form' | 'preview' ─────────────────────────────────────────
  const [stage, setStage] = useState("form");

  // close dropdown on outside click
  useEffect(() => {
    function handler(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // reset on open
  useEffect(() => {
    if (isOpen) {
      setResidentSearch("");
      setSelectedResident(null);
      setLanguage("en");
      setFullName("");
      setAgeStatus("");
      setNationality("");
      setAddress("");
      setPurpose("");
      setInternalPurpose("");
      setIssuedDateRaw(todayIso());
      setPunongBarangay(CAPTAIN_NAME);
      setStage("form");
      generateControlNumber().then(setControlNumber);
    }
  }, [isOpen]);

  // auto-fill when a resident is picked
  useEffect(() => {
    if (!selectedResident) return;
    setFullName(getFullName(selectedResident));
    setAddress(getFullAddress(selectedResident.householdId));
    setNationality(selectedResident.citizenship || "Filipino");

    const age =
      typeof selectedResident.age === "number"
        ? selectedResident.age
        : calculateAge(selectedResident.birthDate);
    if (age !== null && age !== undefined) {
      if (language === "tl") {
        setAgeStatus(age < 18 ? "wala pa sa hustong edad (minor)" : "sapat ang edad");
      } else {
        setAgeStatus(age < 18 ? "minor" : "legal of age");
      }
    }
  }, [selectedResident, language]);

  // ── resident dropdown options ────────────────────────────────────────
  const filteredResidents =
    residentSearch.trim().length === 0
      ? []
      : residents
          .filter((r) => {
            const full = getFullName(r).toLowerCase();
            const id = String(r.residentId || "").toLowerCase();
            const q = residentSearch.toLowerCase();
            return full.includes(q) || id.includes(q);
          })
          .slice(0, 8);

  // ── derived preview data ─────────────────────────────────────────────
  const issuedDate = formatIssuedDate(issuedDateRaw, language);
  const previewData = {
    fullName,
    ageStatus,
    nationality,
    address,
    purpose,
    issuedDate,
    punongBarangay,
    language,
  };

  const canPrint = !!(fullName && address && purpose && internalPurpose);

  // ── print handler ────────────────────────────────────────────────────
  const handlePrint = () => {
    logCertificateRequest({
      certificateType: 'CERTIFICATION_OF_INDIGENCY',
      residentName: fullName || null,
      residentId: selectedResident?.residentId || null,
      purpose: internalPurpose || null,
      issuedBy: currentUser?.full_name || currentUser?.fullName || currentUser?.username || (currentUser?.userId ? String(currentUser.userId) : null),
      controlNumber,
    });
    window.print();
  };

  if (!isOpen) return null;

  // ─────────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#322A2C8c] backdrop-blur-[2px] print:absolute print:inset-0 print:bg-white print:block">

      {/* Print stylesheet */}
      <style>
        {`@media print { 
          @page { margin: 0; } 
          body { margin: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; } 
        }`}
      </style>

      <div className="bg-white rounded-xs shadow-2xl border border-[#D1D7CE] flex flex-col w-[980px] max-w-[96vw] max-h-[92vh] overflow-hidden print:w-full print:max-w-none print:h-auto print:max-h-none print:overflow-visible print:border-none print:shadow-none">

        {/* ── Header ────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#D1D7CE] bg-[#FFF8F8] flex-shrink-0 print:hidden">
          <div>
            <h2 className="text-base font-serif font-bold text-[#322A2C]">
              Certification of Indigency
            </h2>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-mono mt-0.5">
              CERTIFICATION_OF_INDIGENCY
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Stage toggle */}
            <div className="flex items-center border border-[#D1D7CE] rounded-xs overflow-hidden text-xs font-mono">
              <button
                onClick={() => setStage("form")}
                className={`px-3 py-1.5 cursor-pointer transition-all ${
                  stage === "form"
                    ? "bg-[#322A2C] text-white"
                    : "bg-white text-slate-500 hover:bg-[#FFF8F8]"
                }`}
              >
                Form
              </button>
              <button
                onClick={() => setStage("preview")}
                className={`px-3 py-1.5 cursor-pointer transition-all ${
                  stage === "preview"
                    ? "bg-[#322A2C] text-white"
                    : "bg-white text-slate-500 hover:bg-[#FFF8F8]"
                }`}
              >
                Preview
              </button>
            </div>

            {/* Close */}
            <button
              onClick={onClose}
              className="ml-2 p-1.5 text-slate-400 hover:text-[#322A2C] hover:bg-[#FFF8F8] rounded-xs transition-all cursor-pointer"
            >
              <svg className="h-4 w-4 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* ── Body ──────────────────────────────────────────────────────── */}
        <div className="flex flex-1 overflow-hidden print:overflow-visible">

          {/* ── Left: Data Entry Form ────────────────────────────────── */}
          <div
            className={`flex flex-col border-r border-[#D1D7CE] overflow-y-auto print:hidden ${
              stage === "preview" ? "hidden md:flex" : "flex"
            }`}
            style={{ width: "400px", minWidth: "340px" }}
          >
            <div className="p-6 space-y-5 flex-1">

              {/* Language Selector */}
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[#E8198A] font-bold mb-1.5">
                  Certificate Language / Template
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setLanguage("en")}
                    className={`px-3 py-2 text-xs font-semibold rounded-xs border transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                      language === "en"
                        ? "bg-[#322A2C] text-white border-[#322A2C] shadow-xs"
                        : "bg-white text-slate-600 border-[#D1D7CE] hover:bg-[#FFF8F8]"
                    }`}
                  >
                    <span> English</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setLanguage("tl")}
                    className={`px-3 py-2 text-xs font-semibold rounded-xs border transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                      language === "tl"
                        ? "bg-[#E8198A] text-white border-[#E8198A] shadow-xs font-bold"
                        : "bg-white text-slate-600 border-[#F8BBD0] hover:bg-[#FCE4EC]"
                    }`}
                  >
                    <span> Tagalog</span>
                  </button>
                </div>
              </div>

              {/* Resident picker */}
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-500 mb-1.5">
                  Select Resident
                </label>
                <div className="relative" ref={dropdownRef}>
                  <div className="relative">
                    <input
                      type="text"
                      className="w-full border border-[#D1D7CE] rounded-xs px-3 py-2 text-xs focus:outline-none focus:border-[#322A2C] bg-[#FFF8F8] focus:bg-white text-[#322A2C] placeholder-slate-400"
                      placeholder="Search by name or ID…"
                      value={residentSearch}
                      onChange={(e) => {
                        setResidentSearch(e.target.value);
                        setShowDropdown(true);
                      }}
                      onFocus={() => setShowDropdown(true)}
                    />
                    {selectedResident && (
                      <button
                        onClick={() => {
                          setSelectedResident(null);
                          setResidentSearch("");
                          setFullName("");
                          setAddress("");
                          setAgeStatus("");
                          setNationality("");
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600 cursor-pointer"
                      >
                        ×
                      </button>
                    )}
                  </div>

                  {showDropdown && filteredResidents.length > 0 && (
                    <div className="absolute z-20 w-full mt-1 bg-white border border-[#D1D7CE] rounded-xs shadow-lg max-h-52 overflow-y-auto">
                      {filteredResidents.map((r) => (
                        <div
                          key={r.residentId}
                          className="px-3 py-2.5 text-xs cursor-pointer hover:bg-[#322A2C] hover:text-white transition-colors border-b border-[#D1D7CE]/40 last:border-0"
                          onClick={() => {
                            setSelectedResident(r);
                            setResidentSearch(getFullName(r));
                            setShowDropdown(false);
                          }}
                        >
                          <div className="font-semibold">{getFullName(r)}</div>
                          <div className="text-[10px] opacity-60 font-mono">{r.residentId}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {selectedResident && (
                  <p className="text-[10px] text-emerald-600 mt-1 font-mono">
                     Fields auto-filled from resident record — edit below if needed.
                  </p>
                )}
              </div>

              <div className="border-t border-[#D1D7CE]/60 pt-1">
                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-mono mb-4">
                  Certificate Fields
                </p>

                {/* NAME */}
                <FormField label="Full Name" required>
                  <input
                    type="text"
                    className={inputCls}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Full name of applicant"
                  />
                </FormField>

                {/* ADDRESS */}
                <FormField label="Address" required>
                  <input
                    type="text"
                    className={inputCls}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="House No., Street, Barangay"
                  />
                </FormField>

                {/* AGE STATUS & NATIONALITY */}
                <div className="grid grid-cols-2 gap-3">
                  <FormField label="Age Status">
                    <input
                      type="text"
                      className={inputCls}
                      value={ageStatus}
                      onChange={(e) => setAgeStatus(e.target.value)}
                      placeholder="minor / legal of age"
                    />
                  </FormField>
                  <FormField label="Nationality">
                    <input
                      type="text"
                      className={inputCls}
                      value={nationality}
                      onChange={(e) => setNationality(e.target.value)}
                      placeholder="e.g. Filipino"
                    />
                  </FormField>
                </div>

                {/* PURPOSE */}
                <FormField label="Printed Purpose" required>
                  <textarea
                    className={`${inputCls} resize-none`}
                    rows={2}
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    placeholder="e.g. Educational Assistance, Scholarship, Financial/Medical…"
                  />
                </FormField>

                {/* INTERNAL PURPOSE */}
                <FormField label="Internal Purpose / Type of Assistance" required>
                  <textarea
                    className={`${inputCls} resize-none`}
                    rows={2}
                    value={internalPurpose}
                    onChange={(e) => setInternalPurpose(e.target.value)}
                    placeholder="Hidden from print. Used for LGU reporting"
                  />
                </FormField>

                {/* ISSUED DATE */}
                <FormField label="Issued Date">
                  <input
                    type="date"
                    className={inputCls}
                    value={issuedDateRaw}
                    onChange={(e) => setIssuedDateRaw(e.target.value)}
                  />
                  {issuedDate && (
                    <p className="text-[10px] text-slate-400 mt-1 font-mono">
                      Will print as: "{issuedDate}"
                    </p>
                  )}
                </FormField>

                {/* PUNONG BARANGAY */}
                <FormField label="Punong Barangay">
                  <input
                    type="text"
                    className={inputCls}
                    value={punongBarangay}
                    onChange={(e) => setPunongBarangay(e.target.value)}
                    placeholder="Captain's full name"
                  />
                </FormField>
              </div>
            </div>

            {/* ── Form action bar ──────────────────────────────────── */}
            <div className="px-6 py-4 border-t border-[#D1D7CE] bg-[#FFF8F8] flex items-center justify-between gap-3 flex-shrink-0 print:hidden">
              <button
                onClick={onClose}
                className="text-xs font-mono uppercase tracking-wider px-4 py-2 border border-[#D1D7CE] text-slate-500 rounded-xs hover:bg-[#FFF8F8] cursor-pointer transition-all"
              >
                Cancel
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setStage("preview")}
                  className="text-xs font-mono uppercase tracking-wider px-4 py-2 border border-[#322A2C] text-[#322A2C] rounded-xs hover:bg-[#322A2C]/5 cursor-pointer transition-all"
                >
                  Preview →
                </button>
                <button
                  onClick={handlePrint}
                  disabled={!canPrint}
                  className="text-xs font-mono uppercase tracking-wider px-4 py-2 bg-[#322A2C] text-white rounded-xs hover:bg-[#0f2436] cursor-pointer transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <svg className="h-3.5 w-3.5 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2">
                    <path d="M6 9V2h12v7" />
                    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                    <rect x="6" y="14" width="12" height="8" />
                  </svg>
                  Print / PDF
                </button>
              </div>
            </div>
          </div>

          {/* ── Right: Live Preview ──────────────────────────────────── */}
          <div
            className={`flex-1 overflow-y-auto bg-[#E8EBE5] flex flex-col items-center py-8 print:p-0 print:bg-white print:block print:overflow-visible ${
              stage === "form" ? "hidden md:flex" : "flex"
            }`}
          >
            <div className="mb-4 flex items-center gap-3 print:hidden w-full max-w-[500px] justify-between px-4">
              <div className="flex flex-col">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
                  Print Preview
                </span>
                <span className="text-xs font-mono font-bold text-[#322A2C]">{controlNumber}</span>
              </div>
              <button
                onClick={handlePrint}
                disabled={!canPrint}
                className="text-[10px] font-mono uppercase tracking-wider px-3 py-1.5 bg-[#322A2C] text-white rounded-xs hover:bg-[#0f2436] cursor-pointer transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                <svg className="h-3 w-3 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2">
                  <path d="M6 9V2h12v7" />
                  <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                  <rect x="6" y="14" width="12" height="8" />
                </svg>
                Print / Save PDF
              </button>
            </div>

            {/* Scaled preview wrapper */}
            <div className="shadow-2xl origin-top scale-[0.65] mb-[-35%] print:scale-100 print:mb-0 print:shadow-none print:flex print:justify-center print:w-full">
              <CertificateIndigencyPreview
                ref={printRef}
                data={previewData}
              />
            </div>

            {!canPrint && (
              <p className="mt-4 text-[11px] text-slate-500 font-mono italic print:hidden">
                Fill in the required fields to enable printing.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── tiny helper for consistent field wrapper ────────────────────────────────

function FormField({ label, children, required = false }) {
  return (
    <div className="mb-4">
      <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-500 mb-1.5">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full border border-[#D1D7CE] rounded-xs px-3 py-2 text-xs focus:outline-none focus:border-[#322A2C] bg-[#FFF8F8] focus:bg-white text-[#322A2C] placeholder-slate-400 transition-colors";
