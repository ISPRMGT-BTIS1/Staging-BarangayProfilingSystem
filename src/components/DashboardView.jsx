import React from "react";
import { residents, households, localPrograms } from "../mockData";

export default function DashboardView({ onPrintBirthdays }) {
  // Dynamic stats calculation
  const totalResidentsCount = residents.filter(r => r.status !== "Deceased").length;
  const brgy1ResidentsCount = residents.filter(r => r.status !== "Deceased" && r.addressId && households.find(h => h.addressId === r.addressId)?.barangay === "Barangay San Jose").length;
  const brgy2ResidentsCount = residents.filter(r => r.status !== "Deceased" && r.addressId && households.find(h => h.addressId === r.addressId)?.barangay === "Barangay Santa Isabel").length;

  const totalHouseholdsCount = households.length;
  const brgy1HouseholdsCount = households.filter(h => h.barangay === "Barangay San Jose").length;
  const brgy2HouseholdsCount = households.filter(h => h.barangay === "Barangay Santa Isabel").length;

  const totalSeniorsCount = residents.filter(r => r.age >= 60 && r.status !== "Deceased").length;
  const brgy1SeniorsCount = residents.filter(r => r.age >= 60 && r.status !== "Deceased" && r.addressId && households.find(h => h.addressId === r.addressId)?.barangay === "Barangay San Jose").length;
  const brgy2SeniorsCount = residents.filter(r => r.age >= 60 && r.status !== "Deceased" && r.addressId && households.find(h => h.addressId === r.addressId)?.barangay === "Barangay Santa Isabel").length;

  // Milestone records: residents celebrating today (mocked to filter a few residents)
  const celebrators = residents.filter(r => r.status === "Active" && ["R-0001", "R-0005", "R-0013"].includes(r.residentId));

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
                  <h4 className="font-semibold text-sm text-[#16324A]">{c.name}</h4>
                  <p className="text-xs text-slate-500">
                    Age: {c.age} &bull; <span className="font-mono text-[10px] bg-[#F2F4F1] px-1 border border-[#D1D7CE] rounded">{c.residentId}</span>
                  </p>
                </div>
                <div className="text-right">
                  <span className="seal-stamped-gold text-[9px] scale-90">Celebrator</span>
                  <p className="text-[10px] text-slate-400 mt-1 truncate max-w-[100px]">
                    {households.find(h => h.addressId === c.addressId)?.street}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Local Programs */}
      <section className="ledger-container p-5">
        <h2 className="text-lg text-[#16324A] font-serif font-bold mb-4 border-b border-[#D1D7CE] pb-2 flex items-center space-x-2">
          <svg className="h-5 w-5 stroke-current fill-none text-[#16324A]" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 19a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3ZM4.5 16.5c-1.5-1.5-2.5-3.5-2.5-6s1-4.5 2.5-6" />
            <path d="M19.5 4.5c1.5 1.5 2.5 3.5 2.5 6s-1 4.5-2.5 6" />
            <path d="M7.5 13.5c-.8-.8-1.5-2-1.5-3.5s.7-2.7 1.5-3.5" />
            <path d="M16.5 6.5c.8.8 1.5 2 1.5 3.5s-.7 2.7-1.5 3.5" />
          </svg>
          <span>Local Programs & Action Centers</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
      </section>

      {/* Stats Breakdown Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Total Residents */}
        <div className="ledger-container p-5">
          <div className="flex justify-between items-start border-b border-[#D1D7CE] pb-3 mb-4">
            <div>
              <h3 className="text-xs font-mono uppercase tracking-wider text-slate-500 font-semibold">Total Residents</h3>
              <p className="text-3xl font-bold font-serif text-[#16324A] tabular-numbers mt-1">{totalResidentsCount}</p>
            </div>
            <div className="p-2 bg-[#F2F4F1] border border-[#D1D7CE] rounded-xs text-[#16324A]">
              <svg className="h-5 w-5 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center bg-[#F9FAF8] p-2 border border-[#D1D7CE]/40 rounded-xs">
              <span className="font-medium text-slate-600">Barangay San Jose</span>
              <span className="font-mono font-bold text-[#16324A] bg-[#16324A]/5 px-2 py-0.5 rounded-sm border border-[#16324A]/10 tabular-numbers">{brgy1ResidentsCount}</span>
            </div>
            <div className="flex justify-between items-center bg-[#F9FAF8] p-2 border border-[#D1D7CE]/40 rounded-xs">
              <span className="font-medium text-slate-600">Barangay Santa Isabel</span>
              <span className="font-mono font-bold text-[#16324A] bg-[#16324A]/5 px-2 py-0.5 rounded-sm border border-[#16324A]/10 tabular-numbers">{brgy2ResidentsCount}</span>
            </div>
          </div>
        </div>

        {/* Card 2: Households */}
        <div className="ledger-container p-5">
          <div className="flex justify-between items-start border-b border-[#D1D7CE] pb-3 mb-4">
            <div>
              <h3 className="text-xs font-mono uppercase tracking-wider text-slate-500 font-semibold">Households</h3>
              <p className="text-3xl font-bold font-serif text-[#16324A] tabular-numbers mt-1">{totalHouseholdsCount}</p>
            </div>
            <div className="p-2 bg-[#F2F4F1] border border-[#D1D7CE] rounded-xs text-[#16324A]">
              <svg className="h-5 w-5 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
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

        {/* Card 3: Senior Citizens */}
        <div className="ledger-container p-5">
          <div className="flex justify-between items-start border-b border-[#D1D7CE] pb-3 mb-4">
            <div>
              <h3 className="text-xs font-mono uppercase tracking-wider text-slate-500 font-semibold">Seniors (Vaccine/Aid Priority)</h3>
              <p className="text-3xl font-bold font-serif text-[#16324A] tabular-numbers mt-1">{totalSeniorsCount}</p>
            </div>
            <div className="p-2 bg-[#F2F4F1] border border-[#D1D7CE] rounded-xs text-[#C8932B]">
              <svg className="h-5 w-5 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
              </svg>
            </div>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center bg-[#F9FAF8] p-2 border border-[#D1D7CE]/40 rounded-xs">
              <span className="font-medium text-slate-600">Barangay San Jose</span>
              <span className="font-mono font-bold text-[#16324A] bg-[#16324A]/5 px-2 py-0.5 rounded-sm border border-[#16324A]/10 tabular-numbers">{brgy1SeniorsCount}</span>
            </div>
            <div className="flex justify-between items-center bg-[#F9FAF8] p-2 border border-[#D1D7CE]/40 rounded-xs">
              <span className="font-medium text-slate-600">Barangay Santa Isabel</span>
              <span className="font-mono font-bold text-[#16324A] bg-[#16324A]/5 px-2 py-0.5 rounded-sm border border-[#16324A]/10 tabular-numbers">{brgy2SeniorsCount}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Recently Added Accounts list */}
      <section className="ledger-container p-5">
        <h2 className="text-lg text-[#16324A] font-serif font-bold mb-3 border-b border-[#D1D7CE] pb-2 flex items-center space-x-2">
          <svg className="h-5 w-5 stroke-current fill-none text-[#16324A]" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          <span>Recently Logged Registry Accesses</span>
        </h2>
        <div className="divide-y divide-[#D1D7CE]/40 text-xs font-mono">
          <div className="py-2.5 flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <span className="text-slate-400">19:12</span>
              <div>
                <span className="font-bold text-[#16324A] font-sans">Admin Officer</span>
                <span className="text-slate-500 font-sans"> accessed from terminal console</span>
              </div>
            </div>
            <span className="seal-stamped text-[9px] text-[#16324A]/60 font-mono tracking-wide">Barangay Admin Access</span>
          </div>
          <div className="py-2.5 flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <span className="text-slate-400">17:05</span>
              <div>
                <span className="font-bold text-[#16324A] font-sans">Clerk Assistant (Brgy 1)</span>
                <span className="text-slate-500 font-sans"> queried senior citizen vaccine registry</span>
              </div>
            </div>
            <span className="seal-stamped text-[9px] text-[#16324A]/60 font-mono tracking-wide">Vaccine Registry Access</span>
          </div>
          <div className="py-2.5 flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <span className="text-slate-400">14:30</span>
              <div>
                <span className="font-bold text-[#16324A] font-sans">Manager Admin</span>
                <span className="text-slate-500 font-sans"> generated Q2 census report PDF</span>
              </div>
            </div>
            <span className="seal-stamped text-[9px] text-[#16324A]/60 font-mono tracking-wide">Report Generation Log</span>
          </div>
        </div>
      </section>
    </div>
  );
}
