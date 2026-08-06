import React, { useState, useEffect } from "react";
import { useData } from "../context/DataContext";
import { useAuth } from "@/shared/hooks/useAuth";
import { logAudit } from "../utils/auditLogger";
import SearchableSelect from "./SearchableSelect";
import { supabase } from "../utils/supabaseClient";
import { parseSafeInt } from "../utils/helpers";

export default function HouseholdsView({
  searchQuery,
  selectedHouseholdId,
  setSelectedHouseholdId,
  residentsList: initialResidentsList,
  setResidentsList
}) {
  const { currentUser } = useAuth();
  const { residents, households, families, addresses, streets, barangays, helpers: { getResidentShortName, getHouseholdAddress, getHouseholdBarangay, generateId }, refetch } = useData();

  const residentsList = initialResidentsList || residents || [];

  const [householdsList, setHouseholdsList] = useState(households);
  const [familiesList, setFamiliesList] = useState(families);

  useEffect(() => {
    setHouseholdsList(households);
    setFamiliesList(families);
  }, [households, families]);

  const [barangayFilter, setBarangayFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [expandedId, setExpandedId] = useState(null);

  // Add Family Modal
  const [showAddFamilyModal, setShowAddFamilyModal] = useState(false);
  const [addFamilyHouseholdId, setAddFamilyHouseholdId] = useState(null);
  const [familyFormData, setFamilyFormData] = useState({
    familyHeadId: "",
    familyStatus: "Active"
  });

  // Form states
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    streetId: "",
    houseNo: "",
    unitNo: "",
    householdType: "House",
    householdContactNo: "",
    householdHeadId: ""
  });

  // Edit Household state
  const [showEditHHModal, setShowEditHHModal] = useState(false);
  const [editHH, setEditHH] = useState(null);
  const [editHHForm, setEditHHForm] = useState({ householdType: "House", householdContactNo: "", householdHeadId: "" });
  const [editHHSaving, setEditHHSaving] = useState(false);

  // Edit Family state
  const [showEditFamilyModal, setShowEditFamilyModal] = useState(false);
  const [editFamily, setEditFamily] = useState(null);
  const [editFamilyForm, setEditFamilyForm] = useState({ familyHeadId: "", familyStatus: "Active" });
  const [editFamilySaving, setEditFamilySaving] = useState(false);

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

  // All streets available (single-barangay system)
  const formStreets = streets;

  // Filter household records
  const filteredHouseholds = householdsList.filter((household) => {
    const addressStr = getHouseholdAddress(household.householdId);
    const barangayName = getHouseholdBarangay(household.householdId);

    const q = (searchQuery || "").toLowerCase();
    const matchesSearch = q
      ? String(addressStr || "").toLowerCase().includes(q) ||
        String(household.householdId || "").toLowerCase().includes(q) ||
        String(household.addressId || "").toLowerCase().includes(q)
      : true;

    const matchesBarangay = barangayFilter === "all" ? true : barangayName === barangayFilter;
    const matchesType = typeFilter === "all" ? true : household.householdType === typeFilter;

    return matchesSearch && matchesBarangay && matchesType;
  });

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.streetId || !formData.houseNo) {
      alert("Please select a Street and enter a House Number.");
      return;
    }

    try {
      // 1. Insert Address
      const { data: addressData, error: addressError } = await supabase
        .from('addresses')
        .insert([{
          street_id: parseSafeInt(formData.streetId),
          house_no: formData.houseNo,
          unit_no: formData.unitNo || null
        }])
        .select('address_id')
        .single();

      if (addressError) {
        if (addressError.code === '23505') { // Unique violation
          alert("This address already exists for this street.");
        } else {
          throw addressError;
        }
        return;
      }

      const newAddressId = addressData.address_id;

      // 2. Insert Household
      const { data: hhData, error: hhError } = await supabase
        .from('households')
        .insert([{
          address_id: newAddressId,
          household_head_id: parseSafeInt(formData.householdHeadId),
          household_type: formData.householdType || 'House',
          household_contact_no: formData.householdContactNo || null
        }])
        .select('household_id')
        .single();

      if (hhError) throw hhError;

      const newHouseholdId = hhData.household_id;

      // Log Audit
      await logAudit(
        "households",
        newHouseholdId,
        "CREATE",
        currentUser?.userId || null,
        `Created household with address ID: ${newAddressId}`
      );

      setShowAddModal(false);
      
      // Reset Form
      setFormData({
        streetId: "",
        houseNo: "",
        unitNo: "",
        householdType: "House",
        householdContactNo: "",
        householdHeadId: ""
      });

      alert(`Successfully registered household ID ${newHouseholdId}!`);
      
      if (refetch) refetch();

    } catch (err) {
      console.error("Error creating household:", err);
      alert("Failed to create household in database.");
    }
  };

  const handleFamilyFormSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const familyHeadId = familyFormData.familyHeadId ? parseInt(String(familyFormData.familyHeadId).replace(/\D/g, ''), 10) : null;
      
      const { data: familyData, error: familyError } = await supabase
        .from('families')
        .insert([{
          household_id: addFamilyHouseholdId,
          family_head_id: familyHeadId,
          family_status: familyFormData.familyStatus
        }])
        .select('family_id')
        .single();
        
      if (familyError) throw familyError;
      
      const newFamilyId = familyData.family_id;

      // Update resident if family head selected
      if (familyHeadId) {
        const { error: resError } = await supabase
          .from('residents')
          .update({
            family_id: newFamilyId,
            is_dependent: false,
            household_id: addFamilyHouseholdId
          })
          .eq('resident_id', familyHeadId);
          
        if (resError) throw resError;
      }

      await logAudit(
        "families",
        newFamilyId,
        "CREATE",
        currentUser?.userId || null,
        `Created family ID ${newFamilyId} under household ${addFamilyHouseholdId}`
      );

      setShowAddFamilyModal(false);
      setFamilyFormData({ familyHeadId: "", familyStatus: "Active" });
      alert(`Family ${newFamilyId} created! Assign residents to this family when registering them.`);
      
      if (refetch) refetch();
      
    } catch (err) {
      console.error("Error creating family:", err);
      alert("Failed to create family in database.");
    }
  };

  const inputClass = "border border-[#F8BBD0] bg-[#FFF5F8] focus:bg-white text-[#322A2C] rounded-xs text-xs px-3 py-2 focus:outline-none focus:border-[#E8198A] focus:ring-1 focus:ring-[#E8198A] transition-all";
  const selectClass = `${inputClass} cursor-pointer`;
  const labelClass = "text-[10px] uppercase font-mono font-bold text-[#E8198A] mb-1";

  // ── Edit Household handlers ──────────────────────────────────────────────
  const openEditHH = (e, hh) => {
    e.stopPropagation();
    setEditHH(hh);
    setEditHHForm({
      householdType: hh.householdType || "House",
      householdContactNo: hh.householdContactNo || "",
      householdHeadId: hh.householdHeadId || ""
    });
    setShowEditHHModal(true);
  };

  const handleEditHH = async (e) => {
    e.preventDefault();
    setEditHHSaving(true);
    try {
      const { error } = await supabase
        .from('households')
        .update({
          household_type: editHHForm.householdType,
          household_contact_no: editHHForm.householdContactNo || null,
          household_head_id: editHHForm.householdHeadId
            ? parseInt(String(editHHForm.householdHeadId).replace(/\D/g, ''), 10)
            : null
        })
        .eq('household_id', editHH.householdId);

      if (error) throw error;

      await logAudit(
        "households", editHH.householdId, "UPDATE",
        currentUser?.userId || null,
        `Updated household ${editHH.householdId}`
      );

      setShowEditHHModal(false);
      setEditHH(null);
      if (refetch) refetch();
    } catch (err) {
      console.error("Error updating household:", err);
      alert("Failed to update household.");
    } finally {
      setEditHHSaving(false);
    }
  };

  const handleDeleteHH = async (e, hh) => {
    e.stopPropagation();
    const resCount = (residentsList || residents || []).filter(r => r.householdId === hh.householdId).length;
    if (resCount > 0) {
      alert(`Cannot delete: this household still has ${resCount} resident(s) assigned to it. Reassign or archive them first.`);
      return;
    }
    if (!confirm(`Delete household ${hh.householdId}? This will also delete its address record. This cannot be undone.`)) return;
    try {
      // Delete household first (addresses may have FK constraint), then address
      const { error: hhErr } = await supabase.from('households').delete().eq('household_id', hh.householdId);
      if (hhErr) throw hhErr;
      const { error: addrErr } = await supabase.from('addresses').delete().eq('address_id', hh.addressId);
      if (addrErr) console.warn("Could not delete address:", addrErr);

      await logAudit(
        "households", hh.householdId, "DELETE",
        currentUser?.userId || null,
        `Deleted household ${hh.householdId}`
      );
      if (refetch) refetch();
    } catch (err) {
      console.error("Error deleting household:", err);
      alert("Failed to delete household. See console for details.");
    }
  };

  // ── Edit/Delete Family handlers ──────────────────────────────────────────
  const openEditFamily = (e, family) => {
    e.stopPropagation();
    setEditFamily(family);
    setEditFamilyForm({
      familyHeadId: family.familyHeadId || "",
      familyStatus: family.familyStatus || "Active"
    });
    setShowEditFamilyModal(true);
  };

  const handleEditFamily = async (e) => {
    e.preventDefault();
    setEditFamilySaving(true);
    try {
      const familyHeadId = editFamilyForm.familyHeadId
        ? parseInt(String(editFamilyForm.familyHeadId).replace(/\D/g, ''), 10)
        : null;

      const { error } = await supabase
        .from('families')
        .update({
          family_head_id: familyHeadId,
          family_status: editFamilyForm.familyStatus
        })
        .eq('family_id', editFamily.familyId);

      if (error) throw error;

      // If head changed, update the resident record too
      if (familyHeadId) {
        await supabase
          .from('residents')
          .update({ is_dependent: false, family_id: editFamily.familyId })
          .eq('resident_id', familyHeadId);
      }

      await logAudit(
        "families", editFamily.familyId, "UPDATE",
        currentUser?.userId || null,
        `Updated family ${editFamily.familyId}`
      );

      setShowEditFamilyModal(false);
      setEditFamily(null);
      if (refetch) refetch();
    } catch (err) {
      console.error("Error updating family:", err);
      alert("Failed to update family.");
    } finally {
      setEditFamilySaving(false);
    }
  };

  const handleDeleteFamily = async (e, family) => {
    e.stopPropagation();
    const memberCount = (residentsList || residents || []).filter(r => r.familyId === family.familyId).length;
    if (memberCount > 0) {
      alert(`Cannot delete: family ${family.familyId} still has ${memberCount} resident(s). Reassign them first.`);
      return;
    }
    if (!confirm(`Delete family unit ${family.familyId}? This cannot be undone.`)) return;
    try {
      const { error } = await supabase.from('families').delete().eq('family_id', family.familyId);
      if (error) throw error;
      await logAudit("families", family.familyId, "DELETE", currentUser?.userId || null, `Deleted family ${family.familyId}`);
      if (refetch) refetch();
    } catch (err) {
      console.error("Error deleting family:", err);
      alert("Failed to delete family.");
    }
  };

  // Prepare resident options for searchable select
  const residentOptions = [
    { value: "", label: "None — No head selected" },
    ...residentsList.filter(r => r.residencyStatus !== "Deceased").map(r => ({
      value: r.residentId,
      label: `${r.residentId}: ${getResidentShortName(r)}`
    }))
  ];

  return (
    <div className="flex-1 p-6 overflow-y-auto space-y-6">
      {/* View Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-serif text-[#E8198A]">Household & Address Registry</h1>
          <p className="text-sm text-slate-500 font-sans">Barangay residential records indexing grouped families and registered co-habitants</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-[#E8198A] hover:bg-[#c41273] text-white px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg cursor-pointer shadow-sm hover:shadow transition-all inline-flex items-center space-x-2 border border-transparent"
        >
          <span>+</span>
          <span>New Household</span>
        </button>
      </div>

      {/* Filters Control Row */}
      <section className="bg-white border border-[#D1D7CE] p-4 rounded-xs flex flex-wrap gap-4 items-center justify-between shadow-2xs">
        <div className="flex flex-wrap gap-4 items-center">
          {/* Household Type Filter */}
          <div className="flex flex-col">
            <label className="text-[10px] uppercase font-mono font-bold text-slate-400 mb-1">Household Structure</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-[#FFF8F8] border border-[#D1D7CE] rounded-xs text-xs px-2.5 py-1.5 focus:outline-none focus:border-[#322A2C] text-[#322A2C] font-semibold cursor-pointer"
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
          Showing <span className="text-[#322A2C] font-bold">{filteredHouseholds.length}</span> of {householdsList.length} household sectors
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
            const linkedFamilies = familiesList.filter((f) => f.householdId === household.householdId);

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
                  isExpanded ? "border-[#322A2C] ring-1 ring-[#322A2C]/25" : "border-[#D1D7CE]"
                }`}
              >
                {/* Header Summary Row */}
                <div
                  onClick={() => toggleExpand(household.householdId)}
                  className="p-4 bg-white flex flex-wrap items-center justify-between gap-4 cursor-pointer hover:bg-[#FFF8F8] transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <span className="font-mono text-xs font-bold text-slate-400 bg-[#FFF8F8] border border-[#D1D7CE] px-2 py-0.5 rounded-sm">
                      {household.householdId}
                    </span>
                    <div>
                      <h3 className="font-bold text-sm text-[#322A2C] font-serif flex items-center space-x-1">
                        <span></span>
                        <span>{addressStr}</span>
                      </h3>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider font-mono mt-0.5">
                        Structure: {household.householdType}
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

                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={(e) => openEditHH(e, household)}
                        className="border border-[#322A2C] text-[#322A2C] hover:bg-[#322A2C] hover:text-white text-[10px] px-2 py-1 uppercase font-semibold rounded-xs transition-colors cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        onClick={(e) => handleDeleteHH(e, household)}
                        className="border border-[#9B3D30] text-[#9B3D30] hover:bg-[#9B3D30] hover:text-white text-[10px] px-2 py-1 uppercase font-semibold rounded-xs transition-colors cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>

                    <span className="text-slate-400 text-sm font-bold ml-2">
                      {isExpanded ? "▲" : "▼"}
                    </span>
                  </div>
                </div>

                {/* Expanded Details Section */}
                {isExpanded && (
                  <div className="bg-[#FFF8F8] border-t border-[#D1D7CE] p-5 space-y-6">
                    {/* Head Details if exists */}
                    {headResident && (
                      <div className="bg-white border border-[#D1D7CE] p-3 rounded-xs flex items-center justify-between text-xs max-w-md">
                        <div>
                          <p className="text-[10px] text-slate-400 font-mono uppercase">Household Head</p>
                          <p className="font-bold text-sm text-[#322A2C]">
                            {getResidentShortName(headResident)}
                          </p>
                        </div>
                        <span className="font-mono bg-[#FFF8F8] border border-[#D1D7CE] px-2 py-0.5 rounded">
                          {headResident.residentId}
                        </span>
                      </div>
                    )}

                    {/* Families Breakdown */}
                    <div>
                      <div className="flex items-center justify-between mb-3 border-b border-[#D1D7CE]/50 pb-1">
                        <h4 className="text-xs uppercase font-mono tracking-wider text-slate-500 font-bold flex items-center space-x-2">
                          <span></span>
                          <span>Families Unit List ({linkedFamilies.length})</span>
                        </h4>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setAddFamilyHouseholdId(household.householdId);
                            setShowAddFamilyModal(true);
                          }}
                          className="text-[10px] bg-[#322A2C] text-white px-2.5 py-1 rounded-xs font-semibold uppercase tracking-wider hover:bg-[#1f4260] cursor-pointer transition-colors"
                        >
                          + Add Family
                        </button>
                      </div>

                      {linkedFamilies.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {linkedFamilies.map((family) => {
                            const familyHeadRelation = family.familyHeadId
                              ? (residentsList || initialResidents).find(
                                  (r) => r.residentId === family.familyHeadId
                                )
                              : (residentsList || initialResidents).find(
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
                                  <span className="font-mono text-[10px] font-bold text-slate-500 bg-[#FFF8F8] border border-[#D1D7CE] px-1.5 py-0.25 rounded">
                                    {family.familyId}
                                  </span>
                                  {/* Update family status chips with Transferred option */}
                                  <span
                                    className={
                                      family.familyStatus === "Active"
                                        ? "seal-stamped-active scale-90"
                                        : family.familyStatus === "Transferred"
                                        ? "seal-stamped-gold scale-90"
                                        : "seal-stamped-inactive scale-90"
                                    }
                                  >
                                    {family.familyStatus}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-500">Family Head</p>
                                <p className="font-bold text-sm text-[#322A2C]">
                                  {familyHeadRelation
                                    ? getResidentShortName(familyHeadRelation)
                                    : "No Active Head Linked"}
                                </p>
                                <div className="mt-2 pt-2 border-t border-[#D1D7CE]/50 flex justify-between items-center text-xs text-slate-500">
                                  <span>
                                    Members: <strong>{memberCount}</strong>
                                  </span>
                                  <div className="flex items-center gap-1.5">
                                    {familyHeadRelation && (
                                      <span className="font-mono text-[10px] bg-[#FFF8F8] border px-1 border-[#D1D7CE] rounded">
                                        {familyHeadRelation.residentId}
                                      </span>
                                    )}
                                    <button
                                      onClick={(e) => openEditFamily(e, family)}
                                      className="border border-[#322A2C] text-[#322A2C] hover:bg-[#322A2C] hover:text-white text-[9px] px-1.5 py-0.5 uppercase font-semibold rounded-xs transition-colors cursor-pointer"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      onClick={(e) => handleDeleteFamily(e, family)}
                                      className="border border-[#9B3D30] text-[#9B3D30] hover:bg-[#9B3D30] hover:text-white text-[9px] px-1.5 py-0.5 uppercase font-semibold rounded-xs transition-colors cursor-pointer"
                                    >
                                      Del
                                    </button>
                                  </div>
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
                        <span></span>
                        <span>Resident Co-habitants Details ({residentMembers.length})</span>
                      </h4>

                      <div className="bg-white border border-[#D1D7CE] rounded-xs overflow-hidden">
                        <table className="ledger-table">
                          <thead>
                            <tr className="bg-[#FFF8F8]/60">
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
                                      <div className="font-bold text-[#322A2C] text-xs">
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
        <div className="fixed inset-0 bg-[#322A2C]/60 flex items-center justify-center p-4 z-50 backdrop-blur-xs">
          <div className="bg-white border-2 border-[#E8198A] w-full max-w-lg rounded-xs shadow-xl flex flex-col relative z-50">
            {/* Modal Header */}
            <div className="bg-[#E8198A] text-white px-6 py-4 flex justify-between items-center">
              <h3 className="font-serif font-bold text-lg flex items-center space-x-2">
                <span></span>
                <span>New Household Registration</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-white/80 hover:text-white text-xl font-bold cursor-pointer"
              >
                &times;
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleFormSubmit} className="p-6 space-y-4 font-sans">
              <div className="grid grid-cols-2 gap-4">
                {/* Street */}
                <div className="flex flex-col col-span-2">
                  <label className={labelClass}>Street <span className="text-red-600">*</span></label>
                  <select
                    value={formData.streetId}
                    onChange={(e) => setFormData({ ...formData, streetId: e.target.value })}
                    required
                    className={selectClass}
                  >
                    <option value="">Select Street...</option>
                    {streets.map((s) => (
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
                  <label className={labelClass}>Household Head (Resident ID)</label>
                  <SearchableSelect
                    name="householdHeadId"
                    value={formData.householdHeadId}
                    onChange={(e) => setFormData({ ...formData, householdHeadId: e.target.value })}
                    options={residentOptions}
                    placeholder="Select Household Head..."
                  />
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-3 border-t border-[#F8BBD0]/40 pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="border border-slate-300 text-slate-500 hover:text-slate-800 text-xs font-semibold px-4 py-2 uppercase tracking-wider rounded-xs cursor-pointer hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#E8198A] hover:bg-[#c41273] text-white text-xs font-semibold px-5 py-2 uppercase tracking-wider rounded-xs cursor-pointer transition-colors"
                >
                  Create Registry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Family Modal */}
      {showAddFamilyModal && (
        <div className="fixed inset-0 bg-[#322A2C]/60 flex items-center justify-center p-4 z-50 backdrop-blur-xs">
          <div className="bg-white border-2 border-[#E8198A] w-full max-w-md rounded-xs shadow-xl flex flex-col relative z-50">
            <div className="bg-[#E8198A] text-white px-6 py-4 flex justify-between items-center rounded-t-xs">
              <h3 className="font-serif font-bold text-lg flex items-center space-x-2">
                <span></span>
                <span>Add New Family Unit</span>
              </h3>
              <button
                onClick={() => setShowAddFamilyModal(false)}
                className="text-white/80 hover:text-white text-xl font-bold cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleFamilyFormSubmit} className="p-6 space-y-4 font-sans">
              <div className="bg-[#FCE4EC] border border-[#F8BBD0] rounded-xs p-3 text-xs text-slate-600">
                <p className="font-mono font-bold text-[#E8198A] mb-1">Household: {addFamilyHouseholdId}</p>
                <p>A new family unit will be created under this household. You can assign residents to this family when registering or editing them.</p>
              </div>

              <div className="flex flex-col relative z-[60]">
                <label className={labelClass}>Family Head (Optional)</label>
                <SearchableSelect
                  name="familyHeadId"
                  value={familyFormData.familyHeadId}
                  onChange={(e) => setFamilyFormData({ ...familyFormData, familyHeadId: e.target.value })}
                  options={residentOptions.filter(opt => 
                    opt.value === "" || (residentsList || initialResidents).find(r => r.residentId === opt.value)?.householdId === addFamilyHouseholdId
                  )}
                  placeholder="Select Head of Family..."
                />
                <p className="text-[10px] text-slate-400 mt-1 font-mono">Only residents in this household are shown.</p>
              </div>

              <div className="flex flex-col">
                <label className={labelClass}>Family Status</label>
                <select
                  value={familyFormData.familyStatus}
                  onChange={(e) => setFamilyFormData({ ...familyFormData, familyStatus: e.target.value })}
                  className={selectClass}
                >
                  <option value="Active">Active</option>
                  <option value="Transferred">Transferred</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 border-t border-[#F8BBD0]/40 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddFamilyModal(false)}
                  className="border border-slate-300 text-slate-500 hover:text-slate-800 text-xs font-semibold px-4 py-2 uppercase tracking-wider rounded-xs cursor-pointer hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#E8198A] hover:bg-[#c41273] text-white text-xs font-semibold px-5 py-2 uppercase tracking-wider rounded-xs cursor-pointer transition-colors"
                >
                  Create Family
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Household Modal */}
      {showEditHHModal && editHH && (
        <div className="fixed inset-0 bg-[#322A2C]/60 flex items-center justify-center p-4 z-50 backdrop-blur-xs">
          <div className="bg-white border-2 border-[#E8198A] w-full max-w-md rounded-xs shadow-xl flex flex-col relative z-50">
            <div className="bg-[#E8198A] text-white px-6 py-4 flex justify-between items-center rounded-t-xs">
              <h3 className="font-serif font-bold text-lg flex items-center space-x-2">
                <span></span>
                <span>Edit Household {editHH.householdId}</span>
              </h3>
              <button onClick={() => setShowEditHHModal(false)} className="text-white/80 hover:text-white text-xl font-bold cursor-pointer">&times;</button>
            </div>
            <form onSubmit={handleEditHH} className="p-6 space-y-4 font-sans">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className={labelClass}>Household Type</label>
                  <select
                    value={editHHForm.householdType}
                    onChange={(e) => setEditHHForm({ ...editHHForm, householdType: e.target.value })}
                    className={selectClass}
                  >
                    <option value="House">House</option>
                    <option value="Apartment">Apartment</option>
                    <option value="Boarding House">Boarding House</option>
                    <option value="Compound">Compound</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="flex flex-col">
                  <label className={labelClass}>Contact No.</label>
                  <input
                    type="text"
                    value={editHHForm.householdContactNo}
                    onChange={(e) => setEditHHForm({ ...editHHForm, householdContactNo: e.target.value })}
                    placeholder="e.g. 09171234567"
                    className={inputClass}
                  />
                </div>
              </div>
              <div className="flex flex-col relative z-[60]">
                <label className={labelClass}>Household Head (Resident)</label>
                <SearchableSelect
                  name="householdHeadId"
                  value={editHHForm.householdHeadId}
                  onChange={(e) => setEditHHForm({ ...editHHForm, householdHeadId: e.target.value })}
                  options={residentOptions}
                  placeholder="Select Household Head..."
                />
              </div>
              <div className="flex justify-end space-x-3 border-t border-[#F8BBD0]/40 pt-4 mt-4">
                <button type="button" onClick={() => setShowEditHHModal(false)}
                  className="border border-slate-300 text-slate-500 hover:text-slate-800 text-xs font-semibold px-4 py-2 uppercase tracking-wider rounded-xs cursor-pointer hover:bg-slate-50 transition-colors"
                >Cancel</button>
                <button type="submit" disabled={editHHSaving}
                  className="bg-[#E8198A] hover:bg-[#c41273] text-white text-xs font-semibold px-5 py-2 uppercase tracking-wider rounded-xs cursor-pointer transition-colors disabled:opacity-50"
                >{editHHSaving ? "Saving…" : "Save Changes"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Family Modal */}
      {showEditFamilyModal && editFamily && (
        <div className="fixed inset-0 bg-[#322A2C]/60 flex items-center justify-center p-4 z-50 backdrop-blur-xs">
          <div className="bg-white border-2 border-[#E8198A] w-full max-w-md rounded-xs shadow-xl flex flex-col relative z-50">
            <div className="bg-[#E8198A] text-white px-6 py-4 flex justify-between items-center rounded-t-xs">
              <h3 className="font-serif font-bold text-lg flex items-center space-x-2">
                <span></span>
                <span>Edit Family {editFamily.familyId}</span>
              </h3>
              <button onClick={() => setShowEditFamilyModal(false)} className="text-white/80 hover:text-white text-xl font-bold cursor-pointer">&times;</button>
            </div>
            <form onSubmit={handleEditFamily} className="p-6 space-y-4 font-sans">
              <div className="flex flex-col relative z-[60]">
                <label className={labelClass}>Family Head (Resident)</label>
                <SearchableSelect
                  name="familyHeadId"
                  value={editFamilyForm.familyHeadId}
                  onChange={(e) => setEditFamilyForm({ ...editFamilyForm, familyHeadId: e.target.value })}
                  options={residentOptions.filter(opt =>
                    opt.value === "" || (residentsList || residents || []).find(r => r.residentId === opt.value)?.householdId === editFamily.householdId
                  )}
                  placeholder="Select Head of Family..."
                />
                <p className="text-[10px] text-slate-400 mt-1 font-mono">Only residents in this household are shown.</p>
              </div>
              <div className="flex flex-col">
                <label className={labelClass}>Family Status</label>
                <select
                  value={editFamilyForm.familyStatus}
                  onChange={(e) => setEditFamilyForm({ ...editFamilyForm, familyStatus: e.target.value })}
                  className={selectClass}
                >
                  <option value="Active">Active</option>
                  <option value="Transferred">Transferred</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3 border-t border-[#F8BBD0]/40 pt-4">
                <button type="button" onClick={() => setShowEditFamilyModal(false)}
                  className="border border-slate-300 text-slate-500 hover:text-slate-800 text-xs font-semibold px-4 py-2 uppercase tracking-wider rounded-xs cursor-pointer hover:bg-slate-50 transition-colors"
                >Cancel</button>
                <button type="submit" disabled={editFamilySaving}
                  className="bg-[#E8198A] hover:bg-[#c41273] text-white text-xs font-semibold px-5 py-2 uppercase tracking-wider rounded-xs cursor-pointer transition-colors disabled:opacity-50"
                >{editFamilySaving ? "Saving…" : "Save Changes"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
