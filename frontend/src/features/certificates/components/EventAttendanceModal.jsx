import React, { useState, useEffect, useRef } from "react";
import { useData } from "../../../context/DataContext";
import { useAuth } from "@/shared/hooks/useAuth";
import { supabase } from "../../../utils/supabaseClient";
import { logAudit } from "../../../utils/auditLogger";

import pasayLogo from "../../../assets/pasay-logo.png";
import barangayLogo from "../../../assets/barangay-46-logo.png";

function getFullName(r) {
  if (!r) return "";
  const mid = r.middleName ? ` ${r.middleName}` : "";
  return `${r.firstName}${mid} ${r.lastName}`;
}

export default function EventAttendanceModal({ isOpen, onClose }) {
  const { currentUser } = useAuth();
  const { residents, helpers: { getFullAddress } } = useData();

  const [stage, setStage] = useState("form"); // 'form' | 'preview'
  const [formData, setFormData] = useState({
    title: "",
    committee: "Committee on Health",
    eventDate: new Date().toISOString().slice(0, 10),
    eventTime: "08:00 AM - 12:00 PM",
    venue: "Barangay 46 Covered Court",
    goal: "",
    description: "",
    preparedBy: "Committee on Health Head",
    approvedBy: "PERLITA B. ADVINCULA",
    selectedResidentIds: [],
  });

  const [customCommittee, setCustomCommittee] = useState("");
  const [residentSearch, setResidentSearch] = useState("");
  const [createdEvent, setCreatedEvent] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setStage("form");
      setCreatedEvent(null);
      setCustomCommittee("");
      setFormData({
        title: "",
        committee: "Committee on Health",
        eventDate: new Date().toISOString().slice(0, 10),
        eventTime: "08:00 AM - 12:00 PM",
        venue: "Barangay 46 Covered Court",
        goal: "",
        description: "",
        preparedBy: "Committee on Health Head",
        approvedBy: "PERLITA B. ADVINCULA",
        selectedResidentIds: [],
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const next = { ...prev, [name]: value };
      // If changing committee and preparedBy hasn't been completely custom, we could try to auto-update it
      // But to be safe and simple, if it exactly matches the old committee head, we update it.
      if (name === "committee" && prev.preparedBy === `${prev.committee} Head`) {
        next.preparedBy = `${value} Head`;
      }
      return next;
    });
  };

  const toggleResidentSelection = (residentId) => {
    setFormData((prev) => {
      const exists = prev.selectedResidentIds.includes(residentId);
      const updated = exists
        ? prev.selectedResidentIds.filter((id) => id !== residentId)
        : [...prev.selectedResidentIds, residentId];
      return { ...prev, selectedResidentIds: updated };
    });
  };

  const filteredResidentsForSelection = residentSearch.trim() === ""
    ? residents
    : residents.filter((r) => {
        const name = getFullName(r).toLowerCase();
        const id = String(r.residentId || "").toLowerCase();
        const q = residentSearch.toLowerCase();
        return name.includes(q) || id.includes(q);
      });

  const handleCreateAndPreview = async (e) => {
    e.preventDefault();
    const finalCommittee = formData.committee === "Others" ? (customCommittee.trim() || "Others") : formData.committee;
    if (!formData.title || !finalCommittee || !formData.eventDate || !formData.eventTime || !formData.venue) {
      alert("Please fill in all required fields.");
      return;
    }

    setSaving(true);
    const newEventObj = {
      title: formData.title,
      committee: finalCommittee,
      event_date: formData.eventDate,
      event_time: formData.eventTime,
      venue: formData.venue,
      goal: formData.goal,
      description: formData.description,
      prepared_by: formData.preparedBy || `${finalCommittee} Head`,
      approved_by: formData.approvedBy || "PERLITA B. ADVINCULA",
      participants: formData.selectedResidentIds,
      created_at: new Date().toISOString(),
    };

    let record = null;

    try {
      const { data, error } = await supabase
        .from("events")
        .insert([newEventObj])
        .select("*")
        .single();

      if (!error && data) {
        record = data;
      } else {
        record = { ...newEventObj, id: Date.now() };
        const local = JSON.parse(localStorage.getItem("bs_events_db") || "[]");
        localStorage.setItem("bs_events_db", JSON.stringify([record, ...local]));
      }

      await logAudit(
        "events",
        record.id,
        "CREATE",
        currentUser?.userId || null,
        `Created event: ${formData.title} (${formData.committee})`
      );

      setCreatedEvent(record);
      setStage("preview");
    } catch (err) {
      console.error("Error creating event:", err);
      alert("Failed to create event.");
    } finally {
      setSaving(false);
    }
  };

  const handlePrint = async () => {
    try {
      if (createdEvent) {
        await logAudit(
          "events",
          createdEvent.id,
          "PRINT",
          currentUser?.userId || null,
          `Printed event attendance sheet: ${createdEvent.title}`
        );
      }
    } catch (err) {
      console.warn("Failed to log print action:", err);
    }
    window.print();
  };

  // Participant residents list
  const participantIds = createdEvent
    ? (Array.isArray(createdEvent.participants) ? createdEvent.participants : [])
    : formData.selectedResidentIds;
  const participantResidents = participantIds
    .map((id) => residents.find((r) => r.residentId === id))
    .filter(Boolean);

  const minimumRows = Math.max(10, participantResidents.length + 2);
  const extraRowsCount = Math.max(0, minimumRows - participantResidents.length);
  const extraBlankRows = Array.from({ length: extraRowsCount });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#322A2C8c] backdrop-blur-[2px] print:absolute print:inset-0 print:bg-white print:block">
      <style>
        {`@media print {
          @page { margin: 10mm; size: A4 portrait; }
          body { margin: 0; background: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-print { display: none !important; }
          .print-root { width: 100% !important; padding: 0 !important; margin: 0 !important; box-shadow: none !important; }
        }`}
      </style>

      {/* Modal Container */}
      <div className="bg-white border-2 border-[#322A2C] w-full max-w-4xl h-[90vh] rounded-xs overflow-hidden shadow-2xl flex flex-col print:border-none print:h-auto print:max-w-none print:shadow-none">
        
        {/* Header */}
        <div className="bg-[#322A2C] text-white px-6 py-3 flex justify-between items-center no-print flex-shrink-0">
          <div className="flex items-center space-x-2">
            <span className="text-lg"></span>
            <span className="font-serif font-bold text-base">
              {stage === "form" ? "Create Event & Generate Attendance Sheet" : "Official Event Attendance Sheet Preview"}
            </span>
          </div>
          <div className="flex items-center space-x-3">
            {stage === "form" ? (
              <button
                onClick={handleCreateAndPreview}
                disabled={saving}
                className="bg-[#2E5A44] hover:bg-[#234533] text-white text-xs font-semibold px-4 py-1.5 uppercase tracking-wider rounded-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {saving ? "Saving…" : "Generate Attendance Sheet →"}
              </button>
            ) : (
              <>
                <button
                  onClick={() => setStage("form")}
                  className="border border-white/40 text-white hover:bg-white/10 text-xs font-semibold px-3 py-1.5 uppercase tracking-wider rounded-xs transition-colors cursor-pointer"
                >
                  &larr; Back to Form
                </button>
                <button
                  onClick={handlePrint}
                  className="bg-[#2E5A44] hover:bg-[#234533] text-white text-xs font-semibold px-4 py-1.5 uppercase tracking-wider rounded-xs transition-colors cursor-pointer flex items-center space-x-1"
                >
                  <span></span>
                  <span>Print Now</span>
                </button>
              </>
            )}
            <button onClick={onClose} className="text-slate-300 hover:text-white text-xl font-bold cursor-pointer">
              &times;
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-white font-sans">
          {stage === "form" ? (
            <form onSubmit={handleCreateAndPreview} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 flex flex-col">
                  <label className="text-[10px] uppercase font-mono font-bold text-slate-500 mb-1">
                    Event Title <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    required
                    placeholder="e.g. Barangay Health & Medical Mission 2026"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="border border-[#D1D7CE] bg-[#FFF8F8] focus:bg-white text-[#322A2C] rounded-xs text-xs px-3 py-2 focus:outline-none focus:border-[#322A2C]"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-[10px] uppercase font-mono font-bold text-slate-500 mb-1">
                    Committee <span className="text-red-600">*</span>
                  </label>
                  <select
                    name="committee"
                    required
                    value={formData.committee}
                    onChange={handleInputChange}
                    className="border border-[#D1D7CE] bg-[#FFF8F8] focus:bg-white text-[#322A2C] rounded-xs text-xs px-3 py-2 focus:outline-none focus:border-[#322A2C] cursor-pointer"
                  >
                    <option value="Committee on Health">Committee on Health</option>
                    <option value="Committee on Youth & Sports">Committee on Youth &amp; Sports</option>
                    <option value="Committee on Senior Citizens & PWD">Committee on Senior Citizens &amp; PWD</option>
                    <option value="Committee on Education">Committee on Education</option>
                    <option value="Committee on Livelihood & Commerce">Committee on Livelihood &amp; Commerce</option>
                    <option value="Committee on Peace & Order">Committee on Peace &amp; Order</option>
                    <option value="Committee on Infrastructure">Committee on Infrastructure</option>
                    <option value="Sangguniang Kabataan (SK)">Sangguniang Kabataan (SK)</option>
                    <option value="Executive Office">Executive Office</option>
                    <option value="Others">Others (Specify)</option>
                  </select>
                  {formData.committee === "Others" && (
                    <div className="mt-2">
                      <label className="text-[10px] uppercase font-mono font-bold text-[#E8198A] mb-1 block">
                        Specify Committee Name <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Committee on Women & Family"
                        value={customCommittee}
                        onChange={(e) => setCustomCommittee(e.target.value)}
                        className="w-full border border-[#D1D7CE] bg-white focus:bg-white text-[#322A2C] rounded-xs text-xs px-3 py-2 focus:outline-none focus:border-[#322A2C]"
                      />
                    </div>
                  )}
                </div>

                <div className="flex flex-col">
                  <label className="text-[10px] uppercase font-mono font-bold text-slate-500 mb-1">
                    Date <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="date"
                    name="eventDate"
                    required
                    value={formData.eventDate}
                    onChange={handleInputChange}
                    className="border border-[#D1D7CE] bg-[#FFF8F8] focus:bg-white text-[#322A2C] rounded-xs text-xs px-3 py-2 focus:outline-none focus:border-[#322A2C]"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-[10px] uppercase font-mono font-bold text-slate-500 mb-1">
                    Time <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="eventTime"
                    required
                    placeholder="e.g. 08:00 AM - 12:00 PM"
                    value={formData.eventTime}
                    onChange={handleInputChange}
                    className="border border-[#D1D7CE] bg-[#FFF8F8] focus:bg-white text-[#322A2C] rounded-xs text-xs px-3 py-2 focus:outline-none focus:border-[#322A2C]"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-[10px] uppercase font-mono font-bold text-slate-500 mb-1">
                    Venue <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="venue"
                    required
                    placeholder="e.g. Barangay 46 Covered Court"
                    value={formData.venue}
                    onChange={handleInputChange}
                    className="border border-[#D1D7CE] bg-[#FFF8F8] focus:bg-white text-[#322A2C] rounded-xs text-xs px-3 py-2 focus:outline-none focus:border-[#322A2C]"
                  />
                </div>

                <div className="col-span-2 flex flex-col">
                  <label className="text-[10px] uppercase font-mono font-bold text-slate-500 mb-1">Goal / Objective</label>
                  <input
                    type="text"
                    name="goal"
                    placeholder="e.g. Provide free medical checkup to senior citizens"
                    value={formData.goal}
                    onChange={handleInputChange}
                    className="border border-[#D1D7CE] bg-[#FFF8F8] focus:bg-white text-[#322A2C] rounded-xs text-xs px-3 py-2 focus:outline-none focus:border-[#322A2C]"
                  />
                </div>

                <div className="col-span-2 flex flex-col">
                  <label className="text-[10px] uppercase font-mono font-bold text-slate-500 mb-1">Description</label>
                  <textarea
                    name="description"
                    placeholder="Any additional details..."
                    value={formData.description}
                    onChange={handleInputChange}
                    className="border border-[#D1D7CE] bg-[#FFF8F8] focus:bg-white text-[#322A2C] rounded-xs text-xs px-3 py-2 focus:outline-none focus:border-[#322A2C] min-h-[60px]"
                  />
                </div>

                {/* Prepared By & Approved By */}
                <div className="flex flex-col">
                  <label className="text-[10px] uppercase font-mono font-bold text-slate-500 mb-1">
                    Prepared By (Signatory)
                  </label>
                  <input
                    type="text"
                    name="preparedBy"
                    value={formData.preparedBy}
                    onChange={handleInputChange}
                    className="border border-[#D1D7CE] bg-[#FFF8F8] focus:bg-white text-[#322A2C] rounded-xs text-xs px-3 py-2 focus:outline-none focus:border-[#322A2C]"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-[10px] uppercase font-mono font-bold text-slate-500 mb-1">
                    Approved By (Signatory)
                  </label>
                  <input
                    type="text"
                    name="approvedBy"
                    value={formData.approvedBy}
                    onChange={handleInputChange}
                    className="border border-[#D1D7CE] bg-[#FFF8F8] focus:bg-white text-[#322A2C] rounded-xs text-xs px-3 py-2 focus:outline-none focus:border-[#322A2C]"
                  />
                </div>
              </div>

              {/* Resident Selector */}
              <div className="border border-[#D1D7CE] rounded-xs p-4 bg-[#FFF8F8] space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-serif font-bold text-[#322A2C] uppercase tracking-wider flex items-center space-x-1.5">
                    <span></span>
                    <span>Registered / Interested Residents ({formData.selectedResidentIds.length} Selected)</span>
                  </h4>
                </div>

                <input
                  type="text"
                  placeholder="Filter residents by name or ID…"
                  value={residentSearch}
                  onChange={(e) => setResidentSearch(e.target.value)}
                  className="w-full border border-[#D1D7CE] bg-white text-[#322A2C] rounded-xs text-xs px-3 py-1.5 focus:outline-none focus:border-[#322A2C]"
                />

                <div className="max-h-48 overflow-y-auto border border-[#D1D7CE] bg-white rounded-xs divide-y divide-[#D1D7CE]/40">
                  {filteredResidentsForSelection.map((r) => {
                    const isChecked = formData.selectedResidentIds.includes(r.residentId);
                    return (
                      <label
                        key={r.residentId}
                        className={`flex items-center justify-between p-2 text-xs hover:bg-[#FFF8F8] cursor-pointer ${
                          isChecked ? "bg-[#2E5A44]/5 font-semibold" : ""
                        }`}
                      >
                        <div className="flex items-center space-x-2.5">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleResidentSelection(r.residentId)}
                            className="accent-[#2E5A44]"
                          />
                          <span className="text-[#322A2C]">{getFullName(r)}</span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">{r.residentId}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </form>
          ) : (
            /* Printable Preview */
            <div id="event-attendance-print-root" className="w-[210mm] mx-auto bg-white text-black p-8 relative print-root font-serif">
              {/* Header */}
              <div className="flex justify-between items-center border-b-2 border-black pb-4 mb-6">
                <div className="w-20 h-20 flex-shrink-0">
                  <img src={pasayLogo} alt="Pasay Logo" className="w-full h-full object-contain" />
                </div>
                <div className="text-center flex-1 px-4 leading-tight">
                  <p className="text-xs uppercase font-sans tracking-wide">Republic of the Philippines</p>
                  <p className="text-sm font-bold font-serif uppercase mt-0.5">OFFICE OF THE SANGGUNIANG BARANGAY</p>
                  <p className="text-xs uppercase font-bold text-[#322A2C]">BARANGAY 46, ZONE 06</p>
                  <p className="text-xs italic font-sans">Pasay City, Metro Manila</p>
                </div>
                <div className="w-20 h-20 flex-shrink-0">
                  <img src={barangayLogo} alt="Barangay Logo" className="w-full h-full object-contain" />
                </div>
              </div>

              {/* Title */}
              <div className="text-center mb-6">
                <h1
                  className="text-2xl font-bold uppercase tracking-wider"
                  style={{ color: "#4a0000", transform: "scaleY(1.1)" }}
                >
                  OFFICIAL EVENT ATTENDANCE SHEET
                </h1>
                <p className="text-xs text-slate-600 italic mt-1 font-sans">
                  Barangay Community Program &amp; Activity Registration Log
                </p>
              </div>

              {/* Details Box */}
              <div className="border border-black p-4 mb-6 text-xs leading-relaxed font-sans bg-[#FFF8F8] rounded-xs">
                <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                  <div>
                    <span className="font-mono font-bold text-slate-500 uppercase">Event Title:</span>{" "}
                    <strong className="font-serif text-sm text-[#322A2C]">{(createdEvent || formData).title}</strong>
                  </div>
                  <div>
                    <span className="font-mono font-bold text-slate-500 uppercase">Committee:</span>{" "}
                    <strong className="font-serif text-xs">{(createdEvent || formData).committee}</strong>
                  </div>
                  <div>
                    <span className="font-mono font-bold text-slate-500 uppercase">Date &amp; Time:</span>{" "}
                    <strong>{(createdEvent || formData).event_date || (createdEvent || formData).eventDate} @ {(createdEvent || formData).event_time || (createdEvent || formData).eventTime}</strong>
                  </div>
                  <div>
                    <span className="font-mono font-bold text-slate-500 uppercase">Venue:</span>{" "}
                    <strong>{(createdEvent || formData).venue}</strong>
                  </div>
                  {(createdEvent || formData).goal && (
                    <div className="col-span-2 border-t border-slate-300 pt-1.5 mt-1">
                      <span className="font-mono font-bold text-slate-500 uppercase">Goal:</span>{" "}
                      <span className="italic">{(createdEvent || formData).goal}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Attendance Table */}
              <table className="w-full border-collapse border border-black text-xs font-sans mb-8">
                <thead>
                  <tr className="bg-[#322A2C] text-white">
                    <th className="border border-black py-2 px-2 text-center w-8 font-mono">#</th>
                    <th className="border border-black py-2 px-3 text-left w-24 font-mono">Resident ID</th>
                    <th className="border border-black py-2 px-3 text-left font-bold">Full Name</th>
                    <th className="border border-black py-2 px-3 text-left">Address / Sector</th>
                    <th className="border border-black py-2 px-3 text-left w-28">Contact No.</th>
                    <th className="border border-black py-2 px-3 text-center w-36">Signature</th>
                  </tr>
                </thead>
                <tbody>
                  {participantResidents.map((r, index) => (
                    <tr key={r.residentId} className="even:bg-slate-50/50">
                      <td className="border border-black py-2 px-2 text-center font-mono text-[11px]">{index + 1}</td>
                      <td className="border border-black py-2 px-3 font-mono text-[10px] font-semibold text-slate-600">{r.residentId}</td>
                      <td className="border border-black py-2 px-3 font-serif font-bold text-sm text-[#322A2C]">{getFullName(r)}</td>
                      <td className="border border-black py-2 px-3 text-[11px]">{getFullAddress(r.householdId) || "Barangay 46"}</td>
                      <td className="border border-black py-2 px-3 font-mono text-[11px]">{r.contactNumber || "—"}</td>
                      <td className="border border-black py-2 px-3"></td>
                    </tr>
                  ))}
                  {extraBlankRows.map((_, i) => (
                    <tr key={`blank-${i}`}>
                      <td className="border border-black py-2.5 px-2 text-center font-mono text-[11px] text-slate-400">{participantResidents.length + i + 1}</td>
                      <td className="border border-black py-2.5 px-3"></td>
                      <td className="border border-black py-2.5 px-3"></td>
                      <td className="border border-black py-2.5 px-3"></td>
                      <td className="border border-black py-2.5 px-3"></td>
                      <td className="border border-black py-2.5 px-3"></td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Footer */}
              <div className="mt-12 pt-4 border-t border-slate-400 flex justify-between items-end text-xs font-sans">
                <div>
                  <p className="font-mono text-[10px] uppercase font-bold text-slate-400 mb-6">Prepared By:</p>
                  <div className="w-56 border-b border-black text-center pb-1">
                    <span className="font-serif font-bold text-sm text-[#322A2C]">{(createdEvent && createdEvent.prepared_by) || formData.preparedBy || `${(createdEvent || formData).committee} Head`}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 text-center mt-1">Event Coordinator / Committee Chair</p>
                </div>
                <div className="text-center italic text-[11px] font-serif text-slate-500">
                  Official Document &bull; Not valid without seal
                </div>
                <div>
                  <p className="font-mono text-[10px] uppercase font-bold text-slate-400 mb-6 text-right">Noted &amp; Approved By:</p>
                  <div className="w-56 border-b border-black text-center pb-1">
                    <span className="font-serif font-bold text-sm text-[#322A2C]">{(createdEvent && createdEvent.approved_by) || formData.approvedBy || "PERLITA B. ADVINCULA"}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 text-center mt-1">Punong Barangay</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
