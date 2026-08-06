import React, { useState } from "react";
import { useData } from "../context/DataContext";
import { logAudit } from "../utils/auditLogger";

export default function ResidentDetailView({ residentId, residentsList, onBack }) {
  const { residents, households, addresses, streets, barangays, residentStatuses, auditLog, families, helpers: {
    getResidentDisplayName,
    getResidentShortName,
    calculateAge,
    calculateResidencyLength,
    getHouseholdAddress,
    getFullAddress,
    getHouseholdBarangay,
    getFamilyHeadName,
    generateId
  } } = useData();
  const resident = residents.find(r => r.residentId === residentId);
  const [activeTab, setActiveTab] = useState("personal");

  if (!resident) {
    return (
      <div className="flex-1 p-6 overflow-y-auto space-y-6">
        <div className="bg-white border border-[#D1D7CE] p-8 text-center text-slate-400 font-serif italic rounded-xs">
          Resident record not found.
          <button
            onClick={onBack}
            className="mt-4 block mx-auto bg-[#322A2C] hover:bg-[#1f4260] text-white px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-xs cursor-pointer"
          >
            Back to Registry
          </button>
        </div>
      </div>
    );
  }

  // Look up statuses
  const statuses = residentStatuses.filter(s => s.residentId === resident.residentId);

  // Address lookup
  const household = households.find(h => h.householdId === resident.householdId);
  const address = household ? addresses.find(a => a.addressId === household.addressId) : null;
  const street = address ? streets.find(s => s.streetId === address.streetId) : null;
  const barangay = street ? barangays.find(b => b.id === street.barangayId) : null;

  // Family details
  const family = families.find(f => f.familyId === resident.familyId);
  const familyMembers = residents.filter(r => r.familyId === resident.familyId && r.residentId !== resident.residentId && r.residencyStatus !== "Deceased");
  const children = residents.filter(r => r.parentId === resident.residentId && r.residencyStatus !== "Deceased");
  const parent = residents.find(r => r.residentId === resident.parentId);

  // Audit logs for this resident
  const residentAuditLogs = auditLog.filter(log => log.recordId === residentId || (log.details && log.details.includes(residentId)));

  const computedAge = calculateAge(resident.birthDate);

  const tabs = [
    { id: "personal", label: "Personal" },
    { id: "address", label: "Address" },
    { id: "statuses", label: "Statuses" },
    { id: "family", label: "Family" },
    { id: "audit", label: "Audit Trail" }
  ];

  return (
    <div className="flex-1 p-6 overflow-y-auto space-y-6">
      {/* Detail Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-serif text-[#322A2C]">Resident Profile Registry</h1>
          <p className="text-sm text-slate-500 font-sans">Official profile log database for verifying residency and program qualifications</p>
        </div>
        <button
          onClick={onBack}
          className="border border-[#322A2C] text-[#322A2C] hover:bg-[#322A2C] hover:text-white text-xs font-semibold px-4 py-2 uppercase tracking-wider rounded-xs cursor-pointer transition-colors"
        >
          &larr; Back to Registry
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: ID Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="ledger-container p-6 bg-white border border-[#D1D7CE] rounded-xs shadow-sm flex flex-col items-center relative overflow-hidden">
            {/* Stamp Stamp Stamp */}
            <div className="absolute top-4 right-4">
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
            </div>

            {/* Photo / ID Placeholder */}
            {resident.photo_url ? (
              <div className="w-32 h-32 rounded-full border-4 border-double border-[#322A2C] bg-[#FFF8F8] flex items-center justify-center overflow-hidden mb-4 shadow-inner mt-4">
                <img src={resident.photo_url} alt="Resident Photo" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-32 h-32 rounded-full border-4 border-double border-[#322A2C] bg-[#FFF8F8] flex items-center justify-center text-4xl mb-4 text-[#322A2C]/60 shadow-inner select-none mt-4">
                
              </div>
            )}

            {/* Profile Info */}
            <div className="text-center w-full space-y-1">
              <h2 className="text-lg font-bold font-serif text-[#322A2C] truncate">
                {resident.lastName}, {resident.firstName}
              </h2>
              {resident.middleName && (
                <p className="text-xs text-slate-500 italic">Middle: {resident.middleName}</p>
              )}
              <div className="text-[10px] text-slate-400 font-mono tracking-wider">
                ID: <span className="font-bold">{resident.residentId}</span>
              </div>
              <div className="text-xs font-semibold text-slate-600 mt-2">
                {computedAge} yrs &bull; {resident.sex} &bull; {resident.civilStatus}
              </div>
              <div className="text-xs text-slate-500 uppercase font-mono tracking-wide mt-1">
                {barangay?.name || "No Barangay Link"}
              </div>
            </div>

            {/* Micro details at bottom */}
            <div className="w-full border-t border-[#D1D7CE] mt-6 pt-4 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400 font-mono uppercase text-[9px]">Length of Residency:</span>
                <span className="font-semibold">{calculateResidencyLength(resident.residencySince)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-mono uppercase text-[9px]">Citizenship:</span>
                <span className="font-semibold">{resident.citizenship}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-mono uppercase text-[9px]">Role in Family:</span>
                <span className="font-semibold">{resident.isDependent ? "Dependent" : "Family Head"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Tabbed Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="ledger-container bg-white border border-[#D1D7CE] rounded-xs shadow-sm min-h-[400px] flex flex-col">
            {/* Tabs Header */}
            <div className="border-b border-[#D1D7CE] flex bg-[#FFF8F8]/40 overflow-x-auto">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-3.5 text-xs font-bold uppercase tracking-wider border-r border-[#D1D7CE] transition-all cursor-pointer font-mono ${
                    activeTab === tab.id
                      ? "bg-white text-[#322A2C] border-b-2 border-b-[#C8932B]"
                      : "text-slate-500 hover:text-[#322A2C] hover:bg-[#FFF8F8]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tabs Content */}
            <div className="p-6 flex-1">
              {/* Tab 1: Personal Information */}
              {activeTab === "personal" && (
                <div className="space-y-6">
                  <h3 className="text-sm font-serif font-bold text-[#E8198A] border-b border-[#F8BBD0] pb-2">Personal Details (RBI Form B)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    {resident.philsysCardNo && (
                      <div className="md:col-span-2 bg-[#FCE4EC] border border-[#F8BBD0] p-2.5 rounded-xs">
                        <p className="text-[10px] uppercase font-mono text-[#E8198A] font-bold">PhilSys Card No. (National ID)</p>
                        <p className="font-mono font-bold text-[#322A2C] mt-0.5">{resident.philsysCardNo}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-[10px] uppercase font-mono text-slate-400">First Name</p>
                      <p className="font-semibold text-[#322A2C] mt-0.5">{resident.firstName}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-mono text-slate-400">Middle Name</p>
                      <p className="font-semibold text-[#322A2C] mt-0.5">{resident.middleName || "—"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-mono text-slate-400">Last Name</p>
                      <p className="font-semibold text-[#322A2C] mt-0.5">{resident.lastName} {resident.extensionName ? `(${resident.extensionName})` : ""}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-mono text-slate-400">Date of Birth</p>
                      <p className="font-semibold text-[#322A2C] mt-0.5">{resident.birthDate}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-mono text-slate-400">Place of Birth</p>
                      <p className="font-semibold text-[#322A2C] mt-0.5">{resident.birthPlace || "—"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-mono text-slate-400">Sex</p>
                      <p className="font-semibold text-[#322A2C] mt-0.5">{resident.sex}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-mono text-slate-400">Civil Status</p>
                      <p className="font-semibold text-[#322A2C] mt-0.5">{resident.civilStatus}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-mono text-slate-400">Religion</p>
                      <p className="font-semibold text-[#322A2C] mt-0.5">{resident.religion || "—"}</p>
                    </div>
                  </div>

                  <h3 className="text-sm font-serif font-bold text-[#E8198A] border-b border-[#F8BBD0] pb-2 pt-4">Work, Education & Contact</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-[10px] uppercase font-mono text-slate-400">Occupation</p>
                      <p className="font-semibold text-[#322A2C] mt-0.5">{resident.occupation || "Unemployed"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-mono text-slate-400">Company / Workplace</p>
                      <p className="font-semibold text-[#322A2C] mt-0.5">{resident.company || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-mono text-slate-400">Educational Attainment</p>
                      <p className="font-semibold text-[#322A2C] mt-0.5">{resident.educationalAttainment || "None"} ({resident.educationStatus || "Graduate"})</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-mono text-slate-400">Contact Number</p>
                      <p className="font-semibold text-[#322A2C] mt-0.5">{resident.contactNumber || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-mono text-slate-400">E-mail Address</p>
                      <p className="font-semibold text-[#322A2C] mt-0.5">{resident.emailAddress || "—"}</p>
                    </div>
                  </div>

                  <h3 className="text-sm font-serif font-bold text-[#322A2C] border-b border-[#D1D7CE] pb-2 pt-4">Emergency Contact</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-[10px] uppercase font-mono text-slate-400">Contact Name</p>
                      <p className="font-semibold text-[#322A2C] mt-0.5">{resident.emergencyContactName || "—"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-mono text-slate-400">Relationship</p>
                      <p className="font-semibold text-[#322A2C] mt-0.5">{resident.emergencyContactRelationship || "—"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-mono text-slate-400">Contact Number</p>
                      <p className="font-semibold text-[#322A2C] mt-0.5">{resident.emergencyContactNumber || "—"}</p>
                    </div>
                  </div>

                  <h3 className="text-sm font-serif font-bold text-[#322A2C] border-b border-[#D1D7CE] pb-2 pt-4">Scanned Valid ID</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    {resident.valid_id_url ? (
                      <div className="h-40 w-full md:w-3/4 rounded border border-[#D1D7CE] bg-[#FFF8F8] flex items-center justify-center overflow-hidden">
                        <img src={resident.valid_id_url} alt="Valid ID" className="max-w-full max-h-full object-contain" />
                      </div>
                    ) : (
                      <div className="h-24 w-full md:w-3/4 rounded border border-dashed border-[#D1D7CE] bg-[#FFF8F8] flex items-center justify-center text-xs text-slate-400 italic">
                        No Valid ID uploaded
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tab 2: Address */}
              {activeTab === "address" && (
                <div className="space-y-6">
                  <h3 className="text-sm font-serif font-bold text-[#322A2C] border-b border-[#D1D7CE] pb-2">Address & Location Assignment</h3>
                  
                  {/* Breadcrumbs matching layout */}
                  <div className="bg-[#FFF8F8] border border-[#D1D7CE] p-4 rounded-xs text-xs space-y-2">
                    <div className="flex items-center text-slate-500 font-mono uppercase text-[10px]">
                      <span>Barangay</span>
                      <span className="mx-2">&rarr;</span>
                      <span>Street</span>
                      <span className="mx-2">&rarr;</span>
                      <span>House Number</span>
                      {address?.unitNo && (
                        <>
                          <span className="mx-2">&rarr;</span>
                          <span>Unit</span>
                        </>
                      )}
                    </div>
                    <div className="text-[#322A2C] font-serif text-sm font-bold flex flex-wrap items-baseline gap-1">
                      <span>{barangay?.name || "N/A"}</span>
                      <span className="text-slate-400 font-sans font-normal mx-1">/</span>
                      <span>{street?.streetName || "N/A"}</span>
                      <span className="text-slate-400 font-sans font-normal mx-1">/</span>
                      <span>No. {address?.houseNo || "N/A"}</span>
                      {address?.unitNo && (
                        <>
                          <span className="text-slate-400 font-sans font-normal mx-1">/</span>
                          <span>Unit {address.unitNo}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm pt-2">
                    <div>
                      <p className="text-[10px] uppercase font-mono text-slate-400">Household ID Link</p>
                      <p className="font-mono font-semibold text-[#322A2C] mt-0.5">{resident.householdId || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-mono text-slate-400">Family ID Link</p>
                      <p className="font-mono font-semibold text-[#322A2C] mt-0.5">{resident.familyId || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-mono text-slate-400">Full Address String</p>
                      <p className="font-semibold text-[#322A2C] mt-0.5">{getFullAddress(resident.householdId)}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Statuses */}
              {activeTab === "statuses" && (
                <div className="space-y-6">
                  <h3 className="text-sm font-serif font-bold text-[#322A2C] border-b border-[#D1D7CE] pb-2">Active Status Tags</h3>
                  
                  {statuses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {statuses.map(status => (
                        <div key={status.residentStatusId} className="bg-[#FFF8F8] border border-[#D1D7CE] p-4 rounded-xs shadow-2xs">
                          <div className="flex justify-between items-baseline mb-2">
                            <span className="font-serif font-bold text-[#322A2C] text-sm">
                              {status.statusType}
                            </span>
                            <span className="text-[9px] font-mono text-slate-400">
                              Added: {status.dateAdded}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600">
                            <strong>Notes:</strong> {status.notes || "No special constraints or benefits recorded."}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic py-4">No active status tags (Senior Citizen, PWD, Voter, Solo Parent, etc.) assigned to this resident.</p>
                  )}
                </div>
              )}

              {/* Tab 4: Family */}
              {activeTab === "family" && (
                <div className="space-y-6">
                  {/* Family Unit Header */}
                  <div>
                    <h3 className="text-sm font-serif font-bold text-[#322A2C] border-b border-[#D1D7CE] pb-2">Family Unit Information</h3>
                    <p className="text-xs text-slate-500 font-mono mt-1">
                      Family ID: <span className="font-bold text-[#322A2C]">{resident.familyId || "None"}</span>
                    </p>
                  </div>

                  {/* Parent */}
                  <div>
                    <p className="text-[10px] uppercase font-mono text-slate-400 mb-1">Parent (Linked Resident)</p>
                    {parent ? (
                      <div className="flex items-center justify-between bg-[#FFF8F8] border border-[#D1D7CE] p-3 rounded-xs text-xs">
                        <div>
                          <p className="font-bold text-[#322A2C]">{getResidentDisplayName(parent)}</p>
                          <p className="text-[10px] text-slate-400 font-mono">Resident ID: {parent.residentId}</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic">No parent link configured.</p>
                    )}
                  </div>

                  {/* Children */}
                  <div>
                    <p className="text-[10px] uppercase font-mono text-slate-400 mb-1">Children in Registry ({children.length})</p>
                    {children.length > 0 ? (
                      <div className="space-y-2">
                        {children.map(child => (
                          <div key={child.residentId} className="flex items-center justify-between bg-[#FFF8F8] border border-[#D1D7CE]/70 p-3 rounded-xs text-xs">
                            <div>
                              <p className="font-bold text-[#322A2C]">{getResidentDisplayName(child)}</p>
                              <p className="text-[10px] text-slate-400 font-mono">Resident ID: {child.residentId} &bull; Age: {calculateAge(child.birthDate)} yrs</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic">No children links recorded in this registry.</p>
                    )}
                  </div>

                  {/* Other family members in the same unit */}
                  <div>
                    <p className="text-[10px] uppercase font-mono text-slate-400 mb-1">Co-members in Family Unit ({familyMembers.length})</p>
                    {familyMembers.length > 0 ? (
                      <div className="space-y-2">
                        {familyMembers.map(member => (
                          <div key={member.residentId} className="flex items-center justify-between bg-white border border-[#D1D7CE]/70 p-2.5 rounded-xs text-xs">
                            <div>
                              <p className="font-bold text-[#322A2C]">{getResidentShortName(member)}</p>
                              <p className="text-[10px] text-slate-400 font-mono">ID: {member.residentId} &bull; Age: {calculateAge(member.birthDate)} yrs &bull; {member.sex}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic">No other co-members in the family unit registry.</p>
                    )}
                  </div>
                </div>
              )}

              {/* Tab 5: Audit Trail */}
              {activeTab === "audit" && (
                <div className="space-y-6">
                  <h3 className="text-sm font-serif font-bold text-[#322A2C] border-b border-[#D1D7CE] pb-2">Audit Trail Logs</h3>
                  {residentAuditLogs.length > 0 ? (
                    <div className="divide-y divide-[#D1D7CE]/40 font-mono text-xs max-h-80 overflow-y-auto">
                      {residentAuditLogs.map(log => (
                        <div key={log.auditId} className="py-2.5 flex justify-between items-start gap-4">
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-[#322A2C]">{log.actionType}</span>
                              <span className="text-[10px] text-slate-400 font-sans">on {log.tableName}</span>
                            </div>
                            <p className="text-xs text-slate-500 font-sans mt-1">{log.details}</p>
                          </div>
                          <div className="text-right text-[10px] text-slate-400">
                            <p>By: {log.performedBy}</p>
                            <p className="mt-0.5">{new Date(log.performedAt).toLocaleString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic py-4">No logged modifications or queries recorded for this resident record.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
