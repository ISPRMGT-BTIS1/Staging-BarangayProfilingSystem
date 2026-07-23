import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';

const DataContext = createContext();

export function DataProvider({ children }) {
  const [data, setData] = useState({
    residents: [],
    barangays: [],
    streets: [],
    addresses: [],
    households: [],
    families: [],
    users: [],
    roles: [],
    auditLog: [],
    loading: true
  });

  useEffect(() => {
    async function fetchAllData() {
      console.log('Fetching live data from Supabase...');
      try {
        const [
          { data: resData },
          { data: brgyData },
          { data: streetData },
          { data: addrData },
          { data: hhData },
          { data: famData },
          { data: userData },
          { data: roleData },
          { data: auditData },
          { data: statusesData }
        ] = await Promise.all([
          supabase.from('residents').select('*'),
          supabase.from('barangays').select('*'),
          supabase.from('streets').select('*'),
          supabase.from('addresses').select('*'),
          supabase.from('households').select('*'),
          supabase.from('families').select('*'),
          supabase.from('users').select('*'),
          supabase.from('roles').select('*'),
          supabase.from('audit_log').select('*').order('performed_at', { ascending: false }),
          supabase.from('resident_statuses').select('*')
        ]);

        setData({
          residents: (resData || []).map(r => ({
            residentId: r.resident_id,
            householdId: r.household_id,
            familyId: r.family_id,
            firstName: r.first_name,
            lastName: r.last_name,
            middleName: r.middle_name,
            extensionName: r.extension_name,
            dateOfBirth: r.date_of_birth,
            sex: r.sex,
            civilStatus: r.civil_status,
            citizenship: r.citizenship,
            occupation: r.occupation,
            bloodType: r.blood_type,
            religion: r.religion,
            contactNumber: r.contact_number,
            email: r.email,
            isActive: r.is_active,
            createdAt: r.created_at
          })),
          barangays: (brgyData || []).map(b => ({
            id: b.barangay_id,
            name: b.barangay_name,
            barangayId: b.barangay_id,
            barangayName: b.barangay_name,
            city: b.city,
            isActive: b.is_active
          })),
          streets: (streetData || []).map(s => ({
            streetId: s.street_id,
            barangayId: s.barangay_id,
            streetName: s.street_name
          })),
          addresses: (addrData || []).map(a => ({
            addressId: a.address_id,
            streetId: a.street_id,
            houseNo: a.house_no,
            unitNo: a.unit_no
          })),
          households: (hhData || []).map(h => ({
            householdId: h.household_id,
            addressId: h.address_id,
            householdHeadId: h.household_head_id,
            householdType: h.household_type,
            householdContactNo: h.household_contact_no,
            createdAt: h.created_at
          })),
          families: (famData || []).map(f => ({
            familyId: f.family_id,
            householdId: f.household_id,
            familyHeadId: f.family_head_id,
            createdAt: f.created_at
          })),
          users: (userData || []).map(u => ({
            userId: u.user_id,
            roleId: u.role_id,
            username: u.username,
            email: u.email,
            fullName: u.full_name,
            isActive: u.is_active
          })),
          roles: (roleData || []).map(r => ({
            roleId: r.role_id,
            roleName: r.role_name
          })),
          auditLog: (auditData || []).map(a => ({
            auditId: a.audit_id,
            tableName: a.table_name,
            recordId: a.record_id,
            actionType: a.action_type,
            performedBy: a.performed_by,
            performedAt: a.performed_at
          })),
          residentStatuses: (statusesData || []).map(s => ({
            residentStatusId: s.resident_status_id,
            residentId: s.resident_id,
            statusType: s.status_type,
            dateAdded: s.date_added,
            notes: s.notes
          })),
          loading: false
        });
      } catch (err) {
        console.error("Error fetching from Supabase:", err);
        setData(prev => ({ ...prev, loading: false }));
      }
    }

    fetchAllData();
  }, []);

  const helpers = React.useMemo(() => {
    return {
      calculateAge: (dob) => {
        if (!dob) return 0;
        const birthDate = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        return age;
      },
      calculateResidencyLength: (createdAt) => {
        if (!createdAt) return "Unknown";
        const createdDate = new Date(createdAt);
        const today = new Date();
        const diffTime = Math.abs(today - createdDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays < 30) return `${diffDays} days`;
        if (diffDays < 365) return `${Math.floor(diffDays / 30)} months`;
        return `${Math.floor(diffDays / 365)} years`;
      },
      getResidentDisplayName: (resident) => {
        if (!resident) return "Unknown Resident";
        const first = resident.firstName || "";
        const middleInitial = resident.middleName ? ` ${resident.middleName.charAt(0)}.` : "";
        const last = resident.lastName || "";
        const ext = resident.extensionName ? ` ${resident.extensionName}` : "";
        return `${first}${middleInitial} ${last}${ext}`.trim();
      },
      getResidentShortName: (resident) => {
        if (!resident) return "Unknown";
        return `${resident.firstName} ${resident.lastName}`.trim();
      },
      getHouseholdAddress: (householdId) => {
        const household = data.households.find(h => h.householdId === householdId);
        if (!household) return "N/A";
        const address = data.addresses.find(a => a.addressId === household.addressId);
        if (!address) return "N/A";
        const street = data.streets.find(s => s.streetId === address.streetId);
        if (!street) return address.houseNo;
        const unitStr = address.unitNo ? ` Unit ${address.unitNo},` : "";
        return `${address.houseNo}${unitStr} ${street.streetName}`;
      },
      getFullAddress: (householdId) => {
        const household = data.households.find(h => h.householdId === householdId);
        if (!household) return "N/A";
        const address = data.addresses.find(a => a.addressId === household.addressId);
        if (!address) return "N/A";
        const street = data.streets.find(s => s.streetId === address.streetId);
        if (!street) return address.houseNo;
        const barangay = data.barangays.find(b => b.id === street.barangayId || b.id === street.barangayId);
        const unitStr = address.unitNo ? ` Unit ${address.unitNo},` : "";
        return `${address.houseNo}${unitStr} ${street.streetName}, ${barangay?.name || ""}`;
      },
      getHouseholdBarangay: (householdId) => {
        const household = data.households.find(h => h.householdId === householdId);
        if (!household) return "N/A";
        const address = data.addresses.find(a => a.addressId === household.addressId);
        if (!address) return "N/A";
        const street = data.streets.find(s => s.streetId === address.streetId);
        if (!street) return "N/A";
        const barangay = data.barangays.find(b => b.id === street.barangayId || b.id === street.barangayId);
        return barangay?.name || "N/A";
      },
      getFamilyHeadName: (familyId) => {
        const family = data.families.find(f => f.familyId === familyId);
        if (!family) return "N/A";
        const head = data.residents.find(r => r.residentId === family.familyHeadId);
        return head ? `${head.firstName} ${head.lastName}` : "Unknown";
      },
      getFamilyMemberCount: (familyId) => {
        return data.residents.filter(r => r.familyId === familyId).length;
      },
      generateId: (prefix) => {
        return `${prefix}-${Date.now().toString().slice(-6)}`;
      },
      generatedReports: [
        { id: "REP-2024-001", name: "2024 Q1 Demographics Summary", type: "PDF", size: "1.2 MB", date: "2024-03-31" },
        { id: "REP-2024-002", name: "Senior Citizens Masterlist", type: "XLSX", size: "450 KB", date: "2024-04-15" },
        { id: "REP-2024-003", name: "Registered Voters per Barangay", type: "PDF", size: "890 KB", date: "2024-05-10" }
      ],
      localPrograms: [
        { id: "LP-1", name: "Vaccine Center", location: "Barangay Hall", status: "Active" },
        { id: "LP-2", name: "Relief Distribution", location: "Covered Court", status: "Upcoming" },
        { id: "LP-3", name: "Medical Mission", location: "Health Center", status: "Active" }
      ]
    };
  }, [data]);

  return (
    <DataContext.Provider value={{ ...data, helpers }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  return useContext(DataContext);
}
