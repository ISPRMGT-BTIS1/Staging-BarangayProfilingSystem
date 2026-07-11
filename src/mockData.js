// Realistic Filipino Sample Data for Barangay Profiling System (Brgy. System)
// Based on June 29 DB Schema · Barangay Profiling System

export const barangays = [
  { id: "BRGY-1", name: "Barangay San Jose" },
  { id: "BRGY-2", name: "Barangay Santa Isabel" }
];

// NEW: streets
export const streets = [
  { streetId: "ST-1", barangayId: "BRGY-1", streetName: "Rizal Avenue" },
  { streetId: "ST-2", barangayId: "BRGY-1", streetName: "Magsaysay St." },
  { streetId: "ST-3", barangayId: "BRGY-2", streetName: "Mabini St." },
  { streetId: "ST-4", barangayId: "BRGY-2", streetName: "Bonifacio St." },
  { streetId: "ST-5", barangayId: "BRGY-1", streetName: "Katipunan Avenue" }
];

// NEW: addresses (separate from households)
export const addresses = [
  { addressId: "A-1", streetId: "ST-1", houseNo: "12A", unitNo: null },
  { addressId: "A-2", streetId: "ST-2", houseNo: "45", unitNo: null },
  { addressId: "A-3", streetId: "ST-3", houseNo: "108", unitNo: null },
  { addressId: "A-4", streetId: "ST-4", houseNo: "33B", unitNo: null },
  { addressId: "A-5", streetId: "ST-5", houseNo: "201", unitNo: null }
];

// UPDATED: households now reference addressId, have new types and contact
export const households = [
  {
    householdId: "H-1",
    addressId: "A-1",
    householdHeadId: "R-0001",
    householdType: "House",
    householdContactNo: "09171234567",
    status: "Active"
  },
  {
    householdId: "H-2",
    addressId: "A-2",
    householdHeadId: "R-0005",
    householdType: "House",
    householdContactNo: "09204445566",
    status: "Active"
  },
  {
    householdId: "H-3",
    addressId: "A-3",
    householdHeadId: "R-0013",
    householdType: "Apartment",
    householdContactNo: "09164448888",
    status: "Active"
  },
  {
    householdId: "H-4",
    addressId: "A-4",
    householdHeadId: "R-0016",
    householdType: "House",
    householdContactNo: "09054443333",
    status: "Active"
  },
  {
    householdId: "H-5",
    addressId: "A-5",
    householdHeadId: "R-0020",
    householdType: "Compound",
    householdContactNo: "09112223333",
    status: "Active"
  }
];

// UPDATED: families — removed hardcoded memberCount and familyHead string
// familyHead and memberCount are now derived from residents + familyRelations
export const families = [
  { familyId: "F-1", householdId: "H-1", status: "Active" },
  { familyId: "F-2", householdId: "H-2", status: "Active" },
  { familyId: "F-3", householdId: "H-2", status: "Active" },
  { familyId: "F-4", householdId: "H-3", status: "Active" },
  { familyId: "F-5", householdId: "H-4", status: "Active" },
  { familyId: "F-6", householdId: "H-5", status: "Active" }
];

