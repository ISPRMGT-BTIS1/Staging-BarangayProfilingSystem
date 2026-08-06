import React, { useState } from "react";
import { useData } from "../context/DataContext";
import { useAuth } from "@/shared/hooks/useAuth";
import { logAudit } from "../utils/auditLogger";
import SearchableSelect from "./SearchableSelect";
import { parseCSVResidents } from "../utils/csvImporter";
import { supabase } from "../utils/supabaseClient";
import { parseSafeInt, calculateResidencyYears } from "../utils/helpers";

const STATUS_TYPES = [
  "Senior Citizen",
  "PWD",
  "Voter",
  "SK Voter",
  "Student",
  "Solo Parent",
  "Indigent",
  "OFW",
  "Out of School Youth (OSY)",
  "Out of School Children (OSC)",
  "Indigenous Person (IP)",
  "Labor / Employed",
  "Unemployed",
  "Other"
];

export default function ResidentsView({
  searchQuery,
  showNewProfilingModal,
  setShowNewProfilingModal,
  activeTab,
  setActiveTab,
  setSelectedHouseholdId,
  residentsList: initialResidentsList,
  setResidentsList,
  onViewResident
}) {
  const { currentUser, canEdit = true } = useAuth();
  const {
    residents,
    households,
    families,
    streets,
    addresses,
    barangays,
    residentStatuses,
    helpers: {
      calculateAge,
      calculateResidencyLength,
      getResidentDisplayName,
      getResidentShortName,
      getHouseholdAddress,
      getHouseholdBarangay,
      getFamilyHeadName,
      getFamilyMemberCount,
      generateId
    },
    refetch
  } = useData();

  const residentsList = initialResidentsList || residents || [];

  // Filters state
  const [statusFilter, setStatusFilter] = useState("all");
  const [barangayFilter, setBarangayFilter] = useState("all");
  const [residentStatusFilter, setResidentStatusFilter] = useState("all");
  
  // Sorting state
  const [sortField, setSortField] = useState("residentId");
  const [sortOrder, setSortOrder] = useState("asc");

  // File input ref for CSV import
  const fileInputRef = React.useRef(null);

  // New profiling form state (RBI Form A & B 2024 Compliant)
  const [formData, setFormData] = useState({
    philsysCardNo: "",
    firstName: "", middleName: "", lastName: "", extensionName: "",
    birthDate: "", birthPlace: "",
    sex: "Male",
    civilStatus: "Single",
    religion: "",
    contactNumber: "", emailAddress: "",
    occupation: "", company: "",
    educationalAttainment: "None", educationStatus: "Graduate",
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

  // Cascading filters — all streets belong to Brgy. 46 Zone 6
  const filteredStreets = streets;

  const filteredHouseholds = selectedStreetId
    ? households.filter(h => {
        const addr = addresses.find(a => a.addressId === h.addressId);
        if (!addr) return false;
        const street = streets.find(s => s.streetId === addr.streetId);
        if (!street) return false;
        return String(street.streetId) === String(selectedStreetId);
      })
    : households;

  const filteredFamilies = formData.householdId
    ? families.filter(f => String(f.householdId) === String(formData.householdId))
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
    const q = (searchQuery || "").toLowerCase();
    const matchesSearch = q
      ? String(displayName || "").toLowerCase().includes(q) ||
        String(resident.residentId || "").toLowerCase().includes(q) ||
        String(resident.philsysCardNo || "").toLowerCase().includes(q) ||
        String(resident.contactNumber || "").toLowerCase().includes(q) ||
        String(resident.occupation || "").toLowerCase().includes(q)
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

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.birthDate) {
      alert("Please fill in all required fields (First Name, Last Name, and Birth Date).");
      return;
    }
    
    // Basic validation for foreign keys
    if (!formData.householdId || !formData.familyId) {
      alert("Household ID and Family ID are required.");
      return;
    }

    const isEdit = formData.isEditing;
    
    const dbPayload = {
      philsys_card_no: formData.philsysCardNo || null,
      first_name: formData.firstName,
      middle_name: formData.middleName || null,
      last_name: formData.lastName,
      extension_name: formData.extensionName || null,
      birth_date: formData.birthDate,
      birth_place: formData.birthPlace || null,
      sex: formData.sex,
      civil_status: formData.civilStatus,
      religion: formData.religion || null,
      contact_number: formData.contactNumber || null,
      email_address: formData.emailAddress || null,
      occupation: formData.occupation || null,
      company: formData.company || null,
      citizenship: formData.citizenship || "Filipino",
      residency_status: formData.residencyStatus,
      residency_length_years: calculateResidencyYears(formData.residencySince),
      is_dependent: formData.isDependent,
      household_id: parseSafeInt(formData.householdId),
      family_id: parseSafeInt(formData.familyId),
      parent_id: parseSafeInt(formData.parentId),
      emergency_contact_name: formData.emergencyContactName || null,
      emergency_contact_relationship: formData.emergencyContactRelationship || null,
      emergency_contact_number: formData.emergencyContactNumber || null,
    };

    try {
      let residentId = null;

      if (isEdit) {
        residentId = formData.editResidentId;
        dbPayload.updated_by = currentUser?.userId || null;
        
        const { error } = await supabase
          .from('residents')
          .update(dbPayload)
          .eq('resident_id', residentId);
          
        if (error) throw error;
        
        // Update statuses by deleting old and inserting new
        await supabase.from('resident_statuses').delete().eq('resident_id', residentId);
      } else {
        dbPayload.created_by = currentUser?.userId || null;
        
        const { data: newResident, error } = await supabase
          .from('residents')
          .insert([dbPayload])
          .select('resident_id')
          .single();
          
        if (error) throw error;
        residentId = newResident.resident_id;
      }

      // Insert statuses
      if (formData.selectedStatuses.length > 0) {
        const statusesPayload = formData.selectedStatuses.map(statusType => ({
          resident_id: residentId,
          status_type: statusType,
          notes: statusType === "Other" ? formData.otherStatusNotes : null
        }));
        const { error: statusError } = await supabase.from('resident_statuses').insert(statusesPayload);
        if (statusError) throw statusError;
      }

      // Log audit
      await logAudit("residents", residentId, isEdit ? "UPDATE" : "CREATE", currentUser?.userId || null,
        `${isEdit ? "Updated" : "Created"} resident: ${formData.lastName}, ${formData.firstName}`);

      alert(`Successfully ${isEdit ? "updated" : "registered"} resident ${formData.lastName}, ${formData.firstName}!`);
      
      setShowNewProfilingModal(false);
      
      // Reset form
      setFormData({
        philsysCardNo: "",
        firstName: "", middleName: "", lastName: "", extensionName: "",
        birthDate: "", birthPlace: "",
        sex: "Male",
        civilStatus: "Single",
        religion: "",
        contactNumber: "", emailAddress: "",
        occupation: "", company: "",
        educationalAttainment: "None", educationStatus: "Graduate",
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
      
      // Refresh context data
      if (refetch) refetch();
      
    } catch (err) {
      console.error("Database operation failed:", err);
      alert("Failed to save resident to database. See console for details.");
    }
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
      philsysCardNo: resident.philsysCardNo || "",
      firstName: resident.firstName, middleName: resident.middleName || "", lastName: resident.lastName, extensionName: resident.extensionName || "",
      birthDate: resident.birthDate, birthPlace: resident.birthPlace || "",
      sex: resident.sex,
      civilStatus: resident.civilStatus,
      religion: resident.religion || "",
      contactNumber: resident.contactNumber !== "N/A" ? resident.contactNumber : "",
      emailAddress: resident.emailAddress || "",
      occupation: resident.occupation !== "Unemployed" ? resident.occupation : "", 
      company: resident.company !== "N/A" ? resident.company : "",
      educationalAttainment: resident.educationalAttainment || "None",
      educationStatus: resident.educationStatus || "Graduate",
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
    reader.onload = async (event) => {
      const csvContent = event.target.result;
      const parsed = parseCSVResidents(csvContent);
      if (parsed.length === 0) {
        alert("Failed to parse CSV or no valid residents found.");
        return;
      }
      
      try {
        const insertPayloads = parsed.map(res => {
          const hhId = res.householdId ? parseInt(String(res.householdId).replace(/\D/g, ''), 10) : NaN;
          const famId = res.familyId ? parseInt(String(res.familyId).replace(/\D/g, ''), 10) : NaN;
          const pId = res.parentId ? parseInt(String(res.parentId).replace(/\D/g, ''), 10) : NaN;

          return {
            first_name: res.firstName,
            middle_name: res.middleName || null,
            last_name: res.lastName,
            birth_date: res.birthDate || null,
            sex: res.sex || 'Male',
            civil_status: res.civilStatus || 'Single',
            contact_number: res.contactNumber || null,
            occupation: res.occupation || null,
            company: res.company || null,
            citizenship: res.citizenship || 'Filipino',
            residency_status: res.residencyStatus || 'Active',
            residency_length_years: res.residencySince ? (parseFloat(res.residencySince) || null) : null,
            is_dependent: res.isDependent ?? false,
            household_id: !isNaN(hhId) && hhId > 0 ? hhId : null,
            family_id: !isNaN(famId) && famId > 0 ? famId : null,
            parent_id: !isNaN(pId) && pId > 0 ? pId : null,
            emergency_contact_name: res.emergencyContactName || null,
            emergency_contact_relationship: res.emergencyContactRelationship || null,
            emergency_contact_number: res.emergencyContactNumber || null,
            created_by: currentUser?.userId && typeof currentUser.userId === 'number' ? currentUser.userId : null
          };
        });
        
        const { data, error } = await supabase.from('residents').insert(insertPayloads).select('resident_id');
        
        if (error) throw error;
        
        const insertedIds = (data || []).map(r => r.resident_id);
        
        // Audit logging
        await logAudit("residents", insertedIds[0] || 0, "CREATE", currentUser?.userId || null, `Imported ${insertedIds.length} residents from CSV`);
        
        alert(`Successfully imported ${insertedIds.length} residents!`);
        if (refetch) refetch();
        
      } catch (err) {
        console.error("CSV import failed:", err);
        const detailMsg = err?.message || err?.details || err?.hint || JSON.stringify(err);
        alert(`CSV Import Failed: ${detailMsg}`);
      }
    };
    reader.readAsText(file);
    e.target.value = null; // reset input
  };

  // Get status chips for a resident
  const getStatusChips = (residentId) => {
    return residentStatuses.filter(rs => rs.residentId === residentId);
  };

  // Input field class (reused - Pink Theme)
  const inputClass = "border border-[#F4C2D7] bg-[#FDF4F8] focus:bg-white text-[#2D3748] rounded-md text-xs px-3 py-2 focus:outline-none focus:border-[#D86B98] focus:ring-1 focus:ring-[#D86B98] transition-all";
  const selectClass = `${inputClass} cursor-pointer`;
  const labelClass = "text-[10px] uppercase font-mono font-bold text-[#D86B98] mb-1";

  // ── Quick Archive / Status Change ───────────────────────────────────────────
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [archiveResident, setArchiveResident] = useState(null);
  const [archiveStatus, setArchiveStatus] = useState("Inactive");
  const [archiveSaving, setArchiveSaving] = useState(false);

  const openArchiveModal = (e, resident) => {
    e.stopPropagation();
    setArchiveResident(resident);
    setArchiveStatus(resident.residencyStatus === "Active" ? "Inactive" : resident.residencyStatus);
    setShowArchiveModal(true);
  };

  const handleArchive = async (e) => {
    e.preventDefault();
    setArchiveSaving(true);
    try {
      const { error } = await supabase
        .from('residents')
        .update({ residency_status: archiveStatus })
        .eq('resident_id', archiveResident.residentId);
      if (error) throw error;
      await logAudit(
        "residents", archiveResident.residentId, "UPDATE",
        currentUser?.userId || null,
        `Status changed to ${archiveStatus} for ${archiveResident.lastName}, ${archiveResident.firstName}`
      );
      setShowArchiveModal(false);
      setArchiveResident(null);
      if (refetch) refetch();
    } catch (err) {
      console.error("Failed to archive resident:", err);
      alert("Failed to update resident status.");
    } finally {
      setArchiveSaving(false);
    }
  };

  // Download CSV Template Helper
  const downloadCSVTemplate = () => {
    const headers = [
      "First Name", "Middle Name", "Last Name", "Birth Date", "Sex",
      "Civil Status", "Contact Number", "Occupation", "Company", "Citizenship",
      "Residency Length", "Is Dependent", "Household ID", "Family ID",
      "Emergency Contact Name", "Emergency Contact Relationship", "Emergency Contact Number"
    ];
    const sampleRow1 = [
      "Juan", "Santos", "Dela Cruz", "1990-05-15", "Male",
      "Married", "09171234567", "Software Engineer", "Tech Corp", "Filipino",
      "5", "FALSE", "1", "1",
      "Maria Dela Cruz", "Spouse", "09187654321"
    ];
    const sampleRow2 = [
      "Maria", "Reyes", "Dela Cruz", "1992-08-20", "Female",
      "Married", "09187654321", "Teacher", "Pasay High School", "Filipino",
      "5", "FALSE", "1", "1",
      "Juan Dela Cruz", "Spouse", "09171234567"
    ];
    const csvContent = [headers.join(","), sampleRow1.join(","), sampleRow2.join(",")].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "residents_import_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto space-y-6">
      {/* View Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-serif text-[#D86B98]">Resident Registry Ledger</h1>
          <p className="text-sm text-slate-500 font-sans">Official profile log database for verifying residency and program qualifications</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={downloadCSVTemplate}
            className="border border-slate-300 text-slate-600 hover:bg-slate-50 px-3 py-2 text-xs font-semibold uppercase tracking-wider rounded-lg cursor-pointer shadow-2xs transition-all inline-flex items-center space-x-1.5 bg-white"
            title="Download a sample CSV file format"
          >
            <span>📥</span>
            <span>Download Template</span>
          </button>
          <input 
            type="file" 
            accept=".csv" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            className="hidden" 
          />
          <button
            onClick={() => fileInputRef.current.click()}
            className="border border-[#D86B98] text-[#D86B98] hover:bg-[#D86B98] hover:text-white px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-lg cursor-pointer shadow-sm hover:shadow transition-all inline-flex items-center space-x-2 bg-white"
          >
            <span>📄</span>
            <span>Import CSV</span>
          </button>
          {canEdit && (
            <button
              onClick={() => setShowNewProfilingModal(true)}
              className="bg-[#D86B98] hover:bg-[#C45480] text-white px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg cursor-pointer shadow-sm hover:shadow transition-all inline-flex items-center space-x-2 border border-transparent"
            >
              <span className="text-sm font-bold">+</span>
              <span>New Profiling</span>
            </button>
          )}
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
              <option value="all">ALL SECTORS</option>
              <option value="Brgy. 46 Zone 6">BRGY. 46 ZONE 6</option>
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
                          className="mr-1 border border-[#2E5A44] text-[#2E5A44] hover:bg-[#2E5A44] hover:text-white text-[10px] px-2.5 py-1 uppercase font-semibold rounded-xs transition-colors cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={(e) => openArchiveModal(e, resident)}
                          className="mr-1 border border-[#C8932B] text-[#C8932B] hover:bg-[#C8932B] hover:text-white text-[10px] px-2.5 py-1 uppercase font-semibold rounded-xs transition-colors cursor-pointer"
                          title="Change residency status"
                        >
                          Archive
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
          <div className="bg-white border-2 border-[#E8198A] w-full max-w-3xl rounded-xs overflow-hidden shadow-xl flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="bg-[#E8198A] text-white px-6 py-4 flex justify-between items-center flex-shrink-0">
              <h3 className="font-serif font-bold text-lg flex items-center space-x-2">
                <span>📋</span>
                <span>{formData.isEditing ? "Edit Profiling Record" : "Resident Registry Profiling Form"}</span>
              </h3>
              <button
                onClick={() => setShowNewProfilingModal(false)}
                className="text-white/80 hover:text-white text-xl font-bold cursor-pointer"
              >
                &times;
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleFormSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden font-sans">
              
              {/* Scrollable Form Body */}
              <div className="p-6 space-y-4 overflow-y-auto flex-1">
                {/* Section A — Personal Information (RBI Form B Compliant) */}
                <div className="border border-[#F8BBD0] rounded-xs relative">
                  <button type="button" onClick={() => toggleSection("personal")}
                    className="w-full flex justify-between items-center bg-[#FCE4EC] px-4 py-2.5 text-xs font-mono font-bold uppercase tracking-wider text-[#E8198A] cursor-pointer hover:bg-[#f8bbd0]/50 transition-colors rounded-t-xs">
                    <span>Section A — Personal Information</span>
                    <span>{expandedSections.personal ? "▲" : "▼"}</span>
                  </button>
                  {expandedSections.personal && (
                    <div className="p-4 grid grid-cols-3 gap-4 bg-white rounded-b-xs">
                      <div className="col-span-3 flex flex-col max-w-sm">
                        <label className={labelClass}>PhilSys Card No. (National ID)</label>
                        <input type="text" name="philsysCardNo" value={formData.philsysCardNo} onChange={handleInputChange} placeholder="e.g. 1234-5678-9012-3456" className={inputClass} />
                      </div>
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
                        <label className={labelClass}>Suffix / Extension</label>
                        <input type="text" name="extensionName" value={formData.extensionName} onChange={handleInputChange} placeholder="e.g. Jr., Sr., III" className={inputClass} />
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
                        <label className={labelClass}>Place of Birth</label>
                        <input type="text" name="birthPlace" value={formData.birthPlace} onChange={handleInputChange} placeholder="e.g. Pasay City, Manila" className={inputClass} />
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
                        <label className={labelClass}>Religion</label>
                        <input type="text" name="religion" value={formData.religion} onChange={handleInputChange} placeholder="e.g. Roman Catholic" className={inputClass} />
                      </div>
                      <div className="flex flex-col">
                        <label className={labelClass}>Citizenship</label>
                        <input type="text" name="citizenship" value={formData.citizenship} onChange={handleInputChange} className={inputClass} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Section B — Address & Household Assignment */}
                <div className="border border-[#F8BBD0] rounded-xs relative">
                  <button type="button" onClick={() => toggleSection("address")}
                    className="w-full flex justify-between items-center bg-[#FCE4EC] px-4 py-2.5 text-xs font-mono font-bold uppercase tracking-wider text-[#E8198A] cursor-pointer hover:bg-[#f8bbd0]/50 transition-colors rounded-t-xs">
                    <span>Section B — Address & Household Assignment</span>
                    <span>{expandedSections.address ? "▲" : "▼"}</span>
                  </button>
                  {expandedSections.address && (
                    <div className="p-4 grid grid-cols-2 gap-4 bg-white rounded-b-xs">
                      <div className="flex flex-col">
                        <label className={labelClass}>Street</label>
                        <select value={selectedStreetId} onChange={handleStreetChange} className={selectClass}>
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
                            className="accent-[#E8198A]" />
                          <span className="text-xs font-semibold text-[#16324A]">This person is the Family Head</span>
                        </label>
                      </div>
                      <div className="col-span-2 flex flex-col relative z-[60]">
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

                {/* Section C — Work, Education & Contact (RBI Form B Compliant) */}
                <div className="border border-[#F8BBD0] rounded-xs relative">
                  <button type="button" onClick={() => toggleSection("work")}
                    className="w-full flex justify-between items-center bg-[#FCE4EC] px-4 py-2.5 text-xs font-mono font-bold uppercase tracking-wider text-[#E8198A] cursor-pointer hover:bg-[#f8bbd0]/50 transition-colors rounded-t-xs">
                    <span>Section C — Work, Education & Contact</span>
                    <span>{expandedSections.work ? "▲" : "▼"}</span>
                  </button>
                  {expandedSections.work && (
                    <div className="p-4 grid grid-cols-2 gap-4 bg-white rounded-b-xs">
                      <div className="flex flex-col">
                        <label className={labelClass}>Occupation / Profession</label>
                        <input type="text" name="occupation" value={formData.occupation} onChange={handleInputChange} placeholder="e.g. Sari-sari owner, Teacher" className={inputClass} />
                      </div>
                      <div className="flex flex-col">
                        <label className={labelClass}>Company / Workplace</label>
                        <input type="text" name="company" value={formData.company} onChange={handleInputChange} placeholder="Complete with area/address" className={inputClass} />
                      </div>

                      <div className="flex flex-col">
                        <label className={labelClass}>Highest Educational Attainment</label>
                        <select name="educationalAttainment" value={formData.educationalAttainment} onChange={handleInputChange} className={selectClass}>
                          <option value="None">None</option>
                          <option value="Elementary">Elementary</option>
                          <option value="High School">High School</option>
                          <option value="College">College</option>
                          <option value="Post Grad">Post Grad</option>
                          <option value="Vocational">Vocational</option>
                        </select>
                      </div>

                      <div className="flex flex-col">
                        <label className={labelClass}>Educational Status</label>
                        <select name="educationStatus" value={formData.educationStatus} onChange={handleInputChange} className={selectClass}>
                          <option value="Graduate">Graduate</option>
                          <option value="Under Graduate">Under Graduate</option>
                        </select>
                      </div>

                      <div className="flex flex-col">
                        <label className={labelClass}>Contact Number</label>
                        <input type="text" name="contactNumber" value={formData.contactNumber} onChange={handleInputChange} placeholder="e.g. 09171234567" className={inputClass} />
                      </div>
                      <div className="flex flex-col">
                        <label className={labelClass}>E-mail Address</label>
                        <input type="email" name="emailAddress" value={formData.emailAddress} onChange={handleInputChange} placeholder="e.g. resident@email.com" className={inputClass} />
                      </div>

                      <div className="col-span-2 border-t border-[#F8BBD0]/40 pt-3 mt-1">
                        <p className="text-[10px] uppercase font-mono font-bold text-[#E8198A] mb-2">Emergency Contact</p>
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
                <div className="border border-[#F8BBD0] rounded-xs relative">
                  <button type="button" onClick={() => toggleSection("statuses")}
                    className="w-full flex justify-between items-center bg-[#FCE4EC] px-4 py-2.5 text-xs font-mono font-bold uppercase tracking-wider text-[#E8198A] cursor-pointer hover:bg-[#f8bbd0]/50 transition-colors rounded-t-xs">
                    <span>Section D — Resident Statuses</span>
                    <span>{expandedSections.statuses ? "▲" : "▼"}</span>
                  </button>
                  {expandedSections.statuses && (
                    <div className="p-4 bg-white rounded-b-xs">
                      <p className="text-xs text-slate-500 mb-3">Toggle applicable status tags for this resident:</p>
                      <div className="flex flex-wrap gap-2">
                        {STATUS_TYPES.map(type => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => toggleStatus(type)}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-xs border transition-all cursor-pointer ${
                              formData.selectedStatuses.includes(type)
                                ? "bg-[#E8198A] text-white border-[#E8198A] shadow-xs"
                                : "bg-white text-slate-600 border-[#F8BBD0] hover:border-[#E8198A] hover:text-[#E8198A]"
                            }`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                      {formData.selectedStatuses.includes("Other") && (
                        <div className="mt-4 pt-3 border-t border-[#F8BBD0]/40">
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
                <div className="border border-[#F8BBD0] rounded-xs relative">
                  <button type="button" onClick={() => toggleSection("registry")}
                    className="w-full flex justify-between items-center bg-[#FCE4EC] px-4 py-2.5 text-xs font-mono font-bold uppercase tracking-wider text-[#E8198A] cursor-pointer hover:bg-[#f8bbd0]/50 transition-colors rounded-t-xs">
                    <span>Section E — Registry Status</span>
                    <span>{expandedSections.registry ? "▲" : "▼"}</span>
                  </button>
                  {expandedSections.registry && (
                    <div className="p-4 bg-white rounded-b-xs">
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
              </div>

              {/* Fixed Footer Actions — Permanent Docked Bottom (No Overlapping / Hovering) */}
              <div className="bg-[#FFF5F8] border-t border-[#F8BBD0] px-6 py-4 flex justify-end space-x-3 flex-shrink-0 z-20">
                <button
                  type="button"
                  onClick={() => setShowNewProfilingModal(false)}
                  className="border border-slate-300 text-slate-500 hover:text-slate-800 text-xs font-semibold px-4 py-2 uppercase tracking-wider rounded-xs cursor-pointer hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#E8198A] hover:bg-[#c41273] text-white text-xs font-semibold px-5 py-2 uppercase tracking-wider rounded-xs cursor-pointer shadow-sm hover:shadow transition-colors"
                >
                  Save to Registry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Archive / Status Change Modal */}
      {showArchiveModal && archiveResident && (
        <div className="fixed inset-0 bg-[#16324A]/60 flex items-center justify-center p-4 z-50 backdrop-blur-xs">
          <div className="bg-white border-2 border-[#C8932B] w-full max-w-sm rounded-xs overflow-hidden shadow-xl">
            <div className="bg-[#C8932B] text-white px-6 py-4 flex justify-between items-center">
              <h3 className="font-serif font-bold text-base flex items-center space-x-2">
                <span>📁</span>
                <span>Change Residency Status</span>
              </h3>
              <button onClick={() => setShowArchiveModal(false)} className="text-white/80 hover:text-white text-xl font-bold cursor-pointer">&times;</button>
            </div>
            <form onSubmit={handleArchive} className="p-6 space-y-4 font-sans">
              <div className="bg-[#F9FAF8] border border-[#D1D7CE] rounded-xs p-3 text-xs">
                <p className="font-mono font-bold text-[#16324A]">{archiveResident.lastName}, {archiveResident.firstName}</p>
                <p className="text-slate-400 mt-0.5 font-mono">{archiveResident.residentId}</p>
              </div>
              <div className="flex flex-col">
                <label className={labelClass}>New Residency Status</label>
                <select
                  value={archiveStatus}
                  onChange={(e) => setArchiveStatus(e.target.value)}
                  className={`${selectClass} font-semibold`}
                >
                  <option value="Active">Active Record</option>
                  <option value="Inactive">Inactive Record</option>
                  <option value="Moved">Moved Outside Barangay</option>
                  <option value="Deceased">Deceased</option>
                </select>
              </div>
              {archiveStatus === "Deceased" && (
                <div className="bg-[#9B3D30]/10 border border-[#9B3D30]/30 text-[#9B3D30] text-xs font-semibold px-4 py-2.5 rounded-xs flex items-center space-x-2">
                  <span>⚠️</span>
                  <span>This action requires supervisor confirmation.</span>
                </div>
              )}
              <div className="flex justify-end space-x-3 border-t border-[#D1D7CE]/40 pt-4">
                <button type="button" onClick={() => setShowArchiveModal(false)}
                  className="border border-slate-300 text-slate-500 hover:text-slate-800 text-xs font-semibold px-4 py-2 uppercase tracking-wider rounded-xs cursor-pointer hover:bg-slate-50 transition-colors"
                >Cancel</button>
                <button type="submit" disabled={archiveSaving}
                  className="bg-[#C8932B] hover:bg-[#a97a22] text-white text-xs font-semibold px-5 py-2 uppercase tracking-wider rounded-xs cursor-pointer transition-colors disabled:opacity-50"
                >{archiveSaving ? "Saving…" : "Confirm Status Change"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
