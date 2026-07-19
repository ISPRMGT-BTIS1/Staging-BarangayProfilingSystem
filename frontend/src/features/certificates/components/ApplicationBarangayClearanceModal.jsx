import React, { useRef, useState, useEffect } from "react";
import { residents, calculateAge, getFullAddress } from "../../../mockData";
import { ApplicationBarangayClearancePreview } from "../templates/application-barangay-clearance/preview.tsx";

// ─── helpers ────────────────────────────────────────────────────────────────

function getFullName(r) {
  if (!r) return "";
  const mid = r.middleName ? ` ${r.middleName}` : "";
  return `${r.firstName}${mid} ${r.lastName}`;
}

// ─── component ──────────────────────────────────────────────────────────────

/**
 * ApplicationBarangayClearanceModal
 *
 * Two-panel modal:
 *   Left  → data-entry form (resident picker + overrideable fields)
 *   Right → live preview of the printable certificate
 *
 * Props:
 *   isOpen   — controls visibility
 *   onClose  — called when user dismisses the modal
 */
export default function ApplicationBarangayClearanceModal({ isOpen, onClose }) {
  const printRef = useRef(null);

  // ── resident search state ──────────────────────────────────────────────
  const [residentSearch, setResidentSearch] = useState("");
  const [selectedResident, setSelectedResident] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // ── overrideable fields ────────────────────────────────────────────────
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [purpose, setPurpose] = useState("");
  const [parentName, setParentName] = useState("");

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
      setName("");
      setAddress("");
      setAge("");
      setGender("");
      setPurpose("");
      setParentName("");
      setStage("form");
    }
  }, [isOpen]);

  // auto-fill fields when a resident is picked
  useEffect(() => {
    if (!selectedResident) return;
    setName(getFullName(selectedResident));
    setAddress(getFullAddress(selectedResident.householdId));
    setAge(String(calculateAge(selectedResident.birthDate)));
    setGender(selectedResident.sex || "");
    // auto-fill parent if minor (< 18)
    const resAge = calculateAge(selectedResident.birthDate);
    if (resAge < 18 && selectedResident.parentId) {
      const parent = residents.find((r) => r.residentId === selectedResident.parentId);
      if (parent) setParentName(getFullName(parent));
    } else {
      setParentName("");
    }
  }, [selectedResident]);

  // ── resident dropdown options ────────────────────────────────────────
  const filteredResidents = residentSearch.trim().length === 0
    ? []
    : residents.filter((r) => {
        const full = getFullName(r).toLowerCase();
        const id = r.residentId.toLowerCase();
        const q = residentSearch.toLowerCase();
        return full.includes(q) || id.includes(q);
      }).slice(0, 8);

  // ── preview data object ──────────────────────────────────────────────
  const previewData = { name, address, age, gender, purpose, parentName };

  // ── print handler ────────────────────────────────────────────────────
  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  // ─────────────────────────────────────────────────────────────────────
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(22, 50, 74, 0.55)", backdropFilter: "blur(2px)" }}
    >
      <div
        className="bg-white rounded-xs shadow-2xl border border-[#D1D7CE] flex flex-col"
        style={{ width: "980px", maxWidth: "96vw", maxHeight: "92vh", overflow: "hidden" }}
      >
        {/* ── Header ────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#D1D7CE] bg-[#F9FAF8] flex-shrink-0">
          <div>
            <h2 className="text-base font-serif font-bold text-[#16324A]">
              Application for Barangay Clearance / Certification Slip
            </h2>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-mono mt-0.5">
              APPLICATION_BARANGAY_CLEARANCE
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Stage toggle */}
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

            {/* Close */}
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
        <div className="flex flex-1 overflow-hidden">

          {/* ── Left: Data Entry Form ────────────────────────────────── */}
          <div
            className={`flex flex-col border-r border-[#D1D7CE] overflow-y-auto ${
              stage === "preview" ? "hidden md:flex" : "flex"
            }`}
            style={{ width: "400px", minWidth: "340px" }}
          >
            <div className="p-6 space-y-5 flex-1">

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

                {/* AGE */}
                <FormField label="Age" required>
                  <input
                    type="number"
                    min={0}
                    max={120}
                    className={inputCls}
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="e.g. 25"
                  />
                </FormField>

                {/* GENDER */}
                <FormField label="Gender / Kasarian" required>
                  <select
                    className={inputCls}
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                  >
                    <option value="">Select…</option>
                    <option value="Male">Male / Lalaki</option>
                    <option value="Female">Female / Babae</option>
                  </select>
                </FormField>

                {/* PURPOSE */}
                <FormField label="Purpose" required>
                  <textarea
                    className={`${inputCls} resize-none`}
                    rows={3}
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    placeholder="e.g. Employment, Loan application…"
                  />
                </FormField>

                {/* PARENT/S IF MINOR */}
                <FormField label="Name of Parent/s (if minor)">
                  <input
                    type="text"
                    className={inputCls}
                    value={parentName}
                    onChange={(e) => setParentName(e.target.value)}
                    placeholder="Leave blank if not applicable"
                  />
                </FormField>
              </div>
            </div>

            {/* ── Form action bar ──────────────────────────────────── */}
            <div className="px-6 py-4 border-t border-[#D1D7CE] bg-[#F9FAF8] flex items-center justify-between gap-3 flex-shrink-0">
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
                  disabled={!name || !address || !age || !gender || !purpose}
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
            className={`flex-1 overflow-y-auto bg-[#E8EBE5] flex flex-col items-center py-8 ${
              stage === "form" ? "hidden md:flex" : "flex"
            }`}
          >
            <div className="mb-4 flex items-center gap-3">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
                Print Preview
              </span>
              <button
                onClick={handlePrint}
                disabled={!name || !address || !age || !gender || !purpose}
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

            <div className="shadow-2xl">
              <ApplicationBarangayClearancePreview
                ref={printRef}
                data={previewData}
              />
            </div>

            {(!name || !address || !age || !gender || !purpose) && (
              <p className="mt-4 text-[11px] text-slate-500 font-mono italic">
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