// UPDATED: residents — split name, removed age (computed), added new fields
export const residents = [
  // Household 1, Family 1
  {
    residentId: "R-0001",
    firstName: "Juan", middleName: "Santos", lastName: "Dela Cruz",
    birthDate: "1978-05-15",
    sex: "Male", civilStatus: "Married",
    contactNumber: "09171234567",
    occupation: "Jeepney Driver", company: "Araneta Cubao Terminal",
    citizenship: "Filipino",
    residencyStatus: "Active",
    residencyLengthYears: 15,
    isDependent: false,
    householdId: "H-1", familyId: "F-1",
    parentId: null,
    emergencyContactName: "Corazon Dela Cruz",
    emergencyContactRelationship: "Spouse",
    emergencyContactNumber: "09187654321",
    createdBy: "USR-1", createdAt: "2026-01-10",
    updatedBy: null, updatedAt: null
  },
  {
    residentId: "R-0002",
    firstName: "Corazon", middleName: "Reyes", lastName: "Dela Cruz",
    birthDate: "1980-11-20",
    sex: "Female", civilStatus: "Married",
    contactNumber: "09187654321",
    occupation: "Sari-sari Store Owner", company: "Home-based",
    citizenship: "Filipino",
    residencyStatus: "Active",
    residencyLengthYears: 15,
    isDependent: false,
    householdId: "H-1", familyId: "F-1",
    parentId: null,
    emergencyContactName: "Juan Dela Cruz",
    emergencyContactRelationship: "Spouse",
    emergencyContactNumber: "09171234567",
    createdBy: "USR-1", createdAt: "2026-01-10",
    updatedBy: null, updatedAt: null
  },
  {
    residentId: "R-0003",
    firstName: "Jose", middleName: "Santos", lastName: "Dela Cruz",
    birthDate: "2005-08-12",
    sex: "Male", civilStatus: "Single",
    contactNumber: "09192233445",
    occupation: "College Student", company: "PUP Manila",
    citizenship: "Filipino",
    residencyStatus: "Active",
    residencyLengthYears: 15,
    isDependent: true,
    householdId: "H-1", familyId: "F-1",
    parentId: "R-0001",
    emergencyContactName: "Juan Dela Cruz",
    emergencyContactRelationship: "Father",
    emergencyContactNumber: "09171234567",
    createdBy: "USR-1", createdAt: "2026-01-10",
    updatedBy: null, updatedAt: null
  },
  {
    residentId: "R-0004",
    firstName: "Maria", middleName: "Santos", lastName: "Dela Cruz",
    birthDate: "2010-02-05",
    sex: "Female", civilStatus: "Single",
    contactNumber: "N/A",
    occupation: "High School Student", company: "San Jose National HS",
    citizenship: "Filipino",
    residencyStatus: "Active",
    residencyLengthYears: 15,
    isDependent: true,
    householdId: "H-1", familyId: "F-1",
    parentId: "R-0001",
    emergencyContactName: "Corazon Dela Cruz",
    emergencyContactRelationship: "Mother",
    emergencyContactNumber: "09187654321",
    createdBy: "USR-1", createdAt: "2026-01-10",
    updatedBy: null, updatedAt: null
  },

  // Household 2, Family 2 & Family 3 (Multiple Families in one Household)
  // Family 2
  {
    residentId: "R-0005",
    firstName: "Maria", middleName: "Lim", lastName: "Santos",
    birthDate: "1960-09-10",
    sex: "Female", civilStatus: "Widowed",
    contactNumber: "09204445566",
    occupation: "Retired Public Teacher", company: "DepEd (Retired)",
    citizenship: "Filipino",
    residencyStatus: "Active",
    residencyLengthYears: 8,
    isDependent: false,
    householdId: "H-2", familyId: "F-2",
    parentId: null,
    emergencyContactName: "Pedro Santos",
    emergencyContactRelationship: "Son",
    emergencyContactNumber: "09159998877",
    createdBy: "USR-1", createdAt: "2026-01-10",
    updatedBy: null, updatedAt: null
  },
  {
    residentId: "R-0006",
    firstName: "Pedro", middleName: "Lim", lastName: "Santos",
    birthDate: "1985-03-30",
    sex: "Male", civilStatus: "Married",
    contactNumber: "09159998877",
    occupation: "Barangay Kagawad", company: "Barangay San Jose LGU",
    citizenship: "Filipino",
    residencyStatus: "Active",
    residencyLengthYears: 8,
    isDependent: false,
    householdId: "H-2", familyId: "F-2",
    parentId: "R-0005",
    emergencyContactName: "Gloria Santos",
    emergencyContactRelationship: "Spouse",
    emergencyContactNumber: "09163332211",
    createdBy: "USR-1", createdAt: "2026-01-10",
    updatedBy: null, updatedAt: null
  },
  {
    residentId: "R-0007",
    firstName: "Gloria", middleName: "Tan", lastName: "Santos",
    birthDate: "1988-12-04",
    sex: "Female", civilStatus: "Married",
    contactNumber: "09163332211",
    occupation: "Nurse", company: "Manila Doctors Hospital",
    citizenship: "Filipino",
    residencyStatus: "Active",
    residencyLengthYears: 8,
    isDependent: false,
    householdId: "H-2", familyId: "F-2",
    parentId: null,
    emergencyContactName: "Pedro Santos",
    emergencyContactRelationship: "Spouse",
    emergencyContactNumber: "09159998877",
    createdBy: "USR-1", createdAt: "2026-01-10",
    updatedBy: null, updatedAt: null
  },
  {
    residentId: "R-0008",
    firstName: "Joshua", middleName: "Lim", lastName: "Santos",
    birthDate: "2015-06-18",
    sex: "Male", civilStatus: "Single",
    contactNumber: "N/A",
    occupation: "Elementary Pupil", company: "San Jose Elem. School",
    citizenship: "Filipino",
    residencyStatus: "Active",
    residencyLengthYears: 8,
    isDependent: true,
    householdId: "H-2", familyId: "F-2",
    parentId: "R-0006",
    emergencyContactName: "Pedro Santos",
    emergencyContactRelationship: "Father",
    emergencyContactNumber: "09159998877",
    createdBy: "USR-1", createdAt: "2026-01-10",
    updatedBy: null, updatedAt: null
  },
  {
    residentId: "R-0009",
    firstName: "Angel", middleName: "Lim", lastName: "Santos",
    birthDate: "2018-01-22",
    sex: "Female", civilStatus: "Single",
    contactNumber: "N/A",
    occupation: "Elementary Pupil", company: "San Jose Elem. School",
    citizenship: "Filipino",
    residencyStatus: "Active",
    residencyLengthYears: 8,
    isDependent: true,
    householdId: "H-2", familyId: "F-2",
    parentId: "R-0006",
    emergencyContactName: "Gloria Santos",
    emergencyContactRelationship: "Mother",
    emergencyContactNumber: "09163332211",
    createdBy: "USR-1", createdAt: "2026-01-10",
    updatedBy: null, updatedAt: null
  },
  // Family 3 (Tenant / co-living in H-2)
  {
    residentId: "R-0010",
    firstName: "Cardo", middleName: "Reyes", lastName: "Dalisay",
    birthDate: "1982-04-14",
    sex: "Male", civilStatus: "Married",
    contactNumber: "09211112222",
    occupation: "Security Guard", company: "SecureGuard Agency",
    citizenship: "Filipino",
    residencyStatus: "Active",
    residencyLengthYears: 3,
    isDependent: false,
    householdId: "H-2", familyId: "F-3",
    parentId: null,
    emergencyContactName: "Alyana Dalisay",
    emergencyContactRelationship: "Spouse",
    emergencyContactNumber: "09228889999",
    createdBy: "USR-1", createdAt: "2026-01-10",
    updatedBy: null, updatedAt: null
  },
  {
    residentId: "R-0011",
    firstName: "Alyana", middleName: "Cruz", lastName: "Dalisay",
    birthDate: "1984-07-19",
    sex: "Female", civilStatus: "Married",
    contactNumber: "09228889999",
    occupation: "Call Center Agent", company: "Convergys Ortigas",
    citizenship: "Filipino",
    residencyStatus: "Active",
    residencyLengthYears: 3,
    isDependent: false,
    householdId: "H-2", familyId: "F-3",
    parentId: null,
    emergencyContactName: "Cardo Dalisay",
    emergencyContactRelationship: "Spouse",
    emergencyContactNumber: "09211112222",
    createdBy: "USR-1", createdAt: "2026-01-10",
    updatedBy: null, updatedAt: null
  },
  {
    residentId: "R-0012",
    firstName: "Ricky Boy", middleName: "Reyes", lastName: "Dalisay",
    birthDate: "2013-10-02",
    sex: "Male", civilStatus: "Single",
    contactNumber: "N/A",
    occupation: "Elementary Pupil", company: "San Jose Elem. School",
    citizenship: "Filipino",
    residencyStatus: "Active",
    residencyLengthYears: 3,
    isDependent: true,
    householdId: "H-2", familyId: "F-3",
    parentId: "R-0010",
    emergencyContactName: "Cardo Dalisay",
    emergencyContactRelationship: "Father",
    emergencyContactNumber: "09211112222",
    createdBy: "USR-1", createdAt: "2026-01-10",
    updatedBy: null, updatedAt: null
  },

  // Household 3, Family 4
  {
    residentId: "R-0013",
    firstName: "Leonora", middleName: "Garcia", lastName: "Aquino",
    birthDate: "1955-08-25",
    sex: "Female", civilStatus: "Widowed",
    contactNumber: "09164448888",
    occupation: "Retired Cook", company: "N/A",
    citizenship: "Filipino",
    residencyStatus: "Active",
    residencyLengthYears: 20,
    isDependent: false,
    householdId: "H-3", familyId: "F-4",
    parentId: null,
    emergencyContactName: "Kris Aquino",
    emergencyContactRelationship: "Daughter",
    emergencyContactNumber: "09267771111",
    createdBy: "USR-1", createdAt: "2026-01-10",
    updatedBy: null, updatedAt: null
  },
  {
    residentId: "R-0014",
    firstName: "Kris", middleName: "Garcia", lastName: "Aquino",
    birthDate: "1987-02-14",
    sex: "Female", civilStatus: "Single",
    contactNumber: "09267771111",
    occupation: "Online Seller", company: "Shopee/Lazada Home-based",
    citizenship: "Filipino",
    residencyStatus: "Active",
    residencyLengthYears: 20,
    isDependent: false,
    householdId: "H-3", familyId: "F-4",
    parentId: "R-0013",
    emergencyContactName: "Leonora Aquino",
    emergencyContactRelationship: "Mother",
    emergencyContactNumber: "09164448888",
    createdBy: "USR-1", createdAt: "2026-01-10",
    updatedBy: null, updatedAt: null
  },
  {
    residentId: "R-0015",
    firstName: "Bimby", middleName: "Garcia", lastName: "Aquino",
    birthDate: "2007-04-19",
    sex: "Male", civilStatus: "Single",
    contactNumber: "09278882222",
    occupation: "Senior High Student", company: "Sta. Isabel Integrated HS",
    citizenship: "Filipino",
    residencyStatus: "Active",
    residencyLengthYears: 19,
    isDependent: true,
    householdId: "H-3", familyId: "F-4",
    parentId: "R-0014",
    emergencyContactName: "Kris Aquino",
    emergencyContactRelationship: "Mother",
    emergencyContactNumber: "09267771111",
    createdBy: "USR-1", createdAt: "2026-01-10",
    updatedBy: null, updatedAt: null
  },

  // Household 4, Family 5
  {
    residentId: "R-0016",
    firstName: "Rodrigo", middleName: "Cruz", lastName: "Marcos",
    birthDate: "1972-09-13",
    sex: "Male", civilStatus: "Married",
    contactNumber: "09054443333",
    occupation: "Construction Worker", company: "Megawide Construction",
    citizenship: "Filipino",
    residencyStatus: "Active",
    residencyLengthYears: 4,
    isDependent: false,
    householdId: "H-4", familyId: "F-5",
    parentId: null,
    emergencyContactName: "Imelda Marcos",
    emergencyContactRelationship: "Spouse",
    emergencyContactNumber: "09062221111",
    createdBy: "USR-1", createdAt: "2026-01-10",
    updatedBy: null, updatedAt: null
  },
  {
    residentId: "R-0017",
    firstName: "Imelda", middleName: "Lopez", lastName: "Marcos",
    birthDate: "1975-07-02",
    sex: "Female", civilStatus: "Married",
    contactNumber: "09062221111",
    occupation: "Laundry Worker", company: "Self-employed",
    citizenship: "Filipino",
    residencyStatus: "Active",
    residencyLengthYears: 4,
    isDependent: false,
    householdId: "H-4", familyId: "F-5",
    parentId: null,
    emergencyContactName: "Rodrigo Marcos",
    emergencyContactRelationship: "Spouse",
    emergencyContactNumber: "09054443333",
    createdBy: "USR-1", createdAt: "2026-01-10",
    updatedBy: null, updatedAt: null
  },
  {
    residentId: "R-0018",
    firstName: "Ferdinand", middleName: "Cruz", lastName: "Marcos Jr.",
    birthDate: "1999-09-24",
    sex: "Male", civilStatus: "Single",
    contactNumber: "09075556666",
    occupation: "Tricycle Driver", company: "Self-employed",
    citizenship: "Filipino",
    residencyStatus: "Active",
    residencyLengthYears: 4,
    isDependent: false,
    householdId: "H-4", familyId: "F-5",
    parentId: "R-0016",
    emergencyContactName: "Rodrigo Marcos",
    emergencyContactRelationship: "Father",
    emergencyContactNumber: "09054443333",
    createdBy: "USR-1", createdAt: "2026-01-10",
    updatedBy: null, updatedAt: null
  },
  {
    residentId: "R-0019",
    firstName: "Imee", middleName: "Cruz", lastName: "Marcos",
    birthDate: "2001-11-12",
    sex: "Female", civilStatus: "Single",
    contactNumber: "09087778888",
    occupation: "Sales Clerk", company: "SM Department Store",
    citizenship: "Filipino",
    residencyStatus: "Moved",
    residencyLengthYears: 3,
    isDependent: false,
    householdId: "H-4", familyId: "F-5",
    parentId: "R-0016",
    emergencyContactName: "Imelda Marcos",
    emergencyContactRelationship: "Mother",
    emergencyContactNumber: "09062221111",
    createdBy: "USR-1", createdAt: "2026-01-10",
    updatedBy: null, updatedAt: null
  },

  // Household 5, Family 6
  {
    residentId: "R-0020",
    firstName: "Teresa", middleName: "Silang", lastName: "Magbanua",
    birthDate: "1948-10-13",
    sex: "Female", civilStatus: "Widowed",
    contactNumber: "09112223333",
    occupation: "Retired Dressmaker", company: "N/A",
    citizenship: "Filipino",
    residencyStatus: "Active",
    residencyLengthYears: 30,
    isDependent: false,
    householdId: "H-5", familyId: "F-6",
    parentId: null,
    emergencyContactName: "Emilio Magbanua",
    emergencyContactRelationship: "Son",
    emergencyContactNumber: "09123334444",
    createdBy: "USR-1", createdAt: "2026-01-10",
    updatedBy: null, updatedAt: null
  },
  {
    residentId: "R-0021",
    firstName: "Emilio", middleName: "Silang", lastName: "Magbanua",
    birthDate: "1970-03-22",
    sex: "Male", civilStatus: "Married",
    contactNumber: "09123334444",
    occupation: "Barangay Tanod", company: "Barangay San Jose LGU",
    citizenship: "Filipino",
    residencyStatus: "Active",
    residencyLengthYears: 30,
    isDependent: false,
    householdId: "H-5", familyId: "F-6",
    parentId: "R-0020",
    emergencyContactName: "Gregoria Magbanua",
    emergencyContactRelationship: "Spouse",
    emergencyContactNumber: "09134445555",
    createdBy: "USR-1", createdAt: "2026-01-10",
    updatedBy: null, updatedAt: null
  },
  {
    residentId: "R-0022",
    firstName: "Gregoria", middleName: "Reyes", lastName: "Magbanua",
    birthDate: "1974-05-09",
    sex: "Female", civilStatus: "Married",
    contactNumber: "09134445555",
    occupation: "Housewife", company: "N/A",
    citizenship: "Filipino",
    residencyStatus: "Active",
    residencyLengthYears: 25,
    isDependent: false,
    householdId: "H-5", familyId: "F-6",
    parentId: null,
    emergencyContactName: "Emilio Magbanua",
    emergencyContactRelationship: "Spouse",
    emergencyContactNumber: "09123334444",
    createdBy: "USR-1", createdAt: "2026-01-10",
    updatedBy: null, updatedAt: null
  },
  {
    residentId: "R-0023",
    firstName: "Andres", middleName: "Silang", lastName: "Magbanua",
    birthDate: "1998-11-30",
    sex: "Male", civilStatus: "Single",
    contactNumber: "09145556666",
    occupation: "IT Support Analyst", company: "Accenture BGC",
    citizenship: "Filipino",
    residencyStatus: "Active",
    residencyLengthYears: 27,
    isDependent: false,
    householdId: "H-5", familyId: "F-6",
    parentId: "R-0021",
    emergencyContactName: "Emilio Magbanua",
    emergencyContactRelationship: "Father",
    emergencyContactNumber: "09123334444",
    createdBy: "USR-1", createdAt: "2026-01-10",
    updatedBy: null, updatedAt: null
  },
  {
    residentId: "R-0024",
    firstName: "Melchora", middleName: "Silang", lastName: "Magbanua",
    birthDate: "2001-01-06",
    sex: "Female", civilStatus: "Single",
    contactNumber: "09156667777",
    occupation: "College Student", company: "UP Diliman",
    citizenship: "Filipino",
    residencyStatus: "Active",
    residencyLengthYears: 25,
    isDependent: true,
    householdId: "H-5", familyId: "F-6",
    parentId: "R-0021",
    emergencyContactName: "Gregoria Magbanua",
    emergencyContactRelationship: "Mother",
    emergencyContactNumber: "09134445555",
    createdBy: "USR-1", createdAt: "2026-01-10",
    updatedBy: null, updatedAt: null
  },
  {
    residentId: "R-0025",
    firstName: "Gabriela", middleName: "Silang", lastName: "Magbanua",
    birthDate: "2004-04-20",
    sex: "Female", civilStatus: "Single",
    contactNumber: "09167778888",
    occupation: "College Student", company: "UST Manila",
    citizenship: "Filipino",
    residencyStatus: "Inactive",
    residencyLengthYears: 22,
    isDependent: true,
    householdId: "H-5", familyId: "F-6",
    parentId: "R-0021",
    emergencyContactName: "Emilio Magbanua",
    emergencyContactRelationship: "Father",
    emergencyContactNumber: "09123334444",
    createdBy: "USR-1", createdAt: "2026-01-10",
    updatedBy: null, updatedAt: null
  },
  {
    residentId: "R-0026",
    firstName: "Bonifacio", middleName: "Lim", lastName: "Santos",
    birthDate: "1932-11-30",
    sex: "Male", civilStatus: "Widowed",
    contactNumber: "N/A",
    occupation: "N/A", company: "N/A",
    citizenship: "Filipino",
    residencyStatus: "Deceased",
    residencyLengthYears: 60,
    isDependent: false,
    householdId: "H-2", familyId: "F-2",
    parentId: null,
    emergencyContactName: "Maria Santos",
    emergencyContactRelationship: "Daughter-in-law",
    emergencyContactNumber: "09204445566",
    createdBy: "USR-1", createdAt: "2026-01-10",
    updatedBy: null, updatedAt: null
  }
];

