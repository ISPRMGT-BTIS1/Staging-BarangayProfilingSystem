export function parseCSVResidents(csvContent) {
  if (!csvContent) return [];
  const lines = csvContent.split(/\r?\n/).filter(line => line.trim() !== "");
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map(h => h.trim());
  const parsedResidents = [];

  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].split(",").map(val => val.trim());
    if (row.length < headers.length) continue;

    const res = {};
    headers.forEach((header, index) => {
      res[header] = row[index];
    });

    if (res.firstName && res.lastName && res.birthDate) {
      // Basic formatting and fallback defaults
      parsedResidents.push({
        firstName: res.firstName,
        middleName: res.middleName || "",
        lastName: res.lastName,
        birthDate: res.birthDate,
        sex: res.sex || "Male",
        civilStatus: res.civilStatus || "Single",
        contactNumber: res.contactNumber || "N/A",
        occupation: res.occupation || "Unemployed",
        company: res.company || "N/A",
        citizenship: res.citizenship || "Filipino",
        residencySince: res.residencySince || new Date().toISOString().split("T")[0],
        isDependent: res.isDependent === "true" || res.isDependent === "TRUE",
        householdId: res.householdId || "H-1",
        familyId: res.familyId || "F-1",
        parentId: res.parentId || null,
        emergencyContactName: res.emergencyContactName || "",
        emergencyContactRelationship: res.emergencyContactRelationship || "",
        emergencyContactNumber: res.emergencyContactNumber || "",
      });
    }
  }
  return parsedResidents;
}
