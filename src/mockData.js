// Realistic Filipino Sample Data for Barangay Profiling System (Brgy. System)

export const barangays = [
  { id: "BRGY-1", name: "Barangay San Jose" },
  { id: "BRGY-2", name: "Barangay Santa Isabel" }
];

export const households = [
  {
    addressId: "H-1",
    houseNo: "12A",
    street: "Rizal Avenue",
    barangay: "Barangay San Jose",
    residencyLength: 15, // in years
    householdType: "Nuclear",
    status: "Active"
  },
  {
    addressId: "H-2",
    houseNo: "45",
    street: "Magsaysay St.",
    barangay: "Barangay San Jose",
    residencyLength: 8,
    householdType: "Extended",
    status: "Active"
  },
  {
    addressId: "H-3",
    houseNo: "108",
    street: "Mabini St.",
    barangay: "Barangay Santa Isabel",
    residencyLength: 20,
    householdType: "Single Parent",
    status: "Active"
  },
  {
    addressId: "H-4",
    houseNo: "33B",
    street: "Bonifacio St.",
    barangay: "Barangay Santa Isabel",
    residencyLength: 4,
    householdType: "Nuclear",
    status: "Active"
  },
  {
    addressId: "H-5",
    houseNo: "201",
    street: "Katipunan Avenue",
    barangay: "Barangay San Jose",
    residencyLength: 30,
    householdType: "Extended",
    status: "Active"
  }
];

export const families = [
  {
    familyId: "F-1",
    addressId: "H-1",
    familyHead: "Juan Dela Cruz",
    memberCount: 4,
    status: "Active"
  },
  {
    familyId: "F-2",
    addressId: "H-2",
    familyHead: "Maria Santos",
    memberCount: 5,
    status: "Active"
  },
  {
    familyId: "F-3",
    addressId: "H-2",
    familyHead: "Cardo Dalisay",
    memberCount: 3,
    status: "Active"
  },
  {
    familyId: "F-4",
    addressId: "H-3",
    familyHead: "Leonora Aquino",
    memberCount: 3,
    status: "Active"
  },
  {
    familyId: "F-5",
    addressId: "H-4",
    familyHead: "Rodrigo Marcos",
    memberCount: 4,
    status: "Active"
  },
  {
    familyId: "F-6",
    addressId: "H-5",
    familyHead: "Teresa Magbanua",
    memberCount: 6,
    status: "Active"
  }
];

