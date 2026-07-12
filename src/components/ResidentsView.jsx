import React, { useState } from "react";
import {
  residents as allResidents,
  households,
  families,
  barangays,
  streets,
  addresses,
  residentStatuses,
  calculateAge,
  calculateResidencyLength,
  getResidentDisplayName,
  getResidentShortName,
  getHouseholdAddress,
  getHouseholdBarangay,
  getFamilyHeadName,
  getFamilyMemberCount,
  generateId
} from "../mockData";
import { useAuth } from "../context/AuthContext";
import { logAudit } from "../utils/auditLogger";
import SearchableSelect from "./SearchableSelect";
import { parseCSVResidents } from "../utils/csvImporter";

const STATUS_TYPES = ["Senior Citizen", "PWD", "Voter", "Student", "Solo Parent", "Indigent", "Other"];

export default function ResidentsView({
  searchQuery,
  showNewProfilingModal,
  setShowNewProfilingModal,
  activeTab,
  setActiveTab,
  setSelectedHouseholdId,
  residentsList,
  setResidentsList,
  onViewResident
}) {
  const { currentUser } = useAuth();

  // Filters state
  const [statusFilter, setStatusFilter] = useState("all");
  const [barangayFilter, setBarangayFilter] = useState("all");
  const [residentStatusFilter, setResidentStatusFilter] = useState("all");
  
  // Sorting state
  const [sortField, setSortField] = useState("residentId");
  const [sortOrder, setSortOrder] = useState("asc");

  // File input ref for CSV import
  const fileInputRef = React.useRef(null);

  // New profiling form state
  const [formData, setFormData] = useState({
    firstName: "", middleName: "", lastName: "",
    birthDate: "",
    sex: "Male",
    civilStatus: "Single",
    contactNumber: "",
    occupation: "", company: "",
    citizenship: "Filipino",
    residencyStatus: "Active",
    residencySince: "",
    isDependent: true,
    householdId: "", familyId: "",
    parentId: "",
    emergencyContactName: "",
    emergencyContactRelationship: "",
    emergencyContactNumber: "",
    selectedStatuses: [],
    otherStatusNotes: "",
    isEditing: false,
    editResidentId: null
  });

  // Cascading dropdown states
  const [selectedBarangayId, setSelectedBarangayId] = useState("");
  const [selectedStreetId, setSelectedStreetId] = useState("");

  // Collapsible form sections
  const [expandedSections, setExpandedSections] = useState({
    personal: true, address: true, work: true, statuses: true, registry: true
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Cascading filters
  const filteredStreets = selectedBarangayId
    ? streets.filter(s => s.barangayId === selectedBarangayId)
    : [];

  const filteredHouseholds = selectedBarangayId
    ? households.filter(h => {
        const addr = addresses.find(a => a.addressId === h.addressId);
        if (!addr) return false;
        const street = streets.find(s => s.streetId === addr.streetId);
        if (!street) return false;
        if (selectedStreetId && street.streetId !== selectedStreetId) return false;
        return street.barangayId === selectedBarangayId;
      })
    : households;

  const filteredFamilies = formData.householdId
    ? families.filter(f => f.householdId === formData.householdId)
    : families;

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
    const displayName = getResidentDisplayName(resident);
    const barangayName = getHouseholdBarangay(resident.householdId);
    
    // Search filter
    const matchesSearch = searchQuery
      ? displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resident.residentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (resident.occupation && resident.occupation.toLowerCase().includes(searchQuery.toLowerCase()))
      : true;

    // Residency status filter
    const matchesStatus = statusFilter === "all" ? true : resident.residencyStatus === statusFilter;

    // Barangay filter
    const matchesBarangay = barangayFilter === "all"
      ? true
      : barangayName === barangayFilter;

    // Resident status filter (Senior, PWD, etc.)
    const matchesResidentStatus = residentStatusFilter === "all"
      ? true
      : residentStatuses.some(rs => rs.residentId === resident.residentId && rs.statusType === residentStatusFilter);

    return matchesSearch && matchesStatus && matchesBarangay && matchesResidentStatus;
  });

  // Sorted computation
  const sortedResidents = [...filteredResidents].sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];

    if (sortField === "name" || sortField === "lastName") {
      aVal = `${a.lastName}, ${a.firstName}`;
      bVal = `${b.lastName}, ${b.firstName}`;
    }

    if (sortField === "age") {
      aVal = calculateAge(a.birthDate);
      bVal = calculateAge(b.birthDate);
    }

    if (sortField === "barangay") {
      aVal = getHouseholdBarangay(a.householdId);
      bVal = getHouseholdBarangay(b.householdId);
    }

    if (sortField === "status") {
      aVal = a.residencyStatus;
      bVal = b.residencyStatus;
    }

    if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
    if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  // Form handlers
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value
    });
  };

  const toggleStatus = (statusType) => {
    setFormData(prev => ({
      ...prev,
      selectedStatuses: prev.selectedStatuses.includes(statusType)
        ? prev.selectedStatuses.filter(s => s !== statusType)
        : [...prev.selectedStatuses, statusType]
    }));
  };

  const handleBarangayChange = (e) => {
    setSelectedBarangayId(e.target.value);
    setSelectedStreetId("");
    setFormData(prev => ({ ...prev, householdId: "", familyId: "" }));
  };

  const handleStreetChange = (e) => {
    setSelectedStreetId(e.target.value);
    setFormData(prev => ({ ...prev, householdId: "", familyId: "" }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.birthDate) {
      alert("Please fill in all required fields (First Name, Last Name, and Birth Date).");
      return;
    }

    const today = new Date().toISOString().split("T")[0];
    const isEdit = formData.isEditing;
    const residentId = isEdit ? formData.editResidentId : `R-${String(residentsList.length + 1).padStart(4, "0")}`;

    const residentData = {
      residentId,
      firstName: formData.firstName,
      middleName: formData.middleName,
      lastName: formData.lastName,
      birthDate: formData.birthDate,
      sex: formData.sex,
      civilStatus: formData.civilStatus,
      contactNumber: formData.contactNumber || "N/A",
      occupation: formData.occupation || "Unemployed",
      company: formData.company || "N/A",
      citizenship: formData.citizenship,
      residencyStatus: formData.residencyStatus,
      residencySince: formData.residencySince || today,
      isDependent: formData.isDependent,
      householdId: formData.householdId || "H-1",
      familyId: formData.familyId || "F-1",
      parentId: formData.parentId || null,
      emergencyContactName: formData.emergencyContactName || "",
      emergencyContactRelationship: formData.emergencyContactRelationship || "",
      emergencyContactNumber: formData.emergencyContactNumber || "",
      createdBy: isEdit ? (residentsList.find(r => r.residentId === residentId)?.createdBy || "USR-1") : (currentUser?.userId || "USR-1"),
      createdAt: isEdit ? (residentsList.find(r => r.residentId === residentId)?.createdAt || today) : today,
      updatedBy: isEdit ? (currentUser?.userId || "USR-1") : null,
      updatedAt: isEdit ? today : null
    };

    if (isEdit) {
      setResidentsList(prev => prev.map(r => r.residentId === residentId ? residentData : r));
    } else {
      setResidentsList([residentData, ...residentsList]);
    }

    // Push resident statuses
    // For edit, simply clear old and push new
    if (isEdit) {
      const idxToDelete = [];
      for (let i = residentStatuses.length - 1; i >= 0; i--) {
        if (residentStatuses[i].residentId === residentId) {
          idxToDelete.push(i);
        }
      }
      idxToDelete.forEach(idx => residentStatuses.splice(idx, 1));
    }
    
    formData.selectedStatuses.forEach(statusType => {
      residentStatuses.push({
        residentStatusId: generateId("RS"),
        residentId,
        statusType,
        dateAdded: today,
        notes: statusType === "Other" ? formData.otherStatusNotes : null
      });
    });

    // Log audit
    logAudit("residents", residentId, isEdit ? "UPDATE" : "CREATE", currentUser?.userId || "USR-1",
      `${isEdit ? "Updated" : "Created"} resident: ${formData.lastName}, ${formData.firstName}`);

    setShowNewProfilingModal(false);
    
    // Reset form
    setFormData({
      firstName: "", middleName: "", lastName: "",
      birthDate: "",
      sex: "Male",
      civilStatus: "Single",
      contactNumber: "",
      occupation: "", company: "",
      citizenship: "Filipino",
      residencyStatus: "Active",
      residencySince: "",
      isDependent: true,
      householdId: "", familyId: "",
      parentId: "",
      emergencyContactName: "",
      emergencyContactRelationship: "",
      emergencyContactNumber: "",
      selectedStatuses: [],
      otherStatusNotes: "",
      isEditing: false,
      editResidentId: null
    });
    setSelectedBarangayId("");
    setSelectedStreetId("");

    alert(`Successfully ${isEdit ? "updated" : "registered"} resident ${formData.lastName}, ${formData.firstName} under record ${residentId}!`);
  };

  const openEditModal = (e, resident) => {
    e.stopPropagation();
    
    const h = households.find(h => h.householdId === resident.householdId);
    let stId = "", brgyId = "";
    if (h) {
      const addr = addresses.find(a => a.addressId === h.addressId);
      if (addr) {
        stId = addr.streetId;
        const street = streets.find(s => s.streetId === addr.streetId);
        if (street) brgyId = street.barangayId;
      }
    }
    
    setSelectedBarangayId(brgyId);
    setSelectedStreetId(stId);

    const activeStatuses = residentStatuses
      .filter(rs => rs.residentId === resident.residentId)
      .map(rs => rs.statusType);
      
    const otherStatus = residentStatuses.find(rs => rs.residentId === resident.residentId && rs.statusType === "Other");

    setFormData({
      firstName: resident.firstName, middleName: resident.middleName || "", lastName: resident.lastName,
      birthDate: resident.birthDate,
      sex: resident.sex,
      civilStatus: resident.civilStatus,
      contactNumber: resident.contactNumber !== "N/A" ? resident.contactNumber : "",
      occupation: resident.occupation !== "Unemployed" ? resident.occupation : "", 
      company: resident.company !== "N/A" ? resident.company : "",
      citizenship: resident.citizenship,
      residencyStatus: resident.residencyStatus,
      residencySince: resident.residencySince || "",
      isDependent: resident.isDependent,
      householdId: resident.householdId, 
      familyId: resident.familyId,
      parentId: resident.parentId || "",
      emergencyContactName: resident.emergencyContactName || "",
      emergencyContactRelationship: resident.emergencyContactRelationship || "",
      emergencyContactNumber: resident.emergencyContactNumber || "",
      selectedStatuses: activeStatuses,
      otherStatusNotes: otherStatus ? (otherStatus.notes || "") : "",
      isEditing: true,
      editResidentId: resident.residentId
    });
    setShowNewProfilingModal(true);
  };

  const handleHouseholdLink = (householdId) => {
    setSelectedHouseholdId(householdId);
    setActiveTab("households");
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const csvContent = event.target.result;
      const parsed = parseCSVResidents(csvContent);
      if (parsed.length === 0) {
        alert("Failed to parse CSV or no valid residents found.");
        return;
      }
      
      const newResidents = [];
      const today = new Date().toISOString().split("T")[0];
      
      parsed.forEach((res, index) => {
        const newResidentId = `R-${String(residentsList.length + index + 1).padStart(4, "0")}`;
        newResidents.push({
          ...res,
          residentId: newResidentId,
          createdBy: currentUser?.userId || "USR-1",
          createdAt: today,
          updatedBy: null,
          updatedAt: null
        });
        
        logAudit("residents", newResidentId, "CREATE", currentUser?.userId || "USR-1",
          `Imported resident: ${res.lastName}, ${res.firstName}`);
      });

      setResidentsList([...newResidents, ...residentsList]);
      alert(`Successfully imported ${newResidents.length} residents.`);
    };
    reader.readAsText(file);
    e.target.value = null; // reset input
  };

  // Get status chips for a resident
  const getStatusChips = (residentId) => {
    return residentStatuses.filter(rs => rs.residentId === residentId);
  };

  // Input field class (reused)
  const inputClass = "border border-[#D1D7CE] bg-[#F2F4F1] focus:bg-white text-[#16324A] rounded-xs text-xs px-3 py-2 focus:outline-none focus:border-[#16324A]";
  const selectClass = `${inputClass} cursor-pointer`;
  const labelClass = "text-[10px] uppercase font-mono font-bold text-slate-500 mb-1";

  return (
    <div className="flex-1 p-6 overflow-y-auto space-y-6">
      {/* View Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-serif text-[#16324A]">Resident Registry Ledger</h1>
          <p className="text-sm text-slate-500 font-sans">Official profile log database for verifying residency and program qualifications</p>
        </div>
        <div>
          <input 
            type="file" 
            accept=".csv" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            className="hidden" 
          />
          <button
            onClick={() => fileInputRef.current.click()}
            className="border border-[#16324A] text-[#16324A] hover:bg-[#16324A] hover:text-white px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-xs cursor-pointer shadow-sm hover:shadow transition-all inline-flex items-center space-x-2"
          >
            <span>📄</span>
            <span>Import CSV</span>
          </button>
        </div>
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

          {/* Resident Status Filter (NEW) */}
          <div className="flex flex-col">
            <label className="text-[10px] uppercase font-mono font-bold text-slate-400 mb-1">Resident Status</label>
            <select
              value={residentStatusFilter}
              onChange={(e) => setResidentStatusFilter(e.target.value)}
              className="bg-[#F2F4F1] border border-[#D1D7CE] rounded-xs text-xs px-2.5 py-1.5 focus:outline-none focus:border-[#16324A] text-[#16324A] font-semibold cursor-pointer"
            >
              <option value="all">ALL CATEGORIES</option>
              {STATUS_TYPES.map(st => (
                <option key={st} value={st}>{st.toUpperCase()}</option>
              ))}
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
                <th className="cursor-pointer select-none" onClick={() => handleSort("lastName")}>
                  Name {sortField === "lastName" && (sortOrder === "asc" ? "▲" : "▼")}
                </th>
                <th className="cursor-pointer select-none" onClick={() => handleSort("age")}>
                  Age/Sex {sortField === "age" && (sortOrder === "asc" ? "▲" : "▼")}
                </th>
                <th className="cursor-pointer select-none" onClick={() => handleSort("barangay")}>
                  Address / Sector {sortField === "barangay" && (sortOrder === "asc" ? "▲" : "▼")}
                </th>
                <th>Statuses</th>
                <th className="cursor-pointer select-none" onClick={() => handleSort("status")}>
                  Registry Status {sortField === "status" && (sortOrder === "asc" ? "▲" : "▼")}
                </th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedResidents.length > 0 ? (
                sortedResidents.map((resident) => {
                  const age = calculateAge(resident.birthDate);
                  const addressStr = getHouseholdAddress(resident.householdId);
                  const barangayName = getHouseholdBarangay(resident.householdId);
                  const statusChips = getStatusChips(resident.residentId);
                  
                  return (
                    <tr key={resident.residentId}>
                      {/* ID Monospace */}
                      <td className="font-mono text-xs font-semibold tabular-numbers text-slate-500">
                        {resident.residentId}
                      </td>
                      
                      {/* Name — Last, First format */}
                      <td>
                        <div className="font-bold text-[#16324A] text-sm">{getResidentShortName(resident)}</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">DOB: {resident.birthDate} &bull; {resident.civilStatus}</div>
                      </td>

                      {/* Age & Sex */}
                      <td>
                        <div className="text-xs font-semibold">{age} yrs / {resident.sex}</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">{resident.occupation}</div>
                      </td>

                      {/* Address / Household link */}
                      <td>
                        <button
                          onClick={() => handleHouseholdLink(resident.householdId)}
                          className="text-left group cursor-pointer"
                        >
                          <div className="text-xs font-bold text-[#16324A] group-hover:underline flex items-center space-x-1">
                            <span>🏠</span>
                            <span>{addressStr}</span>
                          </div>
                          <div className="text-[10px] text-slate-400 group-hover:text-[#16324A] font-mono mt-0.5 uppercase tracking-wide">
                            {barangayName} &bull; {resident.householdId}
                          </div>
                        </button>
                      </td>

                      {/* Status chips (NEW) */}
                      <td>
                        <div className="flex flex-wrap gap-1">
                          {statusChips.length > 0 ? (
                            statusChips.map(sc => (
                              <span key={sc.residentStatusId} className="inline-block text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded-sm bg-[#16324A]/5 text-[#16324A] border border-[#16324A]/15">
                                {sc.statusType === "Senior Citizen" ? "Senior" : sc.statusType}
                              </span>
                            ))
                          ) : (
                            <span className="text-[10px] text-slate-300 font-mono">—</span>
                          )}
                        </div>
                      </td>

                      {/* Residency Status styled like stamps */}
                      <td>
                        <span className={
                          resident.residencyStatus === "Active"
                            ? "seal-stamped-active"
                            : resident.residencyStatus === "Inactive"
                              ? "seal-stamped-inactive"
                              : resident.residencyStatus === "Moved"
                                ? "seal-stamped-gold"
                                : "seal-stamped text-slate-500 bg-slate-100"
                        }>
                          {resident.residencyStatus}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="text-right whitespace-nowrap">
                        <button
                          onClick={(e) => openEditModal(e, resident)}
                          className="mr-2 border border-[#2E5A44] text-[#2E5A44] hover:bg-[#2E5A44] hover:text-white text-[10px] px-2.5 py-1 uppercase font-semibold rounded-xs transition-colors cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => onViewResident(resident.residentId)}
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

      {/* Profiling Form Modal — Full-page with collapsible sections */}
      {showNewProfilingModal && (
        <div className="fixed inset-0 bg-[#16324A]/60 flex items-center justify-center p-4 z-50 backdrop-blur-xs">
          <div className="bg-white border-2 border-[#16324A] w-full max-w-3xl rounded-xs overflow-hidden shadow-xl flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="bg-[#16324A] text-white px-6 py-4 flex justify-between items-center flex-shrink-0">
              <h3 className="font-serif font-bold text-lg flex items-center space-x-2">
                <span>📋</span>
                <span>{formData.isEditing ? "Edit Profiling Record" : "Resident Registry Profiling Form"}</span>
              </h3>
              <button
                onClick={() => setShowNewProfilingModal(false)}
                className="text-slate-300 hover:text-white text-xl font-bold cursor-pointer"
              >
                &times;
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleFormSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 font-sans">
              
              {/* Section A — Personal Information */}
              <div className="border border-[#D1D7CE] rounded-xs overflow-hidden">
                <button type="button" onClick={() => toggleSection("personal")}
                  className="w-full flex justify-between items-center bg-[#F2F4F1] px-4 py-2.5 text-xs font-mono font-bold uppercase tracking-wider text-[#16324A] cursor-pointer hover:bg-[#e8ebe5] transition-colors">
                  <span>Section A — Personal Information</span>
                  <span>{expandedSections.personal ? "▲" : "▼"}</span>
                </button>
                {expandedSections.personal && (
                  <div className="p-4 grid grid-cols-3 gap-4">
                    <div className="flex flex-col">
                      <label className={labelClass}>First Name <span className="text-red-600">*</span></label>
                      <input type="text" name="firstName" required value={formData.firstName} onChange={handleInputChange} placeholder="e.g. Juan" className={inputClass} />
                    </div>
                    <div className="flex flex-col">
                      <label className={labelClass}>Middle Name</label>
                      <input type="text" name="middleName" value={formData.middleName} onChange={handleInputChange} placeholder="Optional" className={inputClass} />
                    </div>
                    <div className="flex flex-col">
                      <label className={labelClass}>Last Name <span className="text-red-600">*</span></label>
                      <input type="text" name="lastName" required value={formData.lastName} onChange={handleInputChange} placeholder="e.g. Dela Cruz" className={inputClass} />
                    </div>
                    <div className="flex flex-col">
                      <label className={labelClass}>Date of Birth <span className="text-red-600">*</span></label>
                      <input type="date" name="birthDate" required value={formData.birthDate} onChange={handleInputChange} className={inputClass} />
                      {formData.birthDate && (
                        <span className="text-[10px] text-slate-400 font-mono mt-0.5">
                          Age: {calculateAge(formData.birthDate)} years
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <label className={labelClass}>Sex</label>
                      <select name="sex" value={formData.sex} onChange={handleInputChange} className={selectClass}>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="flex flex-col">
                      <label className={labelClass}>Civil Status</label>
                      <select name="civilStatus" value={formData.civilStatus} onChange={handleInputChange} className={selectClass}>
                        <option value="Single">Single</option>
                        <option value="Married">Married</option>
                        <option value="Widowed">Widowed</option>
                        <option value="Separated">Separated</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="flex flex-col">
                      <label className={labelClass}>Citizenship</label>
                      <input type="text" name="citizenship" value={formData.citizenship} onChange={handleInputChange} className={inputClass} />
                    </div>
                  </div>
                )}
              </div>

              {/* Section B — Address & Household Assignment */}
              <div className="border border-[#D1D7CE] rounded-xs overflow-hidden">
                <button type="button" onClick={() => toggleSection("address")}
                  className="w-full flex justify-between items-center bg-[#F2F4F1] px-4 py-2.5 text-xs font-mono font-bold uppercase tracking-wider text-[#16324A] cursor-pointer hover:bg-[#e8ebe5] transition-colors">
                  <span>Section B — Address & Household Assignment</span>
                  <span>{expandedSections.address ? "▲" : "▼"}</span>
                </button>
                {expandedSections.address && (
                  <div className="p-4 grid grid-cols-2 gap-4">
                    <div className="flex flex-col">
                      <label className={labelClass}>Barangay</label>
                      <select value={selectedBarangayId} onChange={handleBarangayChange} className={selectClass}>
                        <option value="">Select Barangay...</option>
                        {barangays.map(b => (
                          <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col">
                      <label className={labelClass}>Street</label>
                      <select value={selectedStreetId} onChange={handleStreetChange} className={selectClass} disabled={!selectedBarangayId}>
                        <option value="">Select Street...</option>
                        {filteredStreets.map(s => (
                          <option key={s.streetId} value={s.streetId}>{s.streetName}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col">
                      <label className={labelClass}>Household</label>
                      <select name="householdId" value={formData.householdId} onChange={handleInputChange} className={selectClass}>
                        <option value="">Select Household...</option>
                        {filteredHouseholds.map(h => {
                          const addr = addresses.find(a => a.addressId === h.addressId);
                          const st = addr ? streets.find(s => s.streetId === addr.streetId) : null;
                          return (
                            <option key={h.householdId} value={h.householdId}>
                              {h.householdId}: {addr?.houseNo} {st?.streetName || ""}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                    <div className="flex flex-col">
                      <label className={labelClass}>Family Unit</label>
                      <select name="familyId" value={formData.familyId} onChange={handleInputChange} className={selectClass}>
                        <option value="">Select Family...</option>
                        {filteredFamilies.map(f => (
                          <option key={f.familyId} value={f.familyId}>
                          {f.familyId}: Head - {getFamilyHeadName(f.familyId)}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col">
                      <label className={labelClass}>Residency Since (Date)</label>
                      <input type="date" name="residencySince" value={formData.residencySince} onChange={handleInputChange} className={inputClass} />
                    </div>
                    <div className="flex flex-col justify-end">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input type="checkbox" name="isDependent" checked={!formData.isDependent}
                          onChange={(e) => setFormData(prev => ({ ...prev, isDependent: !e.target.checked }))}
                          className="accent-[#2E5A44]" />
                        <span className="text-xs font-semibold text-[#16324A]">This person is the Family Head</span>
                      </label>
                    </div>
                    <div className="col-span-2 flex flex-col">
                      <label className={labelClass}>Parent (Linked Resident)</label>
                      <SearchableSelect
                        name="parentId"
                        value={formData.parentId}
                        onChange={handleInputChange}
                        options={[
                          { value: "", label: "None — No parent link" },
                          ...residentsList.filter(r => r.residencyStatus !== "Deceased").map(r => ({
                            value: r.residentId,
                            label: `${r.residentId}: ${getResidentShortName(r)}`
                          }))
                        ]}
                        placeholder="Search and select parent..."
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Section C — Work & Contact */}
              <div className="border border-[#D1D7CE] rounded-xs overflow-hidden">
                <button type="button" onClick={() => toggleSection("work")}
                  className="w-full flex justify-between items-center bg-[#F2F4F1] px-4 py-2.5 text-xs font-mono font-bold uppercase tracking-wider text-[#16324A] cursor-pointer hover:bg-[#e8ebe5] transition-colors">
                  <span>Section C — Work & Contact</span>
                  <span>{expandedSections.work ? "▲" : "▼"}</span>
                </button>
                {expandedSections.work && (
                  <div className="p-4 grid grid-cols-2 gap-4">
                    <div className="flex flex-col">
                      <label className={labelClass}>Occupation</label>
                      <input type="text" name="occupation" value={formData.occupation} onChange={handleInputChange} placeholder="e.g. Sari-sari owner" className={inputClass} />
                    </div>
                    <div className="flex flex-col">
                      <label className={labelClass}>Company / Workplace</label>
                      <input type="text" name="company" value={formData.company} onChange={handleInputChange} placeholder="Complete with area/address" className={inputClass} />
                    </div>
                    <div className="flex flex-col">
                      <label className={labelClass}>Contact Number</label>
                      <input type="text" name="contactNumber" value={formData.contactNumber} onChange={handleInputChange} placeholder="e.g. 09171234567" className={inputClass} />
                    </div>
                    <div className="col-span-2 border-t border-[#D1D7CE]/40 pt-3 mt-1">
                      <p className="text-[10px] uppercase font-mono font-bold text-slate-400 mb-2">Emergency Contact</p>
                    </div>
                    <div className="flex flex-col">
                      <label className={labelClass}>Emergency Contact Name</label>
                      <input type="text" name="emergencyContactName" value={formData.emergencyContactName} onChange={handleInputChange} className={inputClass} />
                    </div>
                    <div className="flex flex-col">
                      <label className={labelClass}>Relationship</label>
                      <input type="text" name="emergencyContactRelationship" value={formData.emergencyContactRelationship} onChange={handleInputChange} placeholder="e.g. Spouse, Parent" className={inputClass} />
                    </div>
                    <div className="flex flex-col">
                      <label className={labelClass}>Emergency Contact Number</label>
                      <input type="text" name="emergencyContactNumber" value={formData.emergencyContactNumber} onChange={handleInputChange} className={inputClass} />
                    </div>
                  </div>
                )}
              </div>

              {/* Section D — Resident Statuses */}
              <div className="border border-[#D1D7CE] rounded-xs overflow-hidden">
                <button type="button" onClick={() => toggleSection("statuses")}
                  className="w-full flex justify-between items-center bg-[#F2F4F1] px-4 py-2.5 text-xs font-mono font-bold uppercase tracking-wider text-[#16324A] cursor-pointer hover:bg-[#e8ebe5] transition-colors">
                  <span>Section D — Resident Statuses</span>
                  <span>{expandedSections.statuses ? "▲" : "▼"}</span>
                </button>
                {expandedSections.statuses && (
                  <div className="p-4">
                    <p className="text-xs text-slate-500 mb-3">Toggle applicable status tags for this resident:</p>
                    <div className="flex flex-wrap gap-2">
                      {STATUS_TYPES.map(type => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => toggleStatus(type)}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-xs border transition-all cursor-pointer ${
                            formData.selectedStatuses.includes(type)
                              ? "bg-[#2E5A44] text-white border-[#2E5A44]"
                              : "bg-white text-slate-600 border-[#D1D7CE] hover:border-[#16324A] hover:text-[#16324A]"
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                    {formData.selectedStatuses.includes("Other") && (
                      <div className="mt-4 pt-3 border-t border-[#D1D7CE]/40">
                        <label className={labelClass}>Specify Other Status Details</label>
                        <input
                          type="text"
                          name="otherStatusNotes"
                          value={formData.otherStatusNotes}
                          onChange={handleInputChange}
                          placeholder="e.g. Requires regular check-up"
                          className={inputClass}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Section E — Registry Status */}
              <div className="border border-[#D1D7CE] rounded-xs overflow-hidden">
                <button type="button" onClick={() => toggleSection("registry")}
                  className="w-full flex justify-between items-center bg-[#F2F4F1] px-4 py-2.5 text-xs font-mono font-bold uppercase tracking-wider text-[#16324A] cursor-pointer hover:bg-[#e8ebe5] transition-colors">
                  <span>Section E — Registry Status</span>
                  <span>{expandedSections.registry ? "▲" : "▼"}</span>
                </button>
                {expandedSections.registry && (
                  <div className="p-4">
                    <div className="flex flex-col max-w-xs">
                      <label className={labelClass}>Residency Status</label>
                      <select name="residencyStatus" value={formData.residencyStatus} onChange={handleInputChange} className={`${selectClass} font-semibold`}>
                        <option value="Active">Active Record</option>
                        <option value="Inactive">Inactive Record</option>
                        <option value="Moved">Moved Outside Barangay</option>
                        <option value="Deceased">Deceased</option>
                      </select>
                    </div>
                    {formData.residencyStatus === "Deceased" && (
                      <div className="mt-3 bg-[#9B3D30]/10 border border-[#9B3D30]/30 text-[#9B3D30] text-xs font-semibold px-4 py-2.5 rounded-xs flex items-center space-x-2">
                        <span>⚠️</span>
                        <span>This action requires supervisor confirmation.</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Form Actions — Sticky bottom */}
              <div className="flex justify-end space-x-3 border-t border-[#D1D7CE]/40 pt-4 mt-6 sticky bottom-0 bg-white pb-2">
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
