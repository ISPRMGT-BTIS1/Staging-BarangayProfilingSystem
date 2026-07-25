import React, { useState, useEffect, useRef } from "react";
import { useData } from "../context/DataContext";
import { useAuth } from "@/shared/hooks/useAuth";
import { supabase } from "../utils/supabaseClient";
import { logAudit } from "../utils/auditLogger";

// Logos matching certificate templates
const pasayLogo = new URL("../assets/pasay-logo.jpg", import.meta.url).href;
const barangayLogo = new URL("../assets/barangay-46-logo.jpeg", import.meta.url).href;

function getFullName(r) {
  if (!r) return "";
  const mid = r.middleName ? ` ${r.middleName}` : "";
  return `${r.firstName}${mid} ${r.lastName}`;
}

export default function EventsView() {
  const { currentUser } = useAuth();
  const { residents, helpers: { getFullAddress, getResidentShortName } } = useData();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [selectedEventForPrint, setSelectedEventForPrint] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    committee: "Committee on Health",
    eventDate: "",
    eventTime: "",
    venue: "Barangay 46 Covered Court",
    goal: "",
    description: "",
    selectedResidentIds: [], // List of resident IDs interested/participating
  });

  const [residentSearch, setResidentSearch] = useState("");
  const [saving, setSaving] = useState(false);

  // Fetch events from Supabase or fallback to local storage
  const fetchEvents = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setEvents(data);
      } else {
        // Fallback to localStorage if table doesn't exist yet
        const local = localStorage.getItem("bs_events_db");
        if (local) {
          setEvents(JSON.parse(local));
        }
      }
    } catch (err) {
      console.warn("Failed to fetch events from Supabase, using local fallback", err);
      const local = localStorage.getItem("bs_events_db");
      if (local) setEvents(JSON.parse(local));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Toggle resident participation
  const toggleResidentSelection = (residentId) => {
    setFormData((prev) => {
      const exists = prev.selectedResidentIds.includes(residentId);
      const updated = exists
        ? prev.selectedResidentIds.filter((id) => id !== residentId)
        : [...prev.selectedResidentIds, residentId];
      return { ...prev, selectedResidentIds: updated };
    });
  };

  const selectAllFilteredResidents = () => {
    const ids = filteredResidentsForSelection.map((r) => r.residentId);
    setFormData((prev) => ({
      ...prev,
      selectedResidentIds: Array.from(new Set([...prev.selectedResidentIds, ...ids])),
    }));
  };

  const clearSelectedResidents = () => {
    setFormData((prev) => ({ ...prev, selectedResidentIds: [] }));
  };

  // Handle Event Creation
  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.committee || !formData.eventDate || !formData.eventTime || !formData.venue) {
      alert("Please fill in all required event fields (Title, Committee, Date, Time, Venue).");
      return;
    }

    setSaving(true);
    const newEventObj = {
      title: formData.title,
      committee: formData.committee,
      event_date: formData.eventDate,
      event_time: formData.eventTime,
      venue: formData.venue,
      goal: formData.goal,
      description: formData.description,
      participants: formData.selectedResidentIds,
      created_at: new Date().toISOString(),
    };

    let createdRecord = null;

    try {
      const { data, error } = await supabase
        .from("events")
        .insert([newEventObj])
        .select("*")
        .single();

      if (!error && data) {
        createdRecord = data;
      } else {
        // Fallback to local storage
        const newId = Date.now();
        createdRecord = { ...newEventObj, id: newId };
        const local = JSON.parse(localStorage.getItem("bs_events_db") || "[]");
        const updatedLocal = [createdRecord, ...local];
        localStorage.setItem("bs_events_db", JSON.stringify(updatedLocal));
      }

      await logAudit(
        "events",
        createdRecord.id,
        "CREATE",
        currentUser?.userId || null,
        `Created event: ${formData.title} (${formData.committee})`
      );

      setShowCreateModal(false);
      fetchEvents();

      // Reset Form
      setFormData({
        title: "",
        committee: "Committee on Health",
        eventDate: "",
        eventTime: "",
        venue: "Barangay 46 Covered Court",
        goal: "",
        description: "",
        selectedResidentIds: [],
      });

      // Prompt to automatically print attendance sheet
      setSelectedEventForPrint(createdRecord);
      setShowPrintModal(true);

    } catch (err) {
      console.error("Error creating event:", err);
      alert("Failed to create event.");
    } finally {
      setSaving(false);
    }
  };

  // Delete event
  const handleDeleteEvent = async (eventId, title) => {
    if (!confirm(`Are you sure you want to delete event "${title}"?`)) return;

    try {
      const { error } = await supabase.from("events").delete().eq("id", eventId);
      if (error) {
        // Fallback local
        const local = JSON.parse(localStorage.getItem("bs_events_db") || "[]");
        const filtered = local.filter((e) => e.id !== eventId);
        localStorage.setItem("bs_events_db", JSON.stringify(filtered));
      }
      await logAudit("events", eventId, "DELETE", currentUser?.userId || null, `Deleted event: ${title}`);
      fetchEvents();
    } catch (err) {
      console.error("Error deleting event:", err);
    }
  };

  // Filtered residents list for modal picker
  const filteredResidentsForSelection = residentSearch.trim() === ""
    ? residents
    : residents.filter((r) => {
        const name = getFullName(r).toLowerCase();
        const id = String(r.residentId || "").toLowerCase();
        const q = residentSearch.toLowerCase();
        return name.includes(q) || id.includes(q);
      });

  // Filtered events for view table
  const filteredEvents = events.filter((ev) => {
    const q = searchQuery.toLowerCase();
    return (
      ev.title?.toLowerCase().includes(q) ||
      ev.committee?.toLowerCase().includes(q) ||
      ev.venue?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex-1 p-6 overflow-y-auto space-y-6">
      {/* View Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-serif text-[#16324A]">Barangay Events &amp; Attendance</h1>
          <p className="text-sm text-slate-500 font-sans">
            Schedule community programs, register interested residents, and print official attendance sheets
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-[#16324A] hover:bg-[#1f4260] text-white px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-xs cursor-pointer shadow-sm hover:shadow transition-all inline-flex items-center space-x-2 border border-transparent"
        >
          <span>📅</span>
          <span>+ Create Event</span>
        </button>
      </div>

      {/* Control Bar & Search */}
      <section className="bg-white border border-[#D1D7CE] p-4 rounded-xs flex flex-wrap gap-4 items-center justify-between shadow-2xs">
        <div className="flex items-center space-x-3 flex-1 max-w-md">
          <label className="text-[10px] uppercase font-mono font-bold text-slate-400">Search Events</label>
          <input
            type="text"
            placeholder="Search by title, committee, venue…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border border-[#D1D7CE] bg-[#F2F4F1] focus:bg-white text-[#16324A] rounded-xs text-xs px-3 py-1.5 focus:outline-none focus:border-[#16324A] flex-1"
          />
        </div>
        <div className="text-xs font-mono font-semibold text-slate-500">
          Showing <span className="text-[#16324A] font-bold">{filteredEvents.length}</span> of {events.length} events
        </div>
      </section>

      {/* Events Table / Ledger */}
      <section className="ledger-container">
        {loading ? (
          <div className="text-center py-12 text-slate-400 font-serif italic text-sm">Loading events database…</div>
        ) : (
          <table className="ledger-table w-full">
            <thead>
              <tr>
                <th>Event Title</th>
                <th>Committee</th>
                <th>Date &amp; Time</th>
                <th>Venue</th>
                <th>Goal</th>
                <th className="text-center">Participants</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-10 text-slate-400 font-serif italic bg-white">
                    No scheduled events found. Click "+ Create Event" to add one.
                  </td>
                </tr>
              ) : (
                filteredEvents.map((ev) => {
                  const participantCount = Array.isArray(ev.participants) ? ev.participants.length : 0;
                  return (
                    <tr key={ev.id}>
                      <td>
                        <div className="font-bold text-[#16324A] text-sm flex items-center space-x-1.5">
                          <span>📌</span>
                          <span>{ev.title}</span>
                        </div>
                        {ev.description && (
                          <div className="text-[11px] text-slate-400 font-sans mt-0.5 line-clamp-1 max-w-xs">
                            {ev.description}
                          </div>
                        )}
                      </td>
                      <td className="text-xs font-semibold text-slate-600 font-serif">
                        <span className="bg-[#16324A]/5 border border-[#16324A]/15 px-2 py-0.5 rounded-xs text-[#16324A]">
                          {ev.committee}
                        </span>
                      </td>
                      <td className="text-xs font-mono text-slate-600">
                        <div className="font-bold">{ev.event_date || ev.eventDate}</div>
                        <div className="text-[10px] text-slate-400">{ev.event_time || ev.eventTime}</div>
                      </td>
                      <td className="text-xs text-slate-600">{ev.venue}</td>
                      <td className="text-xs text-slate-500 max-w-[200px]">
                        <span className="block truncate" title={ev.goal}>
                          {ev.goal || "—"}
                        </span>
                      </td>
                      <td className="text-center">
                        <span className="inline-block bg-[#2E5A44]/10 text-[#2E5A44] border border-[#2E5A44]/30 px-2 py-0.5 rounded-sm font-mono text-xs font-bold">
                          {participantCount} Interested
                        </span>
                      </td>
                      <td className="text-right space-x-2 whitespace-nowrap">
                        <button
                          onClick={() => {
                            setSelectedEventForPrint(ev);
                            setShowPrintModal(true);
                          }}
                          className="bg-[#16324A] hover:bg-[#1f4260] text-white text-[10px] px-2.5 py-1 uppercase font-semibold rounded-xs transition-colors cursor-pointer inline-flex items-center space-x-1"
                        >
                          <span>🖨️</span>
                          <span>Print Attendance</span>
                        </button>
                        <button
                          onClick={() => handleDeleteEvent(ev.id, ev.title)}
                          className="border border-[#9B3D30] text-[#9B3D30] hover:bg-[#9B3D30] hover:text-white text-[10px] px-2.5 py-1 uppercase font-semibold rounded-xs transition-colors cursor-pointer"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </section>

      {/* ── CREATE EVENT MODAL ──────────────────────────────────────────────── */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-[#16324A]/60 flex items-center justify-center p-4 z-50 backdrop-blur-xs">
          <div className="bg-white border-2 border-[#16324A] w-full max-w-3xl rounded-xs overflow-hidden shadow-xl flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="bg-[#16324A] text-white px-6 py-4 flex justify-between items-center flex-shrink-0">
              <h3 className="font-serif font-bold text-lg flex items-center space-x-2">
                <span>🗓️</span>
                <span>Create New Barangay Event</span>
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-300 hover:text-white text-xl font-bold cursor-pointer"
              >
                &times;
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateEvent} className="p-6 space-y-4 overflow-y-auto flex-1 font-sans">
              <div className="grid grid-cols-2 gap-4">
                {/* Title */}
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
                    className="border border-[#D1D7CE] bg-[#F2F4F1] focus:bg-white text-[#16324A] rounded-xs text-xs px-3 py-2 focus:outline-none focus:border-[#16324A]"
                  />
                </div>

                {/* Committee */}
                <div className="flex flex-col">
                  <label className="text-[10px] uppercase font-mono font-bold text-slate-500 mb-1">
                    Committee <span className="text-red-600">*</span>
                  </label>
                  <select
                    name="committee"
                    required
                    value={formData.committee}
                    onChange={handleInputChange}
                    className="border border-[#D1D7CE] bg-[#F2F4F1] focus:bg-white text-[#16324A] rounded-xs text-xs px-3 py-2 focus:outline-none focus:border-[#16324A] cursor-pointer"
                  >
                    <option value="Committee on Health">Committee on Health</option>
                    <option value="Committee on Youth & Sports">Committee on Youth &amp; Sports</option>
                    <option value="Committee on Senior Citizens & PWD">Committee on Senior Citizens &amp; PWD</option>
                    <option value="Committee on Education">Committee on Education</option>
                    <option value="Committee on Livelihood & Commerce">Committee on Livelihood &amp; Commerce</option>
                    <option value="Committee on Peace & Order">Committee on Peace &amp; Order</option>
                    <option value="Committee on Infrastructure & Cleanliness">Committee on Infrastructure</option>
                    <option value="Sangguniang Kabataan (SK)">Sangguniang Kabataan (SK)</option>
                    <option value="Executive Office">Executive Office</option>
                  </select>
                </div>

                {/* Date */}
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
                    className="border border-[#D1D7CE] bg-[#F2F4F1] focus:bg-white text-[#16324A] rounded-xs text-xs px-3 py-2 focus:outline-none focus:border-[#16324A]"
                  />
                </div>

                {/* Time */}
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
                    className="border border-[#D1D7CE] bg-[#F2F4F1] focus:bg-white text-[#16324A] rounded-xs text-xs px-3 py-2 focus:outline-none focus:border-[#16324A]"
                  />
                </div>

                {/* Venue */}
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
                    className="border border-[#D1D7CE] bg-[#F2F4F1] focus:bg-white text-[#16324A] rounded-xs text-xs px-3 py-2 focus:outline-none focus:border-[#16324A]"
                  />
                </div>

                {/* Goal */}
                <div className="col-span-2 flex flex-col">
                  <label className="text-[10px] uppercase font-mono font-bold text-slate-500 mb-1">
                    Goal / Objective
                  </label>
                  <input
                    type="text"
                    name="goal"
                    placeholder="e.g. Provide free medical check-up, eye exam, and vitamins to 150 residents"
                    value={formData.goal}
                    onChange={handleInputChange}
                    className="border border-[#D1D7CE] bg-[#F2F4F1] focus:bg-white text-[#16324A] rounded-xs text-xs px-3 py-2 focus:outline-none focus:border-[#16324A]"
                  />
                </div>

                {/* Description */}
                <div className="col-span-2 flex flex-col">
                  <label className="text-[10px] uppercase font-mono font-bold text-slate-500 mb-1">
                    Description &amp; Guidelines
                  </label>
                  <textarea
                    name="description"
                    rows={2}
                    placeholder="Provide additional context or requirements for participants…"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="border border-[#D1D7CE] bg-[#F2F4F1] focus:bg-white text-[#16324A] rounded-xs text-xs px-3 py-2 focus:outline-none focus:border-[#16324A]"
                  />
                </div>
              </div>

              {/* Resident Participants Selector */}
              <div className="border border-[#D1D7CE] rounded-xs p-4 bg-[#F9FAF8] space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-xs font-serif font-bold text-[#16324A] uppercase tracking-wider flex items-center space-x-1.5">
                      <span>👥</span>
                      <span>Registered / Interested Participants List ({formData.selectedResidentIds.length} Selected)</span>
                    </h4>
                    <p className="text-[10px] text-slate-400 font-sans">
                      Select residents who registered or expressed interest to participate. Their details will be pre-filled on the printed attendance sheet.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={selectAllFilteredResidents}
                      className="text-[10px] font-mono text-[#16324A] hover:underline font-bold"
                    >
                      Select All Filtered
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      type="button"
                      onClick={clearSelectedResidents}
                      className="text-[10px] font-mono text-red-600 hover:underline font-bold"
                    >
                      Clear All
                    </button>
                  </div>
                </div>

                {/* Search bar */}
                <input
                  type="text"
                  placeholder="Filter residents by name or ID to select…"
                  value={residentSearch}
                  onChange={(e) => setResidentSearch(e.target.value)}
                  className="w-full border border-[#D1D7CE] bg-white text-[#16324A] rounded-xs text-xs px-3 py-1.5 focus:outline-none focus:border-[#16324A]"
                />

                {/* Resident Selection Checklist */}
                <div className="max-h-48 overflow-y-auto border border-[#D1D7CE] bg-white rounded-xs divide-y divide-[#D1D7CE]/40">
                  {filteredResidentsForSelection.length === 0 ? (
                    <div className="p-3 text-center text-xs text-slate-400 italic">No matching residents found</div>
                  ) : (
                    filteredResidentsForSelection.map((r) => {
                      const isChecked = formData.selectedResidentIds.includes(r.residentId);
                      return (
                        <label
                          key={r.residentId}
                          className={`flex items-center justify-between p-2 text-xs hover:bg-[#F2F4F1] cursor-pointer transition-colors ${
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
                            <span className="text-[#16324A]">{getFullName(r)}</span>
                          </div>
                          <div className="flex items-center space-x-3 text-[10px] font-mono text-slate-400">
                            <span>{r.residentId}</span>
                            <span>&bull;</span>
                            <span>{r.sex}</span>
                          </div>
                        </label>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-3 border-t border-[#D1D7CE]/40 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="border border-slate-300 text-slate-500 hover:text-slate-800 text-xs font-semibold px-4 py-2 uppercase tracking-wider rounded-xs cursor-pointer hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-[#16324A] hover:bg-[#1f4260] text-white text-xs font-semibold px-5 py-2 uppercase tracking-wider rounded-xs cursor-pointer transition-colors disabled:opacity-50 inline-flex items-center space-x-1.5"
                >
                  <span>{saving ? "Saving…" : "Save Event & Print Attendance"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── PRINT ATTENDANCE SHEET MODAL & PREVIEW ──────────────────────────── */}
      {showPrintModal && selectedEventForPrint && (
        <PrintAttendanceModal
          event={selectedEventForPrint}
          residents={residents}
          getFullAddress={getFullAddress}
          onClose={() => {
            setShowPrintModal(false);
            setSelectedEventForPrint(null);
          }}
        />
      )}
    </div>
  );
}

// ─── PRINT ATTENDANCE SHEET MODAL COMPONENT ─────────────────────────────────
function PrintAttendanceModal({ event, residents, getFullAddress, onClose }) {
  const printRef = useRef(null);

  const handlePrint = () => {
    window.print();
  };

  // Resolve participants from resident IDs
  const participantIds = Array.isArray(event.participants) ? event.participants : [];
  const participantResidents = participantIds
    .map((id) => residents.find((r) => r.residentId === id))
    .filter(Boolean);

  // Pad table with extra blank rows for walk-in sign-ins (minimum 15 total rows)
  const minimumRows = Math.max(15, participantResidents.length + 5);
  const extraRowsCount = Math.max(0, minimumRows - participantResidents.length);
  const extraBlankRows = Array.from({ length: extraRowsCount });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#16324a8c] backdrop-blur-[2px] print:absolute print:inset-0 print:bg-white print:block">
      {/* Print Stylesheet */}
      <style>
        {`@media print {
          @page { margin: 10mm; size: A4 portrait; }
          body { margin: 0; background: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-print { display: none !important; }
          .print-container { width: 100% !important; padding: 0 !important; margin: 0 !important; box-shadow: none !important; }
        }`}
      </style>

      {/* Modal Card wrapper */}
      <div className="bg-white border-2 border-[#16324A] w-full max-w-4xl h-[90vh] rounded-xs overflow-hidden shadow-2xl flex flex-col print:border-none print:h-auto print:max-w-none print:shadow-none">
        {/* Modal Action Header (Hidden during print) */}
        <div className="bg-[#16324A] text-white px-6 py-3 flex justify-between items-center no-print flex-shrink-0">
          <div className="flex items-center space-x-2">
            <span className="text-lg">🖨️</span>
            <span className="font-serif font-bold text-base">Print Event Attendance Sheet</span>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handlePrint}
              className="bg-[#2E5A44] hover:bg-[#234533] text-white text-xs font-semibold px-4 py-1.5 uppercase tracking-wider rounded-xs transition-colors cursor-pointer flex items-center space-x-1"
            >
              <span>🖨️</span>
              <span>Print Now</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-300 hover:text-white text-xl font-bold cursor-pointer"
            >
              &times;
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="flex-1 overflow-y-auto p-8 bg-white text-black font-serif print:p-0 print-container">
          <div ref={printRef} className="w-[210mm] min-h-[297mm] mx-auto bg-white text-black p-8 relative">
            
            {/* Header Logos */}
            <div className="flex justify-between items-center border-b-2 border-black pb-4 mb-6">
              <div className="w-20 h-20 flex-shrink-0">
                <img src={pasayLogo} alt="Pasay Logo" className="w-full h-full object-contain" />
              </div>

              <div className="text-center flex-1 px-4 leading-tight">
                <p className="text-xs uppercase font-sans tracking-wide">Republic of the Philippines</p>
                <p className="text-sm font-bold font-serif uppercase mt-0.5">OFFICE OF THE SANGGUNIANG BARANGAY</p>
                <p className="text-xs uppercase font-bold text-[#16324A]">BARANGAY 46, ZONE 06</p>
                <p className="text-xs italic font-sans">Pasay City, Metro Manila</p>
              </div>

              <div className="w-20 h-20 flex-shrink-0">
                <img src={barangayLogo} alt="Barangay Logo" className="w-full h-full object-contain" />
              </div>
            </div>

            {/* Document Title (Dark Maroon matching certificate heading style) */}
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

            {/* Event Summary Details Box */}
            <div className="border border-black p-4 mb-6 text-xs leading-relaxed font-sans bg-[#F9FAF8] rounded-xs">
              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                <div>
                  <span className="font-mono font-bold text-slate-500 uppercase">Event Title:</span>{" "}
                  <strong className="font-serif text-sm text-[#16324A]">{event.title}</strong>
                </div>
                <div>
                  <span className="font-mono font-bold text-slate-500 uppercase">Committee:</span>{" "}
                  <strong className="font-serif text-xs">{event.committee}</strong>
                </div>
                <div>
                  <span className="font-mono font-bold text-slate-500 uppercase">Date &amp; Time:</span>{" "}
                  <strong>{event.event_date || event.eventDate} @ {event.event_time || event.eventTime}</strong>
                </div>
                <div>
                  <span className="font-mono font-bold text-slate-500 uppercase">Venue:</span>{" "}
                  <strong>{event.venue}</strong>
                </div>
                {event.goal && (
                  <div className="col-span-2 border-t border-slate-300 pt-1.5 mt-1">
                    <span className="font-mono font-bold text-slate-500 uppercase">Program Goal:</span>{" "}
                    <span className="italic">{event.goal}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Attendance List Table */}
            <table className="w-full border-collapse border border-black text-xs font-sans mb-8">
              <thead>
                <tr className="bg-[#16324A] text-white">
                  <th className="border border-black py-2 px-2 text-center w-8 font-mono">#</th>
                  <th className="border border-black py-2 px-3 text-left w-24 font-mono">Resident ID</th>
                  <th className="border border-black py-2 px-3 text-left font-bold">Full Name</th>
                  <th className="border border-black py-2 px-3 text-left">Address / Sector</th>
                  <th className="border border-black py-2 px-3 text-left w-28">Contact No.</th>
                  <th className="border border-black py-2 px-3 text-center w-36">Signature</th>
                </tr>
              </thead>
              <tbody>
                {participantResidents.map((r, index) => {
                  const addr = getFullAddress(r.householdId);
                  return (
                    <tr key={r.residentId} className="even:bg-slate-50/50">
                      <td className="border border-black py-2 px-2 text-center font-mono text-[11px]">
                        {index + 1}
                      </td>
                      <td className="border border-black py-2 px-3 font-mono text-[10px] font-semibold text-slate-600">
                        {r.residentId}
                      </td>
                      <td className="border border-black py-2 px-3 font-serif font-bold text-sm text-[#16324A]">
                        {getFullName(r)}
                      </td>
                      <td className="border border-black py-2 px-3 text-[11px]">
                        {addr || "Barangay 46"}
                      </td>
                      <td className="border border-black py-2 px-3 font-mono text-[11px]">
                        {r.contactNumber || "—"}
                      </td>
                      <td className="border border-black py-2 px-3"></td>
                    </tr>
                  );
                })}

                {/* Extra blank rows for walk-ins / manual signatures */}
                {extraBlankRows.map((_, i) => {
                  const rowNum = participantResidents.length + i + 1;
                  return (
                    <tr key={`blank-${i}`}>
                      <td className="border border-black py-2.5 px-2 text-center font-mono text-[11px] text-slate-400">
                        {rowNum}
                      </td>
                      <td className="border border-black py-2.5 px-3"></td>
                      <td className="border border-black py-2.5 px-3"></td>
                      <td className="border border-black py-2.5 px-3"></td>
                      <td className="border border-black py-2.5 px-3"></td>
                      <td className="border border-black py-2.5 px-3"></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Footer & Signatures */}
            <div className="mt-12 pt-4 border-t border-slate-400 flex justify-between items-end text-xs font-sans">
              <div>
                <p className="font-mono text-[10px] uppercase font-bold text-slate-400 mb-6">Prepared By:</p>
                <div className="w-56 border-b border-black text-center pb-1">
                  <span className="font-serif font-bold text-sm text-[#16324A]">{event.committee} Head</span>
                </div>
                <p className="text-[10px] text-slate-400 text-center mt-1">Event Coordinator / Committee Chair</p>
              </div>

              <div className="text-center italic text-[11px] font-serif text-slate-500">
                Official Document &bull; Not valid without seal
              </div>

              <div>
                <p className="font-mono text-[10px] uppercase font-bold text-slate-400 mb-6 text-right">Noted &amp; Approved By:</p>
                <div className="w-56 border-b border-black text-center pb-1">
                  <span className="font-serif font-bold text-sm text-[#16324A]">PERLITA B. ADVINCULA</span>
                </div>
                <p className="text-[10px] text-slate-400 text-center mt-1">Punong Barangay</p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
