import React, { useState, useEffect } from "react";
import { useData } from "../context/DataContext";
import { supabase } from "../utils/supabaseClient";

const CERT_TYPE_LABELS = {
  BARANGAY_CLEARANCE: "Barangay Clearance",
  OATH_OF_UNDERTAKING: "Oath of Undertaking",
  APPLICATION_BARANGAY_CLEARANCE: "Application for Brgy. Clearance",
  CERTIFICATION_SLIP: "Certification Slip",
  CERTIFICATION_OF_INDIGENCY: "Certification of Indigency",
  CERTIFICATION_FINANCIAL_ASSISTANCE: "Financial Assistance",
  CERTIFICATION_FIRST_TIME_JOBSEEKER: "First Time Jobseeker",
  CERTIFICATION_OF_GUARDIANSHIP: "Certification of Guardianship",
  CERTIFICATION_GOOD_MORAL: "Good Moral",
  EVENT_ATTENDANCE: "Event Attendance",
};

const CERT_COLORS = [
  { bg: "bg-blue-50",    text: "text-blue-700",   border: "border-blue-200",   bar: "#3B82F6", dot: "bg-blue-500" },
  { bg: "bg-indigo-50",  text: "text-indigo-700", border: "border-indigo-200", bar: "#6366F1", dot: "bg-indigo-500" },
  { bg: "bg-cyan-50",    text: "text-cyan-700",   border: "border-cyan-200",   bar: "#06B6D4", dot: "bg-cyan-500" },
  { bg: "bg-slate-50",   text: "text-slate-700",  border: "border-slate-200",  bar: "#64748B", dot: "bg-slate-500" },
  { bg: "bg-amber-50",   text: "text-amber-700",  border: "border-amber-200",  bar: "#F59E0B", dot: "bg-amber-500" },
  { bg: "bg-emerald-50", text: "text-emerald-700",border: "border-emerald-200",bar: "#10B981", dot: "bg-emerald-500" },
  { bg: "bg-violet-50",  text: "text-violet-700", border: "border-violet-200", bar: "#8B5CF6", dot: "bg-violet-500" },
  { bg: "bg-rose-50",    text: "text-rose-700",   border: "border-rose-200",   bar: "#F43F5E", dot: "bg-rose-500" },
  { bg: "bg-teal-50",    text: "text-teal-700",   border: "border-teal-200",   bar: "#14B8A6", dot: "bg-teal-500" },
  { bg: "bg-orange-50",  text: "text-orange-700", border: "border-orange-200", bar: "#F97316", dot: "bg-orange-500" },
];

