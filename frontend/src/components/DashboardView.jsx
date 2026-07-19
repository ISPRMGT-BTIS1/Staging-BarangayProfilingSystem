import React from "react";
import {
  households,
  localPrograms,
  residentStatuses,
  calculateAge,
  getResidentShortName
} from "../mockData";

export default function DashboardView({ onPrintBirthdays, residentsList }) {
  const currentResidents = residentsList || [];

  // Dynamic stats calculation (excluding deceased for total active residents, but let's see)
  const totalResidentsCount = currentResidents.filter(r => r.residencyStatus !== "Deceased").length;
  
  const brgy1ResidentsCount = currentResidents.filter(
    r => r.residencyStatus !== "Deceased" && r.householdId && households.find(h => h.householdId === r.householdId)?.householdId === "H-1" || households.find(h => h.householdId === r.householdId)?.householdId === "H-2" || households.find(h => h.householdId === r.householdId)?.householdId === "H-5"
  ).length; // Just a dynamic mock fallback

  // Let's compute actual counts from mock data
  const brgy1Residents = currentResidents.filter(r => {
    if (r.residencyStatus === "Deceased") return false;
    const h = households.find(hh => hh.householdId === r.householdId);
    return h?.addressId === "A-1" || h?.addressId === "A-2" || h?.addressId === "A-5";
  }).length;

  const brgy2Residents = currentResidents.filter(r => {
    if (r.residencyStatus === "Deceased") return false;
    const h = households.find(hh => hh.householdId === r.householdId);
    return h?.addressId === "A-3" || h?.addressId === "A-4";
  }).length;

  const totalHouseholdsCount = households.length;
  const brgy1HouseholdsCount = households.filter(h => h.addressId === "A-1" || h.addressId === "A-2" || h.addressId === "A-5").length;
  const brgy2HouseholdsCount = households.filter(h => h.addressId === "A-3" || h.addressId === "A-4").length;

  // Derive counts from residentStatuses
  const seniorCount = residentStatuses.filter(s => s.statusType === "Senior Citizen").length;
  const pwdCount = residentStatuses.filter(s => s.statusType === "PWD").length;
  const voterCount = residentStatuses.filter(s => s.statusType === "Voter").length;
  const soloParentCount = residentStatuses.filter(s => s.statusType === "Solo Parent").length;
  const studentCount = residentStatuses.filter(s => s.statusType === "Student").length;
  const indigentCount = residentStatuses.filter(s => s.statusType === "Indigent").length;

  // Registry breakdown counts
  const activeCount = currentResidents.filter(r => r.residencyStatus === "Active").length;
  const deceasedCount = currentResidents.filter(r => r.residencyStatus === "Deceased").length;
  const movedCount = currentResidents.filter(r => r.residencyStatus === "Moved").length;
  const inactiveCount = currentResidents.filter(r => r.residencyStatus === "Inactive").length;

  // Milestone records: residents celebrating today (mocked to filter a few residents)
  const celebrators = currentResidents.filter(r => r.residencyStatus === "Active" && ["R-0001", "R-0005", "R-0013"].includes(r.residentId));

  const handlePrint = () => {
    if (onPrintBirthdays) {
      onPrintBirthdays(celebrators);
    } else {
      alert("Opening print layout for birthday celebrators list...");
    }
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto space-y-6">
      {/* Greetings & Milestones */}
      <section className="ledger-container p-5 border-l-4 border-[#16324A]">
        <div className="flex justify-between items-center mb-3">
          <div>
            <h2 className="text-xl text-[#16324A] font-serif font-bold">Magandang Araw!</h2>
            <p className="text-sm text-slate-500">Welcome to the Brgy. System Console. Here are today's record updates.</p>
          </div>
          <button
            onClick={handlePrint}
            className="border border-[#16324A] hover:bg-[#16324A] hover:text-white text-[#16324A] text-xs font-semibold px-3 py-1.5 uppercase tracking-wider rounded-xs cursor-pointer transition-colors inline-flex items-center space-x-1.5"
          >
            <svg className="h-3.5 w-3.5 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 6 2 18 2 18 9" />
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
              <rect x="6" y="14" width="12" height="8" />
            </svg>
            <span>Print List</span>
          </button>
        </div>

        {/* Celebrating list */}
        <div className="bg-[#F2F4F1]/60 border border-[#D1D7CE] p-3 rounded-xs">
          <h3 className="text-xs uppercase font-mono tracking-wider text-slate-500 font-semibold mb-2 flex items-center space-x-1.5">
            <svg className="h-3.5 w-3.5 stroke-current fill-none text-[#C8932B]" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
            <span>Residents Celebrating Today</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {celebrators.map(c => (
              <div key={c.residentId} className="bg-white p-3 border border-[#D1D7CE] rounded-xs shadow-2xs flex justify-between items-center">
                <div>
                  <h4 className="font-semibold text-sm text-[#16324A]">{getResidentShortName(c)}</h4>
                  <p className="text-xs text-slate-500">
                    Age: {calculateAge(c.birthDate)} &bull; <span className="font-mono text-[10px] bg-[#F2F4F1] px-1 border border-[#D1D7CE] rounded">{c.residentId}</span>
                  </p>
                </div>
                <div className="text-right">
                  <span className="seal-stamped-gold text-[9px] scale-90">Celebrator</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Grid of Key Stat Cards (Total Residents, Households, Seniors, PWD, Voters, Solo Parents) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Total Residents */}
        <div className="ledger-container p-5">
          <div className="flex justify-between items-start border-b border-[#D1D7CE] pb-3 mb-4">
            <div>
              <h3 className="text-xs font-mono uppercase tracking-wider text-slate-500 font-semibold">Total Residents</h3>
              <p className="text-3xl font-bold font-serif text-[#16324A] tabular-numbers mt-1">{totalResidentsCount}</p>
            </div>
            <div className="p-2 bg-[#F2F4F1] border border-[#D1D7CE] rounded-xs text-[#16324A]">
              👤
            </div>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center bg-[#F9FAF8] p-2 border border-[#D1D7CE]/40 rounded-xs">
              <span className="font-medium text-slate-600">Barangay San Jose</span>
              <span className="font-mono font-bold text-[#16324A] bg-[#16324A]/5 px-2 py-0.5 rounded-sm border border-[#16324A]/10 tabular-numbers">{brgy1Residents}</span>
            </div>
            <div className="flex justify-between items-center bg-[#F9FAF8] p-2 border border-[#D1D7CE]/40 rounded-xs">
              <span className="font-medium text-slate-600">Barangay Santa Isabel</span>
              <span className="font-mono font-bold text-[#16324A] bg-[#16324A]/5 px-2 py-0.5 rounded-sm border border-[#16324A]/10 tabular-numbers">{brgy2Residents}</span>
            </div>
          </div>
        </div>

        {/* Households */}
        <div className="ledger-container p-5">
          <div className="flex justify-between items-start border-b border-[#D1D7CE] pb-3 mb-4">
            <div>
              <h3 className="text-xs font-mono uppercase tracking-wider text-slate-500 font-semibold">Households</h3>
              <p className="text-3xl font-bold font-serif text-[#16324A] tabular-numbers mt-1">{totalHouseholdsCount}</p>
            </div>
            <div className="p-2 bg-[#F2F4F1] border border-[#D1D7CE] rounded-xs text-[#16324A]">
              🏡
            </div>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center bg-[#F9FAF8] p-2 border border-[#D1D7CE]/40 rounded-xs">
              <span className="font-medium text-slate-600">Barangay San Jose</span>
              <span className="font-mono font-bold text-[#16324A] bg-[#16324A]/5 px-2 py-0.5 rounded-sm border border-[#16324A]/10 tabular-numbers">{brgy1HouseholdsCount}</span>
            </div>
            <div className="flex justify-between items-center bg-[#F9FAF8] p-2 border border-[#D1D7CE]/40 rounded-xs">
              <span className="font-medium text-slate-600">Barangay Santa Isabel</span>
              <span className="font-mono font-bold text-[#16324A] bg-[#16324A]/5 px-2 py-0.5 rounded-sm border border-[#16324A]/10 tabular-numbers">{brgy2HouseholdsCount}</span>
            </div>
          </div>
        </div>

        {/* Senior Citizens */}
        <div className="ledger-container p-5">
          <div className="flex justify-between items-start border-b border-[#D1D7CE] pb-3 mb-4">
            <div>
              <h3 className="text-xs font-mono uppercase tracking-wider text-slate-500 font-semibold">Senior Citizens</h3>
              <p className="text-3xl font-bold font-serif text-[#C8932B] tabular-numbers mt-1">{seniorCount}</p>
            </div>
            <div className="p-2 bg-[#C8932B]/10 border border-[#C8932B]/20 rounded-xs text-[#C8932B]">
              🧓
            </div>
          </div>
          <p className="text-xs text-slate-500 italic">Vaccine/Pension registry priority</p>
        </div>

        {/* PWD Residents */}
        <div className="ledger-container p-5">
          <div className="flex justify-between items-start border-b border-[#D1D7CE] pb-3 mb-4">
            <div>
              <h3 className="text-xs font-mono uppercase tracking-wider text-slate-500 font-semibold">PWD Residents</h3>
              <p className="text-3xl font-bold font-serif text-[#C8932B] tabular-numbers mt-1">{pwdCount}</p>
            </div>
            <div className="p-2 bg-[#C8932B]/10 border border-[#C8932B]/20 rounded-xs text-[#C8932B]">
              ♿
            </div>
          </div>
          <p className="text-xs text-slate-500 italic">Accessibility & local aid priority</p>
        </div>

        {/* Total Voters */}
        <div className="ledger-container p-5">
          <div className="flex justify-between items-start border-b border-[#D1D7CE] pb-3 mb-4">
            <div>
              <h3 className="text-xs font-mono uppercase tracking-wider text-slate-500 font-semibold">Total Voters</h3>
              <p className="text-3xl font-bold font-serif text-[#2E5A44] tabular-numbers mt-1">{voterCount}</p>
            </div>
            <div className="p-2 bg-[#2E5A44]/10 border border-[#2E5A44]/20 rounded-xs text-[#2E5A44]">
              🗳️
            </div>
          </div>
          <p className="text-xs text-slate-500 italic">Registered voting constituents</p>
        </div>

        {/* Solo Parents */}
        <div className="ledger-container p-5">
          <div className="flex justify-between items-start border-b border-[#D1D7CE] pb-3 mb-4">
            <div>
              <h3 className="text-xs font-mono uppercase tracking-wider text-slate-500 font-semibold">Solo Parents</h3>
              <p className="text-3xl font-bold font-serif text-[#2E5A44] tabular-numbers mt-1">{soloParentCount}</p>
            </div>
            <div className="p-2 bg-[#2E5A44]/10 border border-[#2E5A44]/20 rounded-xs text-[#2E5A44]">
              👩‍👦
            </div>
          </div>
          <p className="text-xs text-slate-500 italic">Single parent support program</p>
        </div>
      </section>

      {/* Registry Status Breakdown */}
      <section className="ledger-container p-5">
        <h2 className="text-lg text-[#16324A] font-serif font-bold mb-3 border-b border-[#D1D7CE] pb-2 flex items-center space-x-2">
          <span>📊</span>
          <span>Registry Status Breakdown</span>
        </h2>
        
        {/* Simple Horizontal Bar Chart */}
        <div className="space-y-4">
          <div className="flex h-8 w-full border border-[#D1D7CE] rounded-xs overflow-hidden text-[10px] font-mono font-bold text-white text-center select-none">
            {activeCount > 0 && (
              <div className="bg-[#2E5A44] flex items-center justify-center transition-all duration-300" style={{ width: `${(activeCount / currentResidents.length) * 100}%` }} title={`Active: ${activeCount}`}>
                ACTIVE ({activeCount})
              </div>
            )}
            {inactiveCount > 0 && (
              <div className="bg-slate-500 flex items-center justify-center transition-all duration-300" style={{ width: `${(inactiveCount / currentResidents.length) * 100}%` }} title={`Inactive: ${inactiveCount}`}>
                INACTIVE ({inactiveCount})
              </div>
            )}
            {movedCount > 0 && (
              <div className="bg-[#C8932B] flex items-center justify-center transition-all duration-300" style={{ width: `${(movedCount / currentResidents.length) * 100}%` }} title={`Moved: ${movedCount}`}>
                MOVED ({movedCount})
              </div>
            )}
            {deceasedCount > 0 && (
              <div className="bg-[#9B3D30] flex items-center justify-center transition-all duration-300" style={{ width: `${(deceasedCount / currentResidents.length) * 100}%` }} title={`Deceased: ${deceasedCount}`}>
                DECEASED ({deceasedCount})
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
            <div className="flex justify-between items-center p-2 bg-[#F9FAF8] border border-[#D1D7CE]/50 rounded-xs">
              <span className="text-slate-500 font-bold">Active:</span>
              <span className="font-semibold text-[#2E5A44] bg-[#2E5A44]/10 px-2 py-0.5 border border-[#2E5A44]/20 rounded-xs">{activeCount}</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-[#F9FAF8] border border-[#D1D7CE]/50 rounded-xs">
              <span className="text-slate-500 font-bold">Inactive:</span>
              <span className="font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 border border-slate-200 rounded-xs">{inactiveCount}</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-[#F9FAF8] border border-[#D1D7CE]/50 rounded-xs">
              <span className="text-slate-500 font-bold">Moved:</span>
              <span className="font-semibold text-[#C8932B] bg-[#C8932B]/10 px-2 py-0.5 border border-[#C8932B]/20 rounded-xs">{movedCount}</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-[#F9FAF8] border border-[#D1D7CE]/50 rounded-xs">
              <span className="text-slate-500 font-bold">Deceased:</span>
              <span className="font-semibold text-[#9B3D30] bg-[#9B3D30]/10 px-2 py-0.5 border border-[#9B3D30]/20 rounded-xs">{deceasedCount}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Resident Statuses Quick Panel */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="ledger-container p-5 md:col-span-1">
          <h3 className="text-xs uppercase font-mono tracking-wider text-slate-500 font-bold mb-3 border-b border-[#D1D7CE] pb-2 flex items-center space-x-1.5">
            <span>🏷️</span>
            <span>Resident Status Tags</span>
          </h3>
          <div className="divide-y divide-[#D1D7CE]/40 font-mono text-xs">
            <div className="py-2 flex justify-between items-center">
              <span className="font-bold text-[#16324A]">Senior Citizen</span>
              <span className="bg-[#C8932B]/10 border border-[#C8932B]/20 px-2 py-0.5 rounded-sm font-bold text-[#C8932B]">{seniorCount}</span>
            </div>
            <div className="py-2 flex justify-between items-center">
              <span className="font-bold text-[#16324A]">PWD</span>
              <span className="bg-[#C8932B]/10 border border-[#C8932B]/20 px-2 py-0.5 rounded-sm font-bold text-[#C8932B]">{pwdCount}</span>
            </div>
            <div className="py-2 flex justify-between items-center">
              <span className="font-bold text-[#16324A]">Voter</span>
              <span className="bg-[#2E5A44]/10 border border-[#2E5A44]/20 px-2 py-0.5 rounded-sm font-bold text-[#2E5A44]">{voterCount}</span>
            </div>
            <div className="py-2 flex justify-between items-center">
              <span className="font-bold text-[#16324A]">Student</span>
              <span className="bg-[#16324A]/5 border border-[#16324A]/10 px-2 py-0.5 rounded-sm font-bold text-[#16324A]">{studentCount}</span>
            </div>
            <div className="py-2 flex justify-between items-center">
              <span className="font-bold text-[#16324A]">Solo Parent</span>
              <span className="bg-[#2E5A44]/10 border border-[#2E5A44]/20 px-2 py-0.5 rounded-sm font-bold text-[#2E5A44]">{soloParentCount}</span>
            </div>
            <div className="py-2 flex justify-between items-center">
              <span className="font-bold text-[#16324A]">Indigent</span>
              <span className="bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-sm font-bold text-slate-500">{indigentCount}</span>
            </div>
          </div>
        </div>

        {/* Local Programs (restyled to match original layouts) */}
        <div className="md:col-span-2 space-y-4">
          <div className="ledger-container p-5">
            <h2 className="text-lg text-[#16324A] font-serif font-bold mb-4 border-b border-[#D1D7CE] pb-2 flex items-center space-x-2">
              <span>🏛️</span>
              <span>Local Programs & Action Centers</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {localPrograms.map(program => (
                <div key={program.id} className="border border-[#D1D7CE] p-4 rounded-xs bg-[#F9FAF8] flex flex-col justify-between h-full">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold font-serif text-md text-[#16324A]">{program.name}</h3>
                      <span className={`text-[10px] font-mono font-bold uppercase border px-1.5 py-0.5 rounded-sm ${
                        program.status === "Ongoing" 
                          ? "text-teal-700 bg-teal-50 border-teal-200" 
                          : program.status === "Active" 
                            ? "text-green-700 bg-green-50 border-green-200" 
                            : "text-amber-700 bg-amber-50 border-amber-200"
                      }`}>
                        {program.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mb-3">{program.description}</p>
                    <div className="text-xs space-y-1 text-slate-500 font-sans border-t border-[#D1D7CE]/50 pt-2 mb-3">
                      <p><strong>Schedule:</strong> {program.schedule}</p>
                      <p><strong>Venue:</strong> {program.venue}</p>
                    </div>
                  </div>
                  <div className="bg-[#16324A]/5 border border-[#16324A]/10 p-2 text-center text-xs font-mono text-[#16324A] rounded-xs font-semibold">
                    {program.stats}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
