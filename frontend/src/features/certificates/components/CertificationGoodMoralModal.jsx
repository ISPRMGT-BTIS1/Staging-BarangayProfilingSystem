import React, { useRef, useState, useEffect } from "react";
import { useData } from "../../../context/DataContext";
import { useAuth } from "@/shared/hooks/useAuth";
import { CertificationOfGoodMoralPreview } from "../templates/certification-good-moral/preview.tsx";
import { logCertificateRequest } from "../utils/logCertificateRequest";

// ─── constants (barangay-wide, not per-request) ─────────────────────────────

const BARANGAY_NAME = "Barangay 46, Zone 06";
const CITY_NAME = "Pasay City, Metro Manila";
const CAPTAIN_NAME = "Perlita B. Advincula";

// ─── helpers ────────────────────────────────────────────────────────────────

function getFullName(r) {
  if (!r) return "";
  const mid = r.middleName ? ` ${r.middleName}` : "";
  return `${r.firstName}${mid} ${r.lastName}`;
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

// ─── component ──────────────────────────────────────────────────────────────

export default function CertificationGoodMoralModal({ isOpen, onClose }) {
  const { residents, helpers: { getFullAddress } } = useData();
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
  const [salutation, setSalutation] = useState("Mr.");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [nationality, setNationality] = useState("Filipino");
  const [purpose, setPurpose] = useState("");
  const [dateIssued, setDateIssued] = useState(todayIso());

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
      setSalutation("Mr.");
      setName("");
      setAddress("");
      setNationality("Filipino");
      setPurpose("");
      setDateIssued(todayIso());
      setStage("form");
    }
  }, [isOpen]);

  // auto-fill fields when a resident is picked
  useEffect(() => {
    if (!selectedResident) return;
    setName(getFullName(selectedResident));
    setAddress(getFullAddress(selectedResident.householdId));
  }, [selectedResident]);

  // ── resident dropdown options ────────────────────────────────────────
  const filteredResidents = residentSearch.trim().length === 0
    ? []
    : residents.filter((r) => {
        const full = getFullName(r).toLowerCase();
        const id = String(r.residentId || "").toLowerCase();
        const q = residentSearch.toLowerCase();
        return full.includes(q) || id.includes(q);
      }).slice(0, 8);

  // ── preview data object ──────────────────────────────────────────────
  const previewData = {
    salutation,
    name,
    address,
    nationality,
    dateIssued,
    captainName: CAPTAIN_NAME,
    barangayName: BARANGAY_NAME,
    cityName: CITY_NAME,
    language,
    purpose,
  };

  const canPrint = !!(name && address);

  // ── print handler ────────────────────────────────────────────────────
  const handlePrint = () => {
    logCertificateRequest({
      certificateType: 'CERTIFICATION_GOOD_MORAL',
      residentName: name || null,
      residentId: selectedResident?.residentId || null,
      purpose: null,
      issuedBy: currentUser?.full_name || currentUser?.fullName || currentUser?.username || (currentUser?.userId ? String(currentUser.userId) : null),
    });
    window.print();
  };

  if (!isOpen) return null;

  // ─────────────────────────────────────────────────────────────────────
  return (
    // 1. Converted inline styles to Tailwind classes so print: modifiers can override them
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#16324a8c] backdrop-blur-[2px] print:absolute print:inset-0 print:bg-white print:block">
      
      {/* 2. Added print stylesheet to remove browser URL and Date headers */}
      <style>
        {`@media print { 
          @page { margin: 0; } 
          body { margin: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; } 
        }`}
      </style>

      <div className="bg-white rounded-xs shadow-2xl border border-[#D1D7CE] flex flex-col w-[980px] max-w-[96vw] max-h-[92vh] overflow-hidden print:w-full print:max-w-none print:h-auto print:max-h-none print:overflow-visible print:border-none print:shadow-none">
        
        {/* ── Header ────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#D1D7CE] bg-[#F9FAF8] flex-shrink-0 print:hidden">
          <div>
            <h2 className="text-base font-serif font-bold text-[#16324A]">
              Certification of Good Moral
            </h2>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-mono mt-0.5">
              CERTIFICATION_OF_GOOD_MORAL
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center border border-[#D1D7CE] rounded-xs overflow-hidden text-xs font-mono">
              <button
                onClick={() => setStage("form")}
                className={`px-3 py-1.5 cursor-pointer transition-all ${
                  stage === "form"
                    ? "bg-[#16324A] text-white"
                    : "bg-white text-slate-500 hover:bg-[#F2F4F1]"
                }`}
              >
                Form
              </button>
              <button
                onClick={() => setStage("preview")}
                className={`px-3 py-1.5 cursor-pointer transition-all ${
                  stage === "preview"
                    ? "bg-[#16324A] text-white"
                    : "bg-white text-slate-500 hover:bg-[#F2F4F1]"
                }`}
              >
                Preview
              </button>
            </div>

            <button
              onClick={onClose}
              className="ml-2 p-1.5 text-slate-400 hover:text-[#16324A] hover:bg-[#F2F4F1] rounded-xs transition-all cursor-pointer"
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
                        ? "bg-[#16324A] text-white border-[#16324A] shadow-xs"
                        : "bg-white text-slate-600 border-[#D1D7CE] hover:bg-[#F2F4F1]"
                    }`}
                  >
                    <span>🇬🇧 English</span>
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
                    <span>🇵🇭 Tagalog</span>
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
                      className="w-full border border-[#D1D7CE] rounded-xs px-3 py-2 text-xs focus:outline-none focus:border-[#16324A] bg-[#F9FAF8] focus:bg-white text-[#16324A] placeholder-slate-400"
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
                          className="px-3 py-2.5 text-xs cursor-pointer hover:bg-[#16324A] hover:text-white transition-colors border-b border-[#D1D7CE]/40 last:border-0"
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
                    ✓ Fields auto-filled from resident record — edit below if needed.
                  </p>
                )}
              </div>

              <div className="border-t border-[#D1D7CE]/60 pt-1">
                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-mono mb-4">
                  Certificate Fields
                </p>

                {/* SALUTATION */}
                <FormField label="Salutation">
                  <select
                    className={inputCls}
                    value={salutation}
                    onChange={(e) => setSalutation(e.target.value)}
                  >
                    <option value="Mr.">Mr.</option>
                    <option value="Ms.">Ms.</option>
                    <option value="Mrs.">Mrs.</option>
                  </select>
                </FormField>

                {/* NAME */}
                <FormField label="Name" required>
                  <input
                    type="text"
                    className={inputCls}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
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

                {/* NATIONALITY */}
                <FormField label="Nationality">
                  <input
                    type="text"
                    className={inputCls}
                    value={nationality}
                    onChange={(e) => setNationality(e.target.value)}
                    placeholder="e.g. Filipino"
                  />
                </FormField>

                {/* DATE ISSUED */}
                <FormField label="Date Issued" required>
                  <input
                    type="date"
                    className={inputCls}
                    value={dateIssued}
                    onChange={(e) => setDateIssued(e.target.value)}
                  />
                </FormField>
              </div>
            </div>

            {/* ── Form action bar ──────────────────────────────────── */}
            <div className="px-6 py-4 border-t border-[#D1D7CE] bg-[#F9FAF8] flex items-center justify-between gap-3 flex-shrink-0 print:hidden">
              <button
                onClick={onClose}
                className="text-xs font-mono uppercase tracking-wider px-4 py-2 border border-[#D1D7CE] text-slate-500 rounded-xs hover:bg-[#F2F4F1] cursor-pointer transition-all"
              >
                Cancel
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setStage("preview")}
                  className="text-xs font-mono uppercase tracking-wider px-4 py-2 border border-[#16324A] text-[#16324A] rounded-xs hover:bg-[#16324A]/5 cursor-pointer transition-all"
                >
                  Preview →
                </button>
                <button
                  onClick={handlePrint}
                  disabled={!canPrint}
                  className="text-xs font-mono uppercase tracking-wider px-4 py-2 bg-[#16324A] text-white rounded-xs hover:bg-[#0f2436] cursor-pointer transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
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
            <div className="mb-4 flex items-center gap-3 print:hidden">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
                Print Preview
              </span>
              <button
                onClick={handlePrint}
                disabled={!canPrint}
                className="text-[10px] font-mono uppercase tracking-wider px-3 py-1.5 bg-[#16324A] text-white rounded-xs hover:bg-[#0f2436] cursor-pointer transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                <svg className="h-3 w-3 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2">
                  <path d="M6 9V2h12v7" />
                  <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                  <rect x="6" y="14" width="12" height="8" />
                </svg>
                Print / Save PDF
              </button>
            </div>

            {/* 3. Scaled Wrapper converted to Tailwind scale utility to allow print overrides */}
            <div className="shadow-2xl origin-top scale-[0.65] mb-[-35%] print:scale-100 print:mb-0 print:shadow-none print:flex print:justify-center print:w-full">
              <CertificationOfGoodMoralPreview
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
  "w-full border border-[#D1D7CE] rounded-xs px-3 py-2 text-xs focus:outline-none focus:border-[#16324A] bg-[#F9FAF8] focus:bg-white text-[#16324A] placeholder-slate-400 transition-colors";