export const familyRelations = [
  // Family 1
  { familyId: "F-1", residentId: "R-0001", relation: "Head" },
  { familyId: "F-1", residentId: "R-0002", relation: "Spouse" },
  { familyId: "F-1", residentId: "R-0003", relation: "Son" },
  { familyId: "F-1", residentId: "R-0004", relation: "Daughter" },

  // Family 2
  { familyId: "F-2", residentId: "R-0005", relation: "Head" },
  { familyId: "F-2", residentId: "R-0006", relation: "Son" },
  { familyId: "F-2", residentId: "R-0007", relation: "Daughter-in-law" },
  { familyId: "F-2", residentId: "R-0008", relation: "Grandson" },
  { familyId: "F-2", residentId: "R-0009", relation: "Granddaughter" },
  { familyId: "F-2", residentId: "R-0026", relation: "Father" }, // Bonifacio (deceased)

  // Family 3
  { familyId: "F-3", residentId: "R-0010", relation: "Head" },
  { familyId: "F-3", residentId: "R-0011", relation: "Spouse" },
  { familyId: "F-3", residentId: "R-0012", relation: "Son" },

  // Family 4
  { familyId: "F-4", residentId: "R-0013", relation: "Head" },
  { familyId: "F-4", residentId: "R-0014", relation: "Daughter" },
  { familyId: "F-4", residentId: "R-0015", relation: "Grandson" },

  // Family 5
  { familyId: "F-5", residentId: "R-0016", relation: "Head" },
  { familyId: "F-5", residentId: "R-0017", relation: "Spouse" },
  { familyId: "F-5", residentId: "R-0018", relation: "Son" },
  { familyId: "F-5", residentId: "R-0019", relation: "Daughter" },

  // Family 6
  { familyId: "F-6", residentId: "R-0020", relation: "Head" },
  { familyId: "F-6", residentId: "R-0021", relation: "Son" },
  { familyId: "F-6", residentId: "R-0022", relation: "Daughter-in-law" },
  { familyId: "F-6", residentId: "R-0023", relation: "Grandson" },
  { familyId: "F-6", residentId: "R-0024", relation: "Granddaughter" },
  { familyId: "F-6", residentId: "R-0025", relation: "Granddaughter" }
];