export default function DashboardView({ onPrintBirthdays, residentsList: initialResidentsList }) {
  const { residents, households, residentStatuses, helpers: { calculateAge, getResidentShortName } } = useData();
  const residentsList = initialResidentsList || residents || [];

  // ── Certificate records state ─────────────────────────────────────────────
  const [certRecords, setCertRecords]     = useState([]);
  const [userMap, setUserMap]             = useState({});
  const [certLoading, setCertLoading]     = useState(true);
  const [certSearch, setCertSearch]       = useState("");
  const [certFilterType, setCertFilterType] = useState("ALL");

  useEffect(() => {
    const load = async () => {
      setCertLoading(true);
      try {
        const { data: usersData } = await supabase.from("users").select("user_id, full_name, username");
        if (usersData) {
          const map = {};
          usersData.forEach(u => { map[String(u.user_id)] = u.full_name || u.username || `User #${u.user_id}`; });
          setUserMap(map);
        }
      } catch {}
      const { data } = await supabase.from("certificate_requests").select("*").order("issued_at", { ascending: false }).limit(500);
      if (data) setCertRecords(data);
      setCertLoading(false);
    };
    load();
  }, []);

  const formatIssuedBy = (issuedBy) => {
    if (!issuedBy) return "—";
    return userMap[String(issuedBy)] || userMap[String(Number(issuedBy))] || issuedBy;
  };

  const formatDate = (iso) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleString("en-PH", { year: "numeric", month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" });
  };

  // ── Resident counts ───────────────────────────────────────────────────────
  const totalResidentsCount = residentsList.length;
  const activeCount   = residentsList.filter(r => r.residencyStatus === "Active").length;
  const deceasedCount = residentsList.filter(r => r.residencyStatus === "Deceased").length;
  const movedCount    = residentsList.filter(r => r.residencyStatus === "Moved").length;
  const inactiveCount = residentsList.filter(r => r.residencyStatus === "Inactive").length;
  const totalHouseholdsCount = households.length;

  // ── Resident status tag counts ────────────────────────────────────────────
  const seniorCount    = residentStatuses.filter(s => s.statusType === "Senior Citizen").length;
  const pwdCount       = residentStatuses.filter(s => s.statusType === "PWD").length;
  const voterCount     = residentStatuses.filter(s => s.statusType === "Voter").length;
  const soloParentCount= residentStatuses.filter(s => s.statusType === "Solo Parent").length;
  const studentCount   = residentStatuses.filter(s => s.statusType === "Student").length;
  const indigentCount  = residentStatuses.filter(s => s.statusType === "Indigent").length;

  const statusTags = [
    { label: "Senior Citizen", count: seniorCount,     icon: "🧓", color: "text-amber-700",   bg: "bg-amber-50",   border: "border-amber-200" },
    { label: "PWD",            count: pwdCount,        icon: "♿", color: "text-amber-700",   bg: "bg-amber-50",   border: "border-amber-200" },
    { label: "Voter",          count: voterCount,      icon: "🗳️", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200" },
    { label: "Solo Parent",    count: soloParentCount, icon: "👩‍👦", color: "text-blue-700",    bg: "bg-blue-50",    border: "border-blue-200" },
    { label: "Student",        count: studentCount,    icon: "📚", color: "text-indigo-700",  bg: "bg-indigo-50",  border: "border-indigo-200" },
    { label: "Indigent",       count: indigentCount,   icon: "🏚️", color: "text-slate-700",   bg: "bg-slate-50",   border: "border-slate-200" },
  ];

  // ── Certificate analytics ─────────────────────────────────────────────────
  const certTypeCounts = {};
  certRecords.forEach(r => {
    certTypeCounts[r.certificate_type] = (certTypeCounts[r.certificate_type] || 0) + 1;
  });
  const certTypeEntries = Object.entries(certTypeCounts).sort((a, b) => b[1] - a[1]);
  const maxCertCount = certTypeEntries.length > 0 ? certTypeEntries[0][1] : 1;
  const totalCertsIssued = certRecords.length;

  // ── Certificate records table (filtered) ─────────────────────────────────
  const filteredCerts = certRecords.filter(r => {
    const matchType = certFilterType === "ALL" || r.certificate_type === certFilterType;
    const q = certSearch.toLowerCase();
    const matchSearch = !q
      || String(r.resident_name || "").toLowerCase().includes(q)
      || String(r.resident_id || "").toLowerCase().includes(q)
      || String(r.purpose || "").toLowerCase().includes(q)
      || String(formatIssuedBy(r.issued_by)).toLowerCase().includes(q);
    return matchType && matchSearch;
  });

  // ── Birthday celebrators ──────────────────────────────────────────────────
  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const currentDay = today.getDate();
  const activeResidents = residentsList.filter(r => r.residencyStatus !== "Deceased" && r.residencyStatus !== "Inactive");
  let isUpcoming = false;
  let celebrators = activeResidents.filter(r => {
    if (!r.birthDate) return false;
    const parts = String(r.birthDate).split("-");
    if (parts.length >= 3) return parseInt(parts[1], 10) === currentMonth && parseInt(parts[2], 10) === currentDay;
    const bd = new Date(r.birthDate);
    return bd.getMonth() + 1 === currentMonth && bd.getDate() === currentDay;
  });
  if (celebrators.length === 0 && activeResidents.length > 0) {
    const withBirthdays = activeResidents.filter(r => r.birthDate).map(r => {
      const parts = String(r.birthDate).split("-");
      const m = parseInt(parts[1], 10), d = parseInt(parts[2], 10);
      let daysUntil = (m - currentMonth) * 31 + (d - currentDay);
      if (daysUntil < 0) daysUntil += 365;
      return { resident: r, daysUntil };
    });
    if (withBirthdays.length > 0) {
      withBirthdays.sort((a, b) => a.daysUntil - b.daysUntil);
      celebrators = withBirthdays.slice(0, 3).map(i => i.resident);
      isUpcoming = true;
    } else {
      celebrators = activeResidents.slice(0, 3);
    }
  }

  return (
    <div className="flex-1 p-6 overflow-y-auto space-y-6">

      {/* ── Hero: Overall Resident Count ─────────────────────────────────── */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Residents (big hero card) */}
        <div className="lg:col-span-2 ledger-container p-6 bg-gradient-to-br from-[#16324A] to-[#1e4a6b] text-white border-0 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-8 translate-x-8" />
          <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full translate-y-6 -translate-x-6" />
          <div className="relative z-10">
            <p className="text-xs font-mono uppercase tracking-widest text-white/60 mb-1">Total Residents</p>
            <p className="text-6xl font-bold font-serif tabular-numbers leading-none">{totalResidentsCount}</p>
            <p className="text-sm text-white/70 mt-2">Brgy. 46 Zone 6 — All Status</p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="bg-white/10 rounded-lg p-3">
                <p className="text-2xl font-bold font-serif tabular-numbers">{activeCount}</p>
                <p className="text-xs text-white/60 mt-0.5">Active</p>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <p className="text-2xl font-bold font-serif tabular-numbers">{totalHouseholdsCount}</p>
                <p className="text-xs text-white/60 mt-0.5">Households</p>
              </div>
            </div>
          </div>
        </div>

        {/* Registry Status mini-cards */}
        <div className="ledger-container p-5">
          <p className="text-xs font-mono uppercase tracking-wider text-slate-500 font-semibold mb-3">Residency Status</p>
          <div className="space-y-2.5">
            {[
              { label: "Active",   count: activeCount,   color: "bg-[#2E5A44]", textColor: "text-[#2E5A44]" },
              { label: "Inactive", count: inactiveCount, color: "bg-slate-500",  textColor: "text-slate-600" },
              { label: "Moved",    count: movedCount,    color: "bg-[#C8932B]", textColor: "text-[#C8932B]" },
              { label: "Deceased", count: deceasedCount, color: "bg-[#9B3D30]", textColor: "text-[#9B3D30]" },
            ].map(({ label, count, color, textColor }) => (
              <div key={label} className="flex items-center gap-2.5">
                <div className={`h-2 rounded-full flex-1 bg-slate-100 overflow-hidden`}>
                  <div
                    className={`h-full ${color} rounded-full transition-all duration-700`}
                    style={{ width: totalResidentsCount > 0 ? `${(count / totalResidentsCount) * 100}%` : "0%" }}
                  />
                </div>
                <span className="text-xs font-mono w-5 text-right font-bold tabular-numbers">{count}</span>
                <span className={`text-[10px] font-mono uppercase font-bold w-16 ${textColor}`}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Certificates Issued Total */}
        <div className="ledger-container p-5">
          <p className="text-xs font-mono uppercase tracking-wider text-slate-500 font-semibold mb-3">Certs Issued</p>
          <p className="text-5xl font-bold font-serif text-[#D86B98] tabular-numbers leading-none">{totalCertsIssued}</p>
          <p className="text-xs text-slate-400 mt-1.5">Total across all types</p>
          <div className="mt-4 space-y-1.5">
            {certTypeEntries.slice(0, 3).map(([type, count], i) => (
              <div key={type} className="flex items-center gap-2 text-[10px] font-mono">
                <div className="h-1.5 w-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: CERT_COLORS[i % CERT_COLORS.length].bar }} />
                <span className="text-slate-500 truncate flex-1">{CERT_TYPE_LABELS[type] || type}</span>
                <span className="font-bold text-slate-700">{count}</span>
              </div>
            ))}
            {certTypeEntries.length > 3 && (
              <p className="text-[10px] text-slate-400 font-mono">+{certTypeEntries.length - 3} more types</p>
            )}
          </div>
        </div>
      </section>

      {/* ── Resident Status Tags ──────────────────────────────────────────── */}
      <section className="ledger-container p-5">
        <h2 className="text-lg text-[#16324A] font-serif font-bold mb-4 border-b border-[#D1D7CE] pb-2 flex items-center gap-2">
          <span>🏷️</span>
          <span>Resident Status Classification</span>
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {statusTags.map(({ label, count, icon, color, bg, border }) => (
            <div key={label} className={`${bg} border ${border} rounded-xl p-4 flex flex-col items-center text-center`}>
              <span className="text-2xl mb-1.5">{icon}</span>
              <p className={`text-2xl font-bold font-serif tabular-numbers ${color}`}>{count}</p>
              <p className="text-[10px] font-mono uppercase font-bold text-slate-500 mt-1 leading-tight">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Certificate Analytics ─────────────────────────────────────────── */}
      <section className="ledger-container p-5">
        <div className="flex items-center justify-between mb-4 border-b border-[#D1D7CE] pb-2">
          <h2 className="text-lg text-[#16324A] font-serif font-bold flex items-center gap-2">
            <span>📜</span>
            <span>Certificates Issued by Type</span>
          </h2>
          <span className="text-xs font-mono text-slate-500 bg-[#F2F4F1] border border-[#D1D7CE] px-2.5 py-1 rounded-xs font-semibold">
            {totalCertsIssued} total
          </span>
        </div>

        {certLoading ? (
          <p className="text-xs text-slate-400 italic text-center py-6">Loading certificate analytics…</p>
        ) : certTypeEntries.length === 0 ? (
          <p className="text-xs text-slate-400 italic text-center py-6">No certificate records found.</p>
        ) : (
          <div className="space-y-3">
            {certTypeEntries.map(([type, count], i) => {
              const c = CERT_COLORS[i % CERT_COLORS.length];
              const pct = Math.round((count / maxCertCount) * 100);
              return (
                <div key={type} className="flex items-center gap-4">
                  <span className={`text-[10px] font-mono uppercase font-bold ${c.text} w-52 flex-shrink-0 truncate`}>
                    {CERT_TYPE_LABELS[type] || type}
                  </span>
                  <div className="flex-1 h-6 bg-slate-100 rounded-lg overflow-hidden">
                    <div
                      className="h-full rounded-lg transition-all duration-700 flex items-center justify-end pr-2"
                      style={{ width: `${pct}%`, backgroundColor: c.bar }}
                    >
                      {pct > 15 && (
                        <span className="text-[10px] font-bold text-white font-mono">{count}</span>
                      )}
                    </div>
                  </div>
                  {pct <= 15 && (
                    <span className="text-xs font-bold font-mono text-slate-700 w-8 text-right">{count}</span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── Certificate Issuance Records ─────────────────────────────────── */}
      <section className="ledger-container p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 border-b border-[#D1D7CE] pb-3">
          <h2 className="text-lg text-[#16324A] font-serif font-bold flex items-center gap-2">
            <span>📋</span>
            <span>Certificate Issuance Records</span>
          </h2>
          <div className="flex flex-wrap gap-2">
            {/* Search */}
            <input
              type="text"
              placeholder="Search name, ID, purpose…"
              value={certSearch}
              onChange={e => setCertSearch(e.target.value)}
              className="text-xs border border-[#D1D7CE] bg-[#F9FAF8] rounded-xs px-3 py-1.5 focus:outline-none focus:border-[#16324A] text-[#16324A] w-52"
            />
            {/* Type filter */}
            <select
              value={certFilterType}
              onChange={e => setCertFilterType(e.target.value)}
              className="text-xs border border-[#D1D7CE] bg-[#F9FAF8] rounded-xs px-2.5 py-1.5 focus:outline-none focus:border-[#16324A] text-[#16324A] font-semibold cursor-pointer"
            >
              <option value="ALL">ALL TYPES</option>
              {Object.entries(CERT_TYPE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
            <span className="text-xs font-mono font-semibold text-slate-500 self-center">
              {filteredCerts.length} record{filteredCerts.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {certLoading ? (
          <p className="text-xs text-slate-400 italic text-center py-8">Loading records…</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="ledger-table">
              <thead>
                <tr>
                  <th className="w-8">#</th>
                  <th>Certificate Type</th>
                  <th>Resident</th>
                  <th>Purpose</th>
                  <th>Issued By</th>
                  <th>Date & Time</th>
                  <th className="w-20 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredCerts.length > 0 ? (
                  filteredCerts.map((r, idx) => {
                    const typeKey = r.certificate_type;
                    const colorIdx = Object.keys(CERT_TYPE_LABELS).indexOf(typeKey) % CERT_COLORS.length;
                    const c = CERT_COLORS[colorIdx >= 0 ? colorIdx : 0];
                    return (
                      <tr key={r.id}>
                        <td className="font-mono text-xs text-slate-400">{idx + 1}</td>
                        <td>
                          <span className={`inline-block text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${c.bg} ${c.text} ${c.border}`}>
                            {CERT_TYPE_LABELS[typeKey] || typeKey}
                          </span>
                        </td>
                        <td>
                          <p className="font-semibold text-sm text-[#16324A]">{r.resident_name || "—"}</p>
                          {r.resident_id && (
                            <p className="text-[10px] font-mono text-slate-400">{r.resident_id}</p>
                          )}
                        </td>
                        <td className="text-xs text-slate-600 max-w-xs truncate">{r.purpose || "—"}</td>
                        <td className="text-xs font-semibold text-slate-700">{formatIssuedBy(r.issued_by)}</td>
                        <td className="text-xs font-mono text-slate-500 whitespace-nowrap">{formatDate(r.issued_at)}</td>
                        <td className="text-center">
                          <span className="text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded uppercase">
                            {r.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-slate-400 italic text-xs bg-white">
                      No certificate records match your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ── Birthday Celebrators (kept at bottom) ────────────────────────── */}
      <section className="ledger-container p-5 border-l-4 border-[#D86B98]">
        <div className="flex justify-between items-center mb-3">
          <div>
            <h2 className="text-xl text-[#D86B98] font-serif font-bold">Magandang Araw!</h2>
            <p className="text-sm text-slate-500">Welcome to the Brgy. 46 Zone 6 System Console.</p>
          </div>
        </div>
        <div className="bg-[#FDF0F5] border border-[#F4C2D7] p-3.5 rounded-lg">
          <h3 className="text-xs uppercase font-mono tracking-wider text-[#D86B98] font-bold mb-2.5 flex items-center justify-between">
            <span className="flex items-center space-x-1.5">
              <span>🎂</span>
              <span>{isUpcoming ? "Upcoming Birthday Celebrators" : "Residents Celebrating Today"}</span>
            </span>
            <span className="text-[10px] bg-[#D86B98]/10 text-[#D86B98] px-2 py-0.5 rounded font-sans font-semibold">
              {celebrators.length} {celebrators.length === 1 ? "Resident" : "Residents"}
            </span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {celebrators.length > 0 ? (
              celebrators.map(c => (
                <div key={c.residentId} className="bg-white p-3 border border-[#F4C2D7] rounded-lg shadow-2xs flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-sm text-[#2D3748]">{getResidentShortName(c) || `${c.firstName || ""} ${c.lastName || ""}`}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Age: {calculateAge(c.birthDate) || "N/A"} &bull;{" "}
                      <span className="font-mono text-[10px] bg-[#FDF0F5] text-[#D86B98] px-1.5 py-0.5 border border-[#F4C2D7] rounded font-semibold">
                        ID: {c.residentId}
                      </span>
                    </p>
                  </div>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-[#D86B98]/10 text-[#D86B98] border border-[#D86B98]/20">
                    🎉 {isUpcoming ? "Upcoming" : "Today!"}
                  </span>
                </div>
              ))
            ) : (
              <div className="col-span-3 text-center py-4 text-slate-400 text-xs italic bg-white rounded-lg border border-[#F4C2D7]/50">
                No birthday celebrators found in records.
              </div>
            )}
          </div>
        </div>
      </section>

    </div>
  );
}
