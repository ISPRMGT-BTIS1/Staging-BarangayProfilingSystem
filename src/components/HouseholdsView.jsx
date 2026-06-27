import React, { useState, useEffect } from "react";
import { households, families, residents } from "../mockData";

export default function HouseholdsView({
  searchQuery,
  selectedHouseholdId,
  setSelectedHouseholdId,
  residentsList
}) {
  const [barangayFilter, setBarangayFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [expandedId, setExpandedId] = useState(null);

  // If a household link was clicked from the Residents view, automatically expand it
  useEffect(() => {
    if (selectedHouseholdId) {
      setExpandedId(selectedHouseholdId);
      // Clean up after expanding so user can collapse it
      setSelectedHouseholdId(null);
    }
  }, [selectedHouseholdId, setSelectedHouseholdId]);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // Filter household records
  const filteredHouseholds = households.filter((household) => {
    const matchesSearch = searchQuery
      ? household.street.toLowerCase().includes(searchQuery.toLowerCase()) ||
        household.addressId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        household.houseNo.toLowerCase().includes(searchQuery.toLowerCase())
      : true;

    const matchesBarangay = barangayFilter === "all" ? true : household.barangay === barangayFilter;
    const matchesType = typeFilter === "all" ? true : household.householdType === typeFilter;

    return matchesSearch && matchesBarangay && matchesType;
  });

  return (
    <div className="flex-1 p-6 overflow-y-auto space-y-6">
      {/* View Header */}
      <div>
        <h1 className="text-3xl font-bold font-serif text-[#16324A]">Household & Address Registry</h1>
        <p className="text-sm text-slate-500 font-sans">Barangay residential records indexing grouped families and registered co-habitants</p>
      </div>

      {/* Filters Control Row */}
      <section className="bg-white border border-[#D1D7CE] p-4 rounded-xs flex flex-wrap gap-4 items-center justify-between shadow-2xs">
        <div className="flex flex-wrap gap-4 items-center">
          {/* Barangay Filter */}
          <div className="flex flex-col">
            <label className="text-[10px] uppercase font-mono font-bold text-slate-400 mb-1">Barangay Sector</label>
            <select
              value={barangayFilter}
              onChange={(e) => setBarangayFilter(e.target.value)}
              className="bg-[#F2F4F1] border border-[#D1D7CE] rounded-xs text-xs px-2.5 py-1.5 focus:outline-none focus:border-[#16324A] text-[#16324A] font-semibold cursor-pointer"
            >
              <option value="all">ALL SECTORS</option>
              <option value="Barangay San Jose">BARANGAY SAN JOSE</option>
              <option value="Barangay Santa Isabel">BARANGAY SANTA ISABEL</option>
            </select>
          </div>

          {/* Household Type Filter */}
          <div className="flex flex-col">
            <label className="text-[10px] uppercase font-mono font-bold text-slate-400 mb-1">Household Structure</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-[#F2F4F1] border border-[#D1D7CE] rounded-xs text-xs px-2.5 py-1.5 focus:outline-none focus:border-[#16324A] text-[#16324A] font-semibold cursor-pointer"
            >
              <option value="all">ALL TYPES</option>
              <option value="Nuclear">NUCLEAR FAMILY</option>
              <option value="Extended">EXTENDED FAMILY</option>
              <option value="Single Parent">SINGLE PARENT</option>
            </select>
          </div>
        </div>

        <div className="text-xs font-mono font-semibold text-slate-500">
          Showing <span className="text-[#16324A] font-bold">{filteredHouseholds.length}</span> of {households.length} household sectors
        </div>
      </section>

      {/* Main Ledger List */}
      <section className="space-y-4">
        {filteredHouseholds.length > 0 ? (
          filteredHouseholds.map((household) => {
            const isExpanded = expandedId === household.addressId;
            
            // Find families living in this household
            const linkedFamilies = families.filter((f) => f.addressId === household.addressId);
            
            // Find all active residents living in this household
            const residentMembers = residentsList.filter(
              (r) => r.addressId === household.addressId && r.status !== "Deceased"
            );

            return (
              <div
                key={household.addressId}
                className={`ledger-container transition-all border ${
                  isExpanded ? "border-[#16324A] ring-1 ring-[#16324A]/25" : "border-[#D1D7CE]"
                }`}
              >
                {/* Header Summary Row */}
                <div
                  onClick={() => toggleExpand(household.addressId)}
                  className="p-4 bg-white flex flex-wrap items-center justify-between gap-4 cursor-pointer hover:bg-[#F9FAF8] transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <span className="font-mono text-xs font-bold text-slate-400 bg-[#F2F4F1] border border-[#D1D7CE] px-2 py-0.5 rounded-sm">
                      {household.addressId}
                    </span>
                    <div>
                      <h3 className="font-bold text-sm text-[#16324A] font-serif flex items-center space-x-1">
                        <span>🏡</span>
                        <span>{household.houseNo} {household.street}</span>
                      </h3>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider font-mono mt-0.5">
                        {household.barangay} &bull; Structure: {household.householdType}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6 text-xs">
                    <div className="text-right">
                      <span className="font-mono font-bold text-slate-600 block">{linkedFamilies.length} {linkedFamilies.length === 1 ? "Family" : "Families"}</span>
                      <span className="text-[10px] text-slate-400 font-mono">({residentMembers.length} Co-habitants)</span>
                    </div>

                    <div className="text-right">
                      <span className="font-mono font-bold text-slate-600 block">Length: {household.residencyLength} yrs</span>
                      <span className="text-[10px] text-slate-400 font-mono">Residency</span>
                    </div>

                    <span className={household.status === "Active" ? "seal-stamped-active" : "seal-stamped-inactive"}>
                      {household.status}
                    </span>
                    
                    <span className="text-slate-400 text-sm font-bold ml-2">
                      {isExpanded ? "▲" : "▼"}
                    </span>
                  </div>
                </div>

                {/* Expanded Details Section */}
                {isExpanded && (
                  <div className="bg-[#F9FAF8] border-t border-[#D1D7CE] p-5 space-y-6">
                    
                    {/* Families Breakdown */}
                    <div>
                      <h4 className="text-xs uppercase font-mono tracking-wider text-slate-500 font-bold mb-3 border-b border-[#D1D7CE]/50 pb-1 flex items-center space-x-2">
                        <span>👨‍👩‍👧‍👦</span>
                        <span>Families Unit List ({linkedFamilies.length})</span>
                      </h4>

                      {linkedFamilies.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {linkedFamilies.map((family) => {
                            // Find head resident details
                            const headResident = residentMembers.find(r => r.name === family.familyHead);
                            
                            return (
                              <div key={family.familyId} className="bg-white border border-[#D1D7CE] p-3.5 rounded-xs shadow-2xs">
                                <div className="flex justify-between items-baseline mb-2">
                                  <span className="font-mono text-[10px] font-bold text-slate-500 bg-[#F2F4F1] border border-[#D1D7CE] px-1.5 py-0.25 rounded">
                                    {family.familyId}
                                  </span>
                                  <span className="seal-stamped-active scale-90">{family.status}</span>
                                </div>
                                <p className="text-xs text-slate-500">Family Head</p>
                                <p className="font-bold text-sm text-[#16324A]">{family.familyHead}</p>
                                <div className="mt-2 pt-2 border-t border-[#D1D7CE]/50 flex justify-between text-xs text-slate-500">
                                  <span>Members: <strong>{family.memberCount}</strong></span>
                                  {headResident && <span className="font-mono text-[10px] bg-[#F2F4F1] border px-1 border-[#D1D7CE] rounded">{headResident.residentId}</span>}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic font-serif">No distinct family units recorded. Residents live independently.</p>
                      )}
                    </div>

                    {/* Grouped Co-habitants list */}
                    <div>
                      <h4 className="text-xs uppercase font-mono tracking-wider text-slate-500 font-bold mb-3 border-b border-[#D1D7CE]/50 pb-1 flex items-center space-x-2">
                        <span>👥</span>
                        <span>Resident Co-habitants Details ({residentMembers.length})</span>
                      </h4>

                      <div className="bg-white border border-[#D1D7CE] rounded-xs overflow-hidden">
                        <table className="ledger-table">
                          <thead>
                            <tr className="bg-[#F2F4F1]/60">
                              <th className="py-2 px-3 text-xs font-mono">Resident ID</th>
                              <th className="py-2 px-3 text-xs font-serif">Full Name</th>
                              <th className="py-2 px-3 text-xs">Age/Sex</th>
                              <th className="py-2 px-3 text-xs">Family Unit</th>
                              <th className="py-2 px-3 text-xs text-right">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {residentMembers.length > 0 ? (
                              residentMembers.map((member) => (
                                <tr key={member.residentId}>
                                  <td className="py-2.5 px-3 font-mono text-xs text-slate-500">{member.residentId}</td>
                                  <td className="py-2.5 px-3">
                                    <div className="font-bold text-[#16324A] text-xs">{member.name}</div>
                                    <div className="text-[9px] text-slate-400 font-mono mt-0.5">{member.occupation}</div>
                                  </td>
                                  <td className="py-2.5 px-3 text-xs">{member.age} yrs &bull; {member.sex}</td>
                                  <td className="py-2.5 px-3 font-mono text-[10px] text-slate-600 font-semibold">{member.familyId || "N/A"}</td>
                                  <td className="py-2.5 px-3 text-right">
                                    <span className={member.status === "Active" ? "seal-stamped-active scale-95" : "seal-stamped-inactive scale-95"}>
                                      {member.status}
                                    </span>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan="5" className="text-center py-4 text-slate-400 text-xs italic font-serif">
                                  No co-habitants registered under this housing unit address.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="bg-white border border-[#D1D7CE] p-8 text-center text-slate-400 font-serif italic rounded-xs">
            No household records match the selected filters.
          </div>
        )}
      </section>
    </div>
  );
}