// NEW: residentStatuses — a resident can have multiple statuses
export const residentStatuses = [
  { residentStatusId: "RS-1", residentId: "R-0005", statusType: "Senior Citizen", dateAdded: "2024-01-01", notes: null },
  { residentStatusId: "RS-2", residentId: "R-0005", statusType: "Voter", dateAdded: "2024-01-01", notes: null },
  { residentStatusId: "RS-3", residentId: "R-0013", statusType: "Senior Citizen", dateAdded: "2024-01-01", notes: null },
  { residentStatusId: "RS-4", residentId: "R-0013", statusType: "PWD", dateAdded: "2024-01-01", notes: "Mobility impaired — right knee" },
  { residentStatusId: "RS-5", residentId: "R-0020", statusType: "Senior Citizen", dateAdded: "2024-01-01", notes: null },
  { residentStatusId: "RS-6", residentId: "R-0020", statusType: "PWD", dateAdded: "2024-06-15", notes: "Partial hearing loss" },
  { residentStatusId: "RS-7", residentId: "R-0001", statusType: "Voter", dateAdded: "2024-01-01", notes: null },
  { residentStatusId: "RS-8", residentId: "R-0002", statusType: "Voter", dateAdded: "2024-01-01", notes: null },
  { residentStatusId: "RS-9", residentId: "R-0006", statusType: "Voter", dateAdded: "2024-01-01", notes: null },
  { residentStatusId: "RS-10", residentId: "R-0010", statusType: "Voter", dateAdded: "2024-01-01", notes: null },
  { residentStatusId: "RS-11", residentId: "R-0016", statusType: "Voter", dateAdded: "2024-01-01", notes: null },
  { residentStatusId: "RS-12", residentId: "R-0017", statusType: "Voter", dateAdded: "2024-01-01", notes: null },
  { residentStatusId: "RS-13", residentId: "R-0021", statusType: "Voter", dateAdded: "2024-01-01", notes: null },
  { residentStatusId: "RS-14", residentId: "R-0014", statusType: "Solo Parent", dateAdded: "2025-03-01", notes: "Single mother of Bimby" },
  { residentStatusId: "RS-15", residentId: "R-0003", statusType: "Student", dateAdded: "2024-06-01", notes: null },
  { residentStatusId: "RS-16", residentId: "R-0004", statusType: "Student", dateAdded: "2024-06-01", notes: null },
  { residentStatusId: "RS-17", residentId: "R-0015", statusType: "Student", dateAdded: "2024-06-01", notes: null },
  { residentStatusId: "RS-18", residentId: "R-0024", statusType: "Student", dateAdded: "2024-06-01", notes: null },
  { residentStatusId: "RS-19", residentId: "R-0025", statusType: "Student", dateAdded: "2024-06-01", notes: null },
  { residentStatusId: "RS-20", residentId: "R-0026", statusType: "Senior Citizen", dateAdded: "2024-01-01", notes: "Deceased" }
];

