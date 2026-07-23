// Shared helper functions for UI formatting

export function getResidentDisplayName(resident) {
  if (!resident) return "Unknown Resident";
  const first = resident.firstName || "";
  const middleInitial = resident.middleName ? ` ${resident.middleName.charAt(0)}.` : "";
  const last = resident.lastName || "";
  const ext = resident.extensionName ? ` ${resident.extensionName}` : "";
  return `${first}${middleInitial} ${last}${ext}`.trim();
}

export function formatAgeAndSex(dob, sex) {
  if (!dob) return sex || "N/A";
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return `${age} yrs / ${sex || "N/A"}`;
}

export function formatDOB(dob) {
  if (!dob) return "N/A";
  return new Date(dob).toLocaleDateString();
}
