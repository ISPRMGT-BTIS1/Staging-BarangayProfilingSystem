import React, { useState } from "react";
import { residents as initialResidents, households, families } from "../mockData";

export default function ResidentsView({
  searchQuery,
  showNewProfilingModal,
  setShowNewProfilingModal,
  activeTab,
  setActiveTab,
  setSelectedHouseholdId,
  residentsList,
  setResidentsList
}) {
  // Filters state
  const [statusFilter, setStatusFilter] = useState("all");
  const [barangayFilter, setBarangayFilter] = useState("all");
  
  // Sorting state
  const [sortField, setSortField] = useState("residentId");
  const [sortOrder, setSortOrder] = useState("asc");

  // New profiling form state
  const [formData, setFormData] = useState({
    name: "",
    birthDate: "",
    sex: "Male",
    civilStatus: "Single",
    contactNo: "",
    occupation: "",
    citizenship: "Filipino",
    status: "Active",
    addressId: "H-1",
    familyId: "F-1"
  });

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  // Filter & Search computation
  const filteredResidents = residentsList.filter(resident => {
    const household = households.find(h => h.addressId === resident.addressId);
    
    // Search filter
    const matchesSearch = searchQuery
      ? resident.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resident.residentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (resident.occupation && resident.occupation.toLowerCase().includes(searchQuery.toLowerCase()))
      : true;

    // Status filter
    const matchesStatus = statusFilter === "all" ? true : resident.status === statusFilter;

    // Barangay filter
    const matchesBarangay = barangayFilter === "all"
      ? true
      : household?.barangay === barangayFilter;

    return matchesSearch && matchesStatus && matchesBarangay;
  });

  // Sorted computation
  const sortedResidents = [...filteredResidents].sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];

    if (sortField === "barangay") {
      const hA = households.find(h => h.addressId === a.addressId);
      const hB = households.find(h => h.addressId === b.addressId);
      aVal = hA?.barangay || "";
      bVal = hB?.barangay || "";
    }

    if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
    if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  // Form handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const calculateAge = (dobString) => {
    if (!dobString) return 0;
    const today = new Date();
    const birthDate = new Date(dobString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.birthDate) {
      alert("Please fill in all required fields (Name and Birth Date).");
      return;
    }

    const calculatedAge = calculateAge(formData.birthDate);
    const newResidentId = `R-${String(residentsList.length + 1).padStart(4, "0")}`;

    const newResident = {
      residentId: newResidentId,
      name: formData.name,
      birthDate: formData.birthDate,
      age: calculatedAge,
      sex: formData.sex,
      civilStatus: formData.civilStatus,
      contactNo: formData.contactNo || "N/A",
      occupation: formData.occupation || "Unemployed",
      citizenship: formData.citizenship,
      status: formData.status,
      addressId: formData.addressId,
      familyId: formData.familyId
    };

    setResidentsList([newResident, ...residentsList]);
    setShowNewProfilingModal(false);
    
    // Reset form
    setFormData({
      name: "",
      birthDate: "",
      sex: "Male",
      civilStatus: "Single",
      contactNo: "",
      occupation: "",
      citizenship: "Filipino",
      status: "Active",
      addressId: "H-1",
      familyId: "F-1"
    });

    alert(`Successfully registered resident ${formData.name} under record ${newResidentId}!`);
  };

  const handleHouseholdLink = (householdId) => {
    setSelectedHouseholdId(householdId);
    setActiveTab("households");
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto space-y-6">
      {/* View Header */}
      <div>
        <h1 className="text-3xl font-bold font-serif text-[#16324A]">Resident Registry Ledger</h1>
        <p className="text-sm text-slate-500 font-sans">Official profile log database for verifying residency and program qualifications</p>
      </div>

      {/* Filters Control Row */}
      <section className="bg-white border border-[#D1D7CE] p-4 rounded-xs flex flex-wrap gap-4 items-center justify-between shadow-2xs">
        <div className="flex flex-wrap gap-4 items-center">
          {/* Status Filter */}
          <div className="flex flex-col">
            <label className="text-[10px] uppercase font-mono font-bold text-slate-400 mb-1">Residency Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#F2F4F1] border border-[#D1D7CE] rounded-xs text-xs px-2.5 py-1.5 focus:outline-none focus:border-[#16324A] text-[#16324A] font-semibold cursor-pointer"
            >
              <option value="all">ALL STATUSES</option>
              <option value="Active">ACTIVE</option>
              <option value="Inactive">INACTIVE</option>
              <option value="Moved">MOVED</option>
              <option value="Deceased">DECEASED</option>
            </select>
          </div>

          {/* Barangay Filter */}
          <div className="flex flex-col">
            <label className="text-[10px] uppercase font-mono font-bold text-slate-400 mb-1">Barangay Sector</label>
            <select
              value={barangayFilter}
              onChange={(e) => setBarangayFilter(e.target.value)}
              className="bg-[#F2F4F1] border border-[#D1D7CE] rounded-xs text-xs px-2.5 py-1.5 focus:outline-none focus:border-[#16324A] text-[#16324A] font-semibold cursor-pointer"
            >
              <option value="all">ALL BARANGAYS</option>
              <option value="Barangay San Jose">BARANGAY SAN JOSE</option>
              <option value="Barangay Santa Isabel">BARANGAY SANTA ISABEL</option>
            </select>
          </div>
        </div>

        <div className="text-xs font-mono font-semibold text-slate-500">
          Showing <span className="text-[#16324A] font-bold">{sortedResidents.length}</span> of {residentsList.length} total records
        </div>
      </section>

      {/* Main Ledger Table */}
      <section className="ledger-container">
        <div className="overflow-x-auto">
          <table className="ledger-table">
            <thead>
              <tr>
                <th className="cursor-pointer select-none" onClick={() => handleSort("residentId")}>
                  ID {sortField === "residentId" && (sortOrder === "asc" ? "▲" : "▼")}
                </th>
                <th className="cursor-pointer select-none" onClick={() => handleSort("name")}>
                  Name {sortField === "name" && (sortOrder === "asc" ? "▲" : "▼")}
                </th>
                <th className="cursor-pointer select-none" onClick={() => handleSort("age")}>
                  Age/Sex {sortField === "age" && (sortOrder === "asc" ? "▲" : "▼")}
                </th>
                <th className="cursor-pointer select-none" onClick={() => handleSort("barangay")}>
                  Address / Sector {sortField === "barangay" && (sortOrder === "asc" ? "▲" : "▼")}
                </th>
                <th>Relations Head</th>
                <th className="cursor-pointer select-none" onClick={() => handleSort("status")}>
                  Registry Status {sortField === "status" && (sortOrder === "asc" ? "▲" : "▼")}
                </th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedResidents.length > 0 ? (
                sortedResidents.map((resident) => {
                  const household = households.find(h => h.addressId === resident.addressId);
                  const family = families.find(f => f.familyId === resident.familyId);
                  
                  return (
                    <tr key={resident.residentId}>
                      {/* ID Monospace */}
                      <td className="font-mono text-xs font-semibold tabular-numbers text-slate-500">
                        {resident.residentId}
                      </td>
                      
                      {/* Name */}
                      <td>
                        <div className="font-bold text-[#16324A] text-sm">{resident.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">DOB: {resident.birthDate} &bull; {resident.civilStatus}</div>
                      </td>

                      {/* Age & Sex */}
                      <td>
                        <div className="text-xs font-semibold">{resident.age} yrs / {resident.sex}</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">{resident.occupation}</div>
                      </td>

                      {/* Address / Household link */}
                      <td>
                        <button
                          onClick={() => handleHouseholdLink(resident.addressId)}
                          className="text-left group cursor-pointer"
                        >
                          <div className="text-xs font-bold text-[#16324A] group-hover:underline flex items-center space-x-1">
                            <span>🏠</span>
                            <span>{household ? `${household.houseNo} ${household.street}` : "N/A"}</span>
                          </div>
                          <div className="text-[10px] text-slate-400 group-hover:text-[#16324A] font-mono mt-0.5 uppercase tracking-wide">
                            {household?.barangay} &bull; ID: {resident.addressId}
                          </div>
                        </button>
                      </td>

                      {/* Family linking info */}
                      <td className="align-middle">
                        {family ? (
                          <div>
                            <div className="text-xs font-medium text-slate-700">Head: {family.familyHead}</div>
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                              ID: <span className="font-semibold">{resident.familyId}</span> ({family.memberCount} members)
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs">No Family Link</span>
                        )}
                      </td>

                      {/* Status styled like stamps */}
                      <td>
                        <span className={
                          resident.status === "Active"
                            ? "seal-stamped-active"
                            : resident.status === "Inactive"
                              ? "seal-stamped-inactive"
                              : resident.status === "Moved"
                                ? "seal-stamped-gold"
                                : "seal-stamped text-slate-500 bg-slate-100"
                        }>
                          {resident.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="text-right">
                        <button
                          onClick={() => alert(`Record Details for ${resident.name}:\nID: ${resident.residentId}\nCitizen: ${resident.citizenship}\nContact: ${resident.contactNo}`)}
                          className="border border-[#16324A] text-[#16324A] hover:bg-[#16324A] hover:text-white text-[10px] px-2.5 py-1 uppercase font-semibold rounded-xs transition-colors cursor-pointer"
                        >
                          Verify Profile
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-slate-400 font-serif italic bg-white">
                    No resident records match the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Profiling Form Modal */}
      {showNewProfilingModal && (
        <div className="fixed inset-0 bg-[#16324A]/60 flex items-center justify-center p-4 z-50 backdrop-blur-xs">
          <div className="bg-white border-2 border-[#16324A] w-full max-w-xl rounded-xs overflow-hidden shadow-xl flex flex-col">
            
            {/* Modal Header */}
            <div className="bg-[#16324A] text-white px-6 py-4 flex justify-between items-center">
              <h3 className="font-serif font-bold text-lg flex items-center space-x-2">
                <span>📋</span>
                <span>Resident Registry Profiling Form</span>
              </h3>
              <button
                onClick={() => setShowNewProfilingModal(false)}
                className="text-slate-300 hover:text-white text-xl font-bold cursor-pointer"
              >
                &times;
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleFormSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[75vh] font-sans">
              <div className="grid grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="col-span-2 flex flex-col">
                  <label className="text-[10px] uppercase font-mono font-bold text-slate-500 mb-1">
                    Full Name <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g. Juan Dela Cruz Jr."
                    className="border border-[#D1D7CE] bg-[#F2F4F1] focus:bg-white text-[#16324A] rounded-xs text-xs px-3 py-2 focus:outline-none focus:border-[#16324A]"
                  />
                </div>

                {/* DOB */}
                <div className="flex flex-col">
                  <label className="text-[10px] uppercase font-mono font-bold text-slate-500 mb-1">
                    Date of Birth <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="date"
                    name="birthDate"
                    required
                    value={formData.birthDate}
                    onChange={handleInputChange}
                    className="border border-[#D1D7CE] bg-[#F2F4F1] focus:bg-white text-[#16324A] rounded-xs text-xs px-3 py-2 focus:outline-none focus:border-[#16324A]"
                  />
                </div>

                {/* Sex */}
                <div className="flex flex-col">
                  <label className="text-[10px] uppercase font-mono font-bold text-slate-500 mb-1">Sex</label>
                  <select
                    name="sex"
                    value={formData.sex}
                    onChange={handleInputChange}
                    className="border border-[#D1D7CE] bg-[#F2F4F1] focus:bg-white text-[#16324A] rounded-xs text-xs px-3 py-2 focus:outline-none focus:border-[#16324A] cursor-pointer"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>

                {/* Civil Status */}
                <div className="flex flex-col">
                  <label className="text-[10px] uppercase font-mono font-bold text-slate-500 mb-1">Civil Status</label>
                  <select
                    name="civilStatus"
                    value={formData.civilStatus}
                    onChange={handleInputChange}
                    className="border border-[#D1D7CE] bg-[#F2F4F1] focus:bg-white text-[#16324A] rounded-xs text-xs px-3 py-2 focus:outline-none focus:border-[#16324A] cursor-pointer"
                  >
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Widowed">Widowed</option>
                    <option value="Separated">Separated</option>
                  </select>
                </div>

                {/* Contact Number */}
                <div className="flex flex-col">
                  <label className="text-[10px] uppercase font-mono font-bold text-slate-500 mb-1">Contact Number</label>
                  <input
                    type="text"
                    name="contactNo"
                    value={formData.contactNo}
                    onChange={handleInputChange}
                    placeholder="e.g. 09171234567"
                    className="border border-[#D1D7CE] bg-[#F2F4F1] focus:bg-white text-[#16324A] rounded-xs text-xs px-3 py-2 focus:outline-none focus:border-[#16324A]"
                  />
                </div>

                {/* Occupation */}
                <div className="flex flex-col">
                  <label className="text-[10px] uppercase font-mono font-bold text-slate-500 mb-1">Occupation</label>
                  <input
                    type="text"
                    name="occupation"
                    value={formData.occupation}
                    onChange={handleInputChange}
                    placeholder="e.g. Sari-sari owner"
                    className="border border-[#D1D7CE] bg-[#F2F4F1] focus:bg-white text-[#16324A] rounded-xs text-xs px-3 py-2 focus:outline-none focus:border-[#16324A]"
                  />
                </div>

                {/* Citizenship */}
                <div className="flex flex-col">
                  <label className="text-[10px] uppercase font-mono font-bold text-slate-500 mb-1">Citizenship</label>
                  <input
                    type="text"
                    name="citizenship"
                    value={formData.citizenship}
                    onChange={handleInputChange}
                    className="border border-[#D1D7CE] bg-[#F2F4F1] focus:bg-white text-[#16324A] rounded-xs text-xs px-3 py-2 focus:outline-none focus:border-[#16324A]"
                  />
                </div>

                {/* Linked Household */}
                <div className="flex flex-col">
                  <label className="text-[10px] uppercase font-mono font-bold text-slate-500 mb-1">Household Link</label>
                  <select
                    name="addressId"
                    value={formData.addressId}
                    onChange={handleInputChange}
                    className="border border-[#D1D7CE] bg-[#F2F4F1] focus:bg-white text-[#16324A] rounded-xs text-xs px-3 py-2 focus:outline-none focus:border-[#16324A] cursor-pointer"
                  >
                    {households.map(h => (
                      <option key={h.addressId} value={h.addressId}>
                        {h.houseNo} {h.street} ({h.barangay.replace("Barangay ", "Brgy. ")})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Linked Family */}
                <div className="flex flex-col">
                  <label className="text-[10px] uppercase font-mono font-bold text-slate-500 mb-1">Family Unit Link</label>
                  <select
                    name="familyId"
                    value={formData.familyId}
                    onChange={handleInputChange}
                    className="border border-[#D1D7CE] bg-[#F2F4F1] focus:bg-white text-[#16324A] rounded-xs text-xs px-3 py-2 focus:outline-none focus:border-[#16324A] cursor-pointer"
                  >
                    {families.map(f => (
                      <option key={f.familyId} value={f.familyId}>
                        {f.familyId}: Head - {f.familyHead}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Registry Status */}
                <div className="col-span-2 flex flex-col">
                  <label className="text-[10px] uppercase font-mono font-bold text-slate-500 mb-1">Initial Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="border border-[#D1D7CE] bg-[#F2F4F1] focus:bg-white text-[#16324A] rounded-xs text-xs px-3 py-2 focus:outline-none focus:border-[#16324A] cursor-pointer font-semibold"
                  >
                    <option value="Active">Active Record</option>
                    <option value="Inactive">Inactive Record</option>
                    <option value="Moved">Moved Outside Barangay</option>
                    <option value="Deceased">Deceased</option>
                  </select>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-3 border-t border-[#D1D7CE]/40 pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => setShowNewProfilingModal(false)}
                  className="border border-slate-300 text-slate-500 hover:text-slate-800 text-xs font-semibold px-4 py-2 uppercase tracking-wider rounded-xs cursor-pointer hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#2E5A44] hover:bg-[#234533] text-white text-xs font-semibold px-5 py-2 uppercase tracking-wider rounded-xs cursor-pointer transition-colors"
                >
                  Save to Registry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