// NEW: roles
export const roles = [
  { roleId: 1, roleName: "Admin" },
  { roleId: 2, roleName: "Barangay Official" },
  { roleId: 3, roleName: "Barangay Staff" }
];

// NEW: users
export const users = [
  { userId: "USR-1", username: "admin", passwordHash: "admin123", fullName: "System Admin", roleId: 1, barangayId: "BRGY-1", isActive: true },
  { userId: "USR-2", username: "maria.staff", passwordHash: "staff123", fullName: "Maria Clara", roleId: 3, barangayId: "BRGY-1", isActive: true },
  { userId: "USR-3", username: "pedro.official", passwordHash: "official123", fullName: "Pedro Penduko", roleId: 2, barangayId: "BRGY-2", isActive: true }
];

// NEW: auditLog — populated by auditLogger utility
export const auditLog = [];

export const localPrograms = [
  {
    id: "LP-1",
    name: "Vaccine Center",
    description: "Senior Covid-19 Booster & Flu Shot Program",
    schedule: "Every Wednesday, 8:00 AM - 3:00 PM",
    venue: "San Jose Covered Court",
    stats: "45 seniors scheduled today",
    status: "Ongoing"
  },
  {
    id: "LP-2",
    name: "Donation Drive",
    description: "Barangay Calamity Preparedness Relief Packs Distribution",
    schedule: "Ongoing collection at Barangay Hall",
    venue: "Main Lobby, Brgy. Hall",
    stats: "210 families served this week",
    status: "Active"
  },
  {
    id: "LP-3",
    name: "Assistance Programs",
    description: "Financial Aid (TUPAD) & Social Pension Distribution",
    schedule: "Fridays, 9:00 AM - 5:00 PM",
    venue: "Multi-Purpose Hall",
    stats: "54 senior pension releases pending",
    status: "Upcoming"
  }
];