export const residents = [
  // Household 1, Family 1
  {
    residentId: "R-0001",
    name: "Juan Dela Cruz",
    birthDate: "1978-05-15",
    age: 48,
    sex: "Male",
    civilStatus: "Married",
    contactNo: "09171234567",
    occupation: "Jeepney Driver",
    citizenship: "Filipino",
    status: "Active",
    addressId: "H-1",
    familyId: "F-1"
  },
  {
    residentId: "R-0002",
    name: "Corazon Dela Cruz",
    birthDate: "1980-11-20",
    age: 45,
    sex: "Female",
    civilStatus: "Married",
    contactNo: "09187654321",
    occupation: "Sari-sari Store Owner",
    citizenship: "Filipino",
    status: "Active",
    addressId: "H-1",
    familyId: "F-1"
  },
  {
    residentId: "R-0003",
    name: "Jose Dela Cruz",
    birthDate: "2005-08-12",
    age: 20,
    sex: "Male",
    civilStatus: "Single",
    contactNo: "09192233445",
    occupation: "College Student",
    citizenship: "Filipino",
    status: "Active",
    addressId: "H-1",
    familyId: "F-1"
  },
  {
    residentId: "R-0004",
    name: "Maria Dela Cruz",
    birthDate: "2010-02-05",
    age: 16,
    sex: "Female",
    civilStatus: "Single",
    contactNo: "N/A",
    occupation: "High School Student",
    citizenship: "Filipino",
    status: "Active",
    addressId: "H-1",
    familyId: "F-1"
  },

  // Household 2, Family 2 & Family 3 (Multiple Families in one Household)
  // Family 2
  {
    residentId: "R-0005",
    name: "Maria Santos",
    birthDate: "1960-09-10",
    age: 65, // Senior
    sex: "Female",
    civilStatus: "Widowed",
    contactNo: "09204445566",
    occupation: "Retired Public Teacher",
    citizenship: "Filipino",
    status: "Active",
    addressId: "H-2",
    familyId: "F-2"
  },
  {
    residentId: "R-0006",
    name: "Pedro Santos",
    birthDate: "1985-03-30",
    age: 41,
    sex: "Male",
    civilStatus: "Married",
    contactNo: "09159998877",
    occupation: "Barangay Kagawad",
    citizenship: "Filipino",
    status: "Active",
    addressId: "H-2",
    familyId: "F-2"
  },
  {
    residentId: "R-0007",
    name: "Gloria Santos",
    birthDate: "1988-12-04",
    age: 37,
    sex: "Female",
    civilStatus: "Married",
    contactNo: "09163332211",
    occupation: "Nurse",
    citizenship: "Filipino",
    status: "Active",
    addressId: "H-2",
    familyId: "F-2"
  },
  {
    residentId: "R-0008",
    name: "Joshua Santos",
    birthDate: "2015-06-18",
    age: 11,
    sex: "Male",
    civilStatus: "Single",
    contactNo: "N/A",
    occupation: "Elementary Pupil",
    citizenship: "Filipino",
    status: "Active",
    addressId: "H-2",
    familyId: "F-2"
  },
  {
    residentId: "R-0009",
    name: "Angel Santos",
    birthDate: "2018-01-22",
    age: 8,
    sex: "Female",
    civilStatus: "Single",
    contactNo: "N/A",
    occupation: "Elementary Pupil",
    citizenship: "Filipino",
    status: "Active",
    addressId: "H-2",
    familyId: "F-2"
  },
  // Family 3 (Tenant / co-living in H-2)
  {
    residentId: "R-0010",
    name: "Cardo Dalisay",
    birthDate: "1982-04-14",
    age: 44,
    sex: "Male",
    civilStatus: "Married",
    contactNo: "09211112222",
    occupation: "Security Guard",
    citizenship: "Filipino",
    status: "Active",
    addressId: "H-2",
    familyId: "F-3"
  },
  {
    residentId: "R-0011",
    name: "Alyana Dalisay",
    birthDate: "1984-07-19",
    age: 41,
    sex: "Female",
    civilStatus: "Married",
    contactNo: "09228889999",
    occupation: "Call Center Agent",
    citizenship: "Filipino",
    status: "Active",
    addressId: "H-2",
    familyId: "F-3"
  },
  {
    residentId: "R-0012",
    name: "Ricky Boy Dalisay",
    birthDate: "2013-10-02",
    age: 12,
    sex: "Male",
    civilStatus: "Single",
    contactNo: "N/A",
    occupation: "Elementary Pupil",
    citizenship: "Filipino",
    status: "Active",
    addressId: "H-2",
    familyId: "F-3"
  },

  // Household 3, Family 4
  {
    residentId: "R-0013",
    name: "Leonora Aquino",
    birthDate: "1955-08-25",
    age: 70, // Senior
    sex: "Female",
    civilStatus: "Widowed",
    contactNo: "09164448888",
    occupation: "Retired Cook",
    citizenship: "Filipino",
    status: "Active",
    addressId: "H-3",
    familyId: "F-4"
  },
  {
    residentId: "R-0014",
    name: "Kris Aquino",
    birthDate: "1987-02-14",
    age: 39,
    sex: "Female",
    civilStatus: "Single",
    contactNo: "09267771111",
    occupation: "Online Seller",
    citizenship: "Filipino",
    status: "Active",
    addressId: "H-3",
    familyId: "F-4"
  },
  {
    residentId: "R-0015",
    name: "Bimby Aquino",
    birthDate: "2007-04-19",
    age: 19,
    sex: "Male",
    civilStatus: "Single",
    contactNo: "09278882222",
    occupation: "Senior High Student",
    citizenship: "Filipino",
    status: "Active",
    addressId: "H-3",
    familyId: "F-4"
  },

  // Household 4, Family 5
  {
    residentId: "R-0016",
    name: "Rodrigo Marcos",
    birthDate: "1972-09-13",
    age: 53,
    sex: "Male",
    civilStatus: "Married",
    contactNo: "09054443333",
    occupation: "Construction Worker",
    citizenship: "Filipino",
    status: "Active",
    addressId: "H-4",
    familyId: "F-5"
  },
  {
    residentId: "R-0017",
    name: "Imelda Marcos",
    birthDate: "1975-07-02",
    age: 50,
    sex: "Female",
    civilStatus: "Married",
    contactNo: "09062221111",
    occupation: "Laundry Worker",
    citizenship: "Filipino",
    status: "Active",
    addressId: "H-4",
    familyId: "F-5"
  },
  {
    residentId: "R-0018",
    name: "Ferdinand Marcos Jr.",
    birthDate: "1999-09-24",
    age: 26,
    sex: "Male",
    civilStatus: "Single",
    contactNo: "09075556666",
    occupation: "Tricycle Driver",
    citizenship: "Filipino",
    status: "Active",
    addressId: "H-4",
    familyId: "F-5"
  },
  {
    residentId: "R-0019",
    name: "Imee Marcos",
    birthDate: "2001-11-12",
    age: 24,
    sex: "Female",
    civilStatus: "Single",
    contactNo: "09087778888",
    occupation: "Sales Clerk",
    citizenship: "Filipino",
    status: "Moved", // Moved Status
    addressId: "H-4",
    familyId: "F-5"
  },

  // Household 5, Family 6
  {
    residentId: "R-0020",
    name: "Teresa Magbanua",
    birthDate: "1948-10-13",
    age: 77, // Senior
    sex: "Female",
    civilStatus: "Widowed",
    contactNo: "09112223333",
    occupation: "Retired Dressmaker",
    citizenship: "Filipino",
    status: "Active",
    addressId: "H-5",
    familyId: "F-6"
  },
  {
    residentId: "R-0021",
    name: "Emilio Magbanua",
    birthDate: "1970-03-22",
    age: 56,
    sex: "Male",
    civilStatus: "Married",
    contactNo: "09123334444",
    occupation: "Barangay Tanod",
    citizenship: "Filipino",
    status: "Active",
    addressId: "H-5",
    familyId: "F-6"
  },
  {
    residentId: "R-0022",
    name: "Gregoria Magbanua",
    birthDate: "1974-05-09",
    age: 52,
    sex: "Female",
    civilStatus: "Married",
    contactNo: "09134445555",
    occupation: "Housewife",
    citizenship: "Filipino",
    status: "Active",
    addressId: "H-5",
    familyId: "F-6"
  },
  {
    residentId: "R-0023",
    name: "Andres Magbanua",
    birthDate: "1998-11-30",
    age: 27,
    sex: "Male",
    civilStatus: "Single",
    contactNo: "09145556666",
    occupation: "IT Support Analyst",
    citizenship: "Filipino",
    status: "Active",
    addressId: "H-5",
    familyId: "F-6"
  },
  {
    residentId: "R-0024",
    name: "Melchora Magbanua",
    birthDate: "2001-01-06",
    age: 25,
    sex: "Female",
    civilStatus: "Single",
    contactNo: "09156667777",
    occupation: "College Student",
    citizenship: "Filipino",
    status: "Active",
    addressId: "H-5",
    familyId: "F-6"
  },
  {
    residentId: "R-0025",
    name: "Gabriela Magbanua",
    birthDate: "2004-04-20",
    age: 22,
    sex: "Female",
    civilStatus: "Single",
    contactNo: "09167778888",
    occupation: "College Student",
    citizenship: "Filipino",
    status: "Inactive", // Inactive Status
    addressId: "H-5",
    familyId: "F-6"
  },
  {
    residentId: "R-0026",
    name: "Bonifacio Santos",
    birthDate: "1932-11-30",
    age: 93,
    sex: "Male",
    civilStatus: "Widowed",
    contactNo: "N/A",
    occupation: "Deceased",
    citizenship: "Filipino",
    status: "Deceased", // Deceased Status
    addressId: "H-2",
    familyId: "F-2"
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
