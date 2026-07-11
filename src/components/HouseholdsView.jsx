import React, { useState, useEffect } from "react";
import {
  households as initialHouseholds,
  families,
  residents as initialResidents,
  addresses,
  streets,
  barangays,
  getResidentShortName,
  getHouseholdAddress,
  getHouseholdBarangay,
  generateId
} from "../mockData";
import { useAuth } from "../context/AuthContext";
import { logAudit } from "../utils/auditLogger";

export default function HouseholdsView({
  searchQuery,
  selectedHouseholdId,
  setSelectedHouseholdId,
  residentsList
}) {
  const { currentUser } = useAuth();
  const [householdsList, setHouseholdsList] = useState(initialHouseholds);
  const [barangayFilter, setBarangayFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [expandedId, setExpandedId] = useState(null);

  // Form states
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    barangayId: "",
    streetId: "",
    houseNo: "",
    unitNo: "",
    householdType: "House",
    householdContactNo: "",
    householdHeadId: ""
  });

  // If a household link was clicked from the Residents view, automatically expand it
  useEffect(() => {
    if (selectedHouseholdId) {
      // Look up household by addressId or householdId
      const found = householdsList.find(
        (h) => h.addressId === selectedHouseholdId || h.householdId === selectedHouseholdId
      );
      if (found) {
        setExpandedId(found.householdId);
      }
      setSelectedHouseholdId(null);
    }
  }, [selectedHouseholdId, setSelectedHouseholdId, householdsList]);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // Cascading dropdown filters for form
  const formStreets = formData.barangayId
    ? streets.filter((s) => s.barangayId === formData.barangayId)
    : [];

  const handleBarangayChange = (e) => {
    setFormData({
      ...formData,
      barangayId: e.target.value,
      streetId: ""
    });
  };

  // Filter household records
  const filteredHouseholds = householdsList.filter((household) => {
    const addressStr = getHouseholdAddress(household.householdId);
    const barangayName = getHouseholdBarangay(household.householdId);

    const matchesSearch = searchQuery
      ? addressStr.toLowerCase().includes(searchQuery.toLowerCase()) ||
        household.householdId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        household.addressId.toLowerCase().includes(searchQuery.toLowerCase())
      : true;

    const matchesBarangay = barangayFilter === "all" ? true : barangayName === barangayFilter;
    const matchesType = typeFilter === "all" ? true : household.householdType === typeFilter;

    return matchesSearch && matchesBarangay && matchesType;
  });

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.barangayId || !formData.streetId || !formData.houseNo) {
      alert("Please select Barangay, Street, and enter House Number.");
      return;
    }

    const newAddressId = generateId("A");
    const newHouseholdId = `H-${householdsList.length + 1}`;

    // Add to addresses mock array
    addresses.push({
      addressId: newAddressId,
      streetId: formData.streetId,
      houseNo: formData.houseNo,
      unitNo: formData.unitNo || null
    });

    const newHousehold = {
      householdId: newHouseholdId,
      addressId: newAddressId,
      householdHeadId: formData.householdHeadId || null,
      householdType: formData.householdType,
      householdContactNo: formData.householdContactNo || "N/A",
      status: "Active"
    };

    // Update state & mock Data source
    initialHouseholds.push(newHousehold);
    setHouseholdsList([...householdsList, newHousehold]);

    // Log Audit
    logAudit(
      "households",
      newHouseholdId,
      "CREATE",
      currentUser?.userId || "USR-1",
      `Created household with address ID: ${newAddressId}`
    );

    setShowAddModal(false);
    // Reset Form
    setFormData({
      barangayId: "",
      streetId: "",
      houseNo: "",
      unitNo: "",
      householdType: "House",
      householdContactNo: "",
      householdHeadId: ""
    });

    alert(`Successfully registered household ${newHouseholdId}!`);
  };

  const inputClass =
    "border border-[#D1D7CE] bg-[#F2F4F1] focus:bg-white text-[#16324A] rounded-xs text-xs px-3 py-2 focus:outline-none focus:border-[#16324A]";
  const selectClass = `${inputClass} cursor-pointer`;
  const labelClass = "text-[10px] uppercase font-mono font-bold text-slate-500 mb-1";

  return (
    <div className="flex-1 p-6 overflow-y-auto space-y-6">
      {/* View Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-serif text-[#16324A]">Household & Address Registry</h1>
          <p className="text-sm text-slate-500 font-sans">Barangay residential records indexing grouped families and registered co-habitants</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-[#16324A] hover:bg-[#1f4260] text-white px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-xs cursor-pointer shadow-sm hover:shadow transition-all inline-flex items-center space-x-2 border border-transparent"
        >
          <span>+</span>
          <span>New Household</span>
        </button>
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
              <option value="House">HOUSE</option>
              <option value="Apartment">APARTMENT</option>
              <option value="Boarding House">BOARDING HOUSE</option>
              <option value="Compound">COMPOUND</option>
              <option value="Other">OTHER</option>
            </select>
          </div>
        </div>

        <div className="text-xs font-mono font-semibold text-slate-500">
          Showing <span className="text-[#16324A] font-bold">{filteredHouseholds.length}</span> of {householdsList.length} household sectors
        </div>
      </section>

      {/* Main Ledger List */}
      <section className="space-y-4">
        {filteredHouseholds.length > 0 ? (
          filteredHouseholds.map((household) => {
            const isExpanded = expandedId === household.householdId;
            const addressStr = getHouseholdAddress(household.householdId);
            const barangayName = getHouseholdBarangay(household.householdId);

            // Find families living in this household
            const linkedFamilies = families.filter((f) => f.householdId === household.householdId);

            // Find all active residents living in this household
            const residentMembers = (residentsList || initialResidents).filter(
              (r) => r.householdId === household.householdId && r.residencyStatus !== "Deceased"
            );

            // Find Head Resident Info
            const headResident = (residentsList || initialResidents).find(
              (r) => r.residentId === household.householdHeadId
            );

            return (
              <div
                key={household.householdId}
                className={`ledger-container transition-all border ${
                  isExpanded ? "border-[#16324A] ring-1 ring-[#16324A]/25" : "border-[#D1D7CE]"
                }`}
              >
                {/* Header Summary Row */}
                <div
                  onClick={() => toggleExpand(household.householdId)}
                  className="p-4 bg-white flex flex-wrap items-center justify-between gap-4 cursor-pointer hover:bg-[#F9FAF8] transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <span className="font-mono text-xs font-bold text-slate-400 bg-[#F2F4F1] border border-[#D1D7CE] px-2 py-0.5 rounded-sm">
                      {household.householdId}
                    </span>
                    <div>
                      <h3 className="font-bold text-sm text-[#16324A] font-serif flex items-center space-x-1">
                        <span>🏡</span>
                        <span>{addressStr}</span>
                      </h3>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider font-mono mt-0.5">
                        {barangayName} &bull; Structure: {household.householdType}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6 text-xs">
                    <div className="text-right">
                      <span className="font-mono font-bold text-slate-600 block">
                        {linkedFamilies.length} {linkedFamilies.length === 1 ? "Family" : "Families"}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        ({residentMembers.length} Co-habitants)
                      </span>
                    </div>

                    {/* Derived Count replacing residencyLength */}
                    <div className="text-right">
                      <span className="font-mono font-bold text-slate-600 block">
                        {residentMembers.length} Residents
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">Registry Logged</span>
                    </div>

                    <span
                      className={
                        household.status === "Active"
                          ? "seal-stamped-active"
                          : "seal-stamped-inactive"
                      }
                    >
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
                    {/* Head Details if exists */}
                    {headResident && (
                      <div className="bg-white border border-[#D1D7CE] p-3 rounded-xs flex items-center justify-between text-xs max-w-md">
                        <div>
                          <p className="text-[10px] text-slate-400 font-mono uppercase">Household Head</p>
                          <p className="font-bold text-sm text-[#16324A]">
                            {getResidentShortName(headResident)}
                          </p>
                        </div>
                        <span className="font-mono bg-[#F2F4F1] border border-[#D1D7CE] px-2 py-0.5 rounded">
                          {headResident.residentId}
                        </span>
                      </div>
                    )}

                    {/* Families Breakdown */}
                    <div>
                      <h4 className="text-xs uppercase font-mono tracking-wider text-slate-500 font-bold mb-3 border-b border-[#D1D7CE]/50 pb-1 flex items-center space-x-2">
                        <span>👨‍👩‍👧‍👦</span>
                        <span>Families Unit List ({linkedFamilies.length})</span>
                      </h4>

                      {linkedFamilies.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {linkedFamilies.map((family) => {
                            const familyHeadRelation = (
                              initialResidents || residentsList
                            ).find(
                              (r) =>
                                r.familyId === family.familyId &&
                                !r.isDependent &&
                                r.residencyStatus !== "Deceased"
                            );
                            const memberCount = (residentsList || initialResidents).filter(
                              (r) => r.familyId === family.familyId && r.residencyStatus !== "Deceased"
                            ).length;

                            return (
                              <div
                                key={family.familyId}
                                className="bg-white border border-[#D1D7CE] p-3.5 rounded-xs shadow-2xs"
                              >
                                <div className="flex justify-between items-baseline mb-2">
                                  <span className="font-mono text-[10px] font-bold text-slate-500 bg-[#F2F4F1] border border-[#D1D7CE] px-1.5 py-0.25 rounded">
                                    {family.familyId}
                                  </span>
                                  {/* Update family status chips with Transferred option */}
                                  <span
                                    className={
                                      family.status === "Active"
                                        ? "seal-stamped-active scale-90"
                                        : family.status === "Transferred"
                                        ? "seal-stamped-gold scale-90"
                                        : "seal-stamped-inactive scale-90"
                                    }
                                  >
                                    {family.status}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-500">Family Head</p>
                                <p className="font-bold text-sm text-[#16324A]">
                                  {familyHeadRelation
                                    ? getResidentShortName(familyHeadRelation)
                                    : "No Active Head Linked"}
                                </p>
                                <div className="mt-2 pt-2 border-t border-[#D1D7CE]/50 flex justify-between text-xs text-slate-500">
                                  {/* Derive memberCount dynamically */}
                                  <span>
                                    Members: <strong>{memberCount}</strong>
                                  </span>
                                  {familyHeadRelation && (
                                    <span className="font-mono text-[10px] bg-[#F2F4F1] border px-1 border-[#D1D7CE] rounded">
                                      {familyHeadRelation.residentId}
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic font-serif">
                          No distinct family units recorded. Residents live independently.
                        </p>
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
                              residentMembers.map((member) => {
                                const age = (residentsList || initialResidents).find(
                                  (r) => r.residentId === member.residentId
                                )?.birthDate;
                                return (
                                  <tr key={member.residentId}>
                                    <td className="py-2.5 px-3 font-mono text-xs text-slate-500">
                                      {member.residentId}
                                    </td>
                                    <td className="py-2.5 px-3">
                                      <div className="font-bold text-[#16324A] text-xs">
                                        {getResidentShortName(member)}
                                      </div>
                                      <div className="text-[9px] text-slate-400 font-mono mt-0.5">
                                        {member.occupation}
                                      </div>
                                    </td>
                                    <td className="py-2.5 px-3 text-xs">
                                      {age ? `${new Date().getFullYear() - new Date(age).getFullYear()} yrs` : "N/A"} &bull; {member.sex}
                                    </td>
                                    <td className="py-2.5 px-3 font-mono text-[10px] text-slate-600 font-semibold">
                                      {member.familyId || "N/A"}
                                    </td>
                                    <td className="py-2.5 px-3 text-right">
                                      <span
                                        className={
                                          member.residencyStatus === "Active"
                                            ? "seal-stamped-active scale-95"
                                            : member.residencyStatus === "Moved"
                                            ? "seal-stamped-gold scale-95"
                                            : "seal-stamped-inactive scale-95"
                                        }
                                      >
                                        {member.residencyStatus}
                                      </span>
                                    </td>
                                  </tr>
                                );
                              })
                            ) : (
                              <tr>
                                <td
                                  colSpan="5"
                                  className="text-center py-4 text-slate-400 text-xs italic font-serif"
                                >
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

      {/* New Household Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-[#16324A]/60 flex items-center justify-center p-4 z-50 backdrop-blur-xs">
          <div className="bg-white border-2 border-[#16324A] w-full max-w-lg rounded-xs overflow-hidden shadow-xl flex flex-col">
            {/* Modal Header */}
            <div className="bg-[#16324A] text-white px-6 py-4 flex justify-between items-center">
              <h3 className="font-serif font-bold text-lg flex items-center space-x-2">
                <span>📋</span>
                <span>New Household Registration</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-300 hover:text-white text-xl font-bold cursor-pointer"
              >
                &times;
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleFormSubmit} className="p-6 space-y-4 font-sans">
              <div className="grid grid-cols-2 gap-4">
                {/* Barangay */}
                <div className="flex flex-col">
                  <label className={labelClass}>Barangay <span className="text-red-600">*</span></label>
                  <select
                    value={formData.barangayId}
                    onChange={handleBarangayChange}
                    required
                    className={selectClass}
                  >
                    <option value="">Select Barangay...</option>
                    {barangays.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Street */}
                <div className="flex flex-col">
                  <label className={labelClass}>Street <span className="text-red-600">*</span></label>
                  <select
                    value={formData.streetId}
                    onChange={(e) => setFormData({ ...formData, streetId: e.target.value })}
                    required
                    disabled={!formData.barangayId}
                    className={selectClass}
                  >
                    <option value="">Select Street...</option>
                    {formStreets.map((s) => (
                      <option key={s.streetId} value={s.streetId}>
                        {s.streetName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* House No */}
                <div className="flex flex-col">
                  <label className={labelClass}>House No. <span className="text-red-600">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 12A"
                    value={formData.houseNo}
                    onChange={(e) => setFormData({ ...formData, houseNo: e.target.value })}
                    className={inputClass}
                  />
                </div>

                {/* Unit No */}
                <div className="flex flex-col">
                  <label className={labelClass}>Unit No. (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Rm 302"
                    value={formData.unitNo}
                    onChange={(e) => setFormData({ ...formData, unitNo: e.target.value })}
                    className={inputClass}
                  />
                </div>

                {/* Household Type */}
                <div className="flex flex-col">
                  <label className={labelClass}>Household Type</label>
                  <select
                    value={formData.householdType}
                    onChange={(e) => setFormData({ ...formData, householdType: e.target.value })}
                    className={selectClass}
                  >
                    <option value="House">House</option>
                    <option value="Apartment">Apartment</option>
                    <option value="Boarding House">Boarding House</option>
                    <option value="Compound">Compound</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Household Contact */}
                <div className="flex flex-col">
                  <label className={labelClass}>Household Contact No.</label>
                  <input
                    type="text"
                    placeholder="e.g. 09171234567"
                    value={formData.householdContactNo}
                    onChange={(e) => setFormData({ ...formData, householdContactNo: e.target.value })}
                    className={inputClass}
                  />
                </div>

                {/* Household Head */}
                <div className="col-span-2 flex flex-col">
                  <label className={labelClass}>Household Head (Linked Resident)</label>
                  <select
                    value={formData.householdHeadId}
                    onChange={(e) => setFormData({ ...formData, householdHeadId: e.target.value })}
                    className={selectClass}
                  >
                    <option value="">Select Resident...</option>
                    {(residentsList || initialResidents)
                      .filter((r) => r.residencyStatus !== "Deceased")
                      .map((r) => (
                        <option key={r.residentId} value={r.residentId}>
                          {r.residentId}: {getResidentShortName(r)}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-3 border-t border-[#D1D7CE]/40 pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="border border-slate-300 text-slate-500 hover:text-slate-800 text-xs font-semibold px-4 py-2 uppercase tracking-wider rounded-xs cursor-pointer hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#2E5A44] hover:bg-[#234533] text-white text-xs font-semibold px-5 py-2 uppercase tracking-wider rounded-xs cursor-pointer transition-colors"
                >
                  Create Registry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