export const generatedReports = [
  {
    id: "REP-1",
    filename: "2026_Q2_Census_Summary.pdf",
    category: "CENSUS REPORT",
    date: "2026-06-15",
    size: "2.4 MB",
    type: "pdf"
  },
  {
    id: "REP-2",
    filename: "Health_Audit_Seniors_Vaccination_Q2.xlsx",
    category: "HEALTH AUDIT",
    date: "2026-06-10",
    size: "1.8 MB",
    type: "excel"
  },
  {
    id: "REP-3",
    filename: "Vaccine_Rollout_Data_Brgy1.csv",
    category: "VACCINATION PROGRAM",
    date: "2026-06-05",
    size: "820 KB",
    type: "csv"
  },
  {
    id: "REP-4",
    filename: "Assistance_Distribution_List_June.pdf",
    category: "SOCIAL WELFARE",
    date: "2026-06-02",
    size: "3.1 MB",
    type: "pdf"
  }
];

// Helper: get display name for a resident
export function getResidentDisplayName(resident) {
  if (!resident) return "N/A";
  const middle = resident.middleName ? ` ${resident.middleName}` : "";
  return `${resident.lastName}, ${resident.firstName}${middle}`;
}

// Helper: get short display name (no middle)
export function getResidentShortName(resident) {
  if (!resident) return "N/A";
  return `${resident.lastName}, ${resident.firstName}`;
}

// Helper: compute age from birthDate
export function calculateAge(birthDateStr) {
  if (!birthDateStr) return 0;
  const today = new Date();
  const birthDate = new Date(birthDateStr);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

// Helper: generate unique ID with prefix
export function generateId(prefix = "ID") {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
}

// Helper: get address display string for a household
export function getHouseholdAddress(householdId) {
  const household = households.find(h => h.householdId === householdId);
  if (!household) return "N/A";
  const address = addresses.find(a => a.addressId === household.addressId);
  if (!address) return "N/A";
  const street = streets.find(s => s.streetId === address.streetId);
  if (!street) return address.houseNo;
  const barangay = barangays.find(b => b.id === street.barangayId);
  const unitStr = address.unitNo ? ` Unit ${address.unitNo},` : "";
  return `${address.houseNo}${unitStr} ${street.streetName}`;
}

// Helper: get full address with barangay
export function getFullAddress(householdId) {
  const household = households.find(h => h.householdId === householdId);
  if (!household) return "N/A";
  const address = addresses.find(a => a.addressId === household.addressId);
  if (!address) return "N/A";
  const street = streets.find(s => s.streetId === address.streetId);
  if (!street) return address.houseNo;
  const barangay = barangays.find(b => b.id === street.barangayId);
  const unitStr = address.unitNo ? ` Unit ${address.unitNo},` : "";
  return `${address.houseNo}${unitStr} ${street.streetName}, ${barangay?.name || ""}`;
}

// Helper: get barangay name for a household
export function getHouseholdBarangay(householdId) {
  const household = households.find(h => h.householdId === householdId);
  if (!household) return "N/A";
  const address = addresses.find(a => a.addressId === household.addressId);
  if (!address) return "N/A";
  const street = streets.find(s => s.streetId === address.streetId);
  if (!street) return "N/A";
  const barangay = barangays.find(b => b.id === street.barangayId);
  return barangay?.name || "N/A";
}

// Helper: get family head name from familyRelations
export function getFamilyHeadName(familyId) {
  const headRelation = familyRelations.find(r => r.familyId === familyId && r.relation === "Head");
  if (!headRelation) return "N/A";
  const headResident = residents.find(r => r.residentId === headRelation.residentId);
  return headResident ? getResidentShortName(headResident) : "N/A";
}

// Helper: get family member count
export function getFamilyMemberCount(familyId) {
  return residents.filter(r => r.familyId === familyId).length;
}
