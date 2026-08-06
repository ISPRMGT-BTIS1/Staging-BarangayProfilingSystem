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

export function capitalizeWords(str) {
  if (!str) return "";
  return str.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
}

/**
 * Convert a File object to a Base64 encoded string.
 */
export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}

export function formatDOB(dob) {
  if (!dob) return "N/A";
  return new Date(dob).toLocaleDateString();
}

/**
 * Safely parse integer values from string/number inputs (e.g. "R-12" -> 12, "" -> null, 5 -> 5)
 */
export function parseSafeInt(val) {
  if (val === null || val === undefined || val === "") return null;
  const digits = String(val).replace(/\D/g, "");
  if (!digits) return null;
  const num = parseInt(digits, 10);
  return isNaN(num) ? null : num;
}

/**
 * Calculate residency length in years based on user input (which can be a year like "2018", a date "2018-05-01", or length "6")
 */
export function calculateResidencyYears(sinceInput) {
  if (!sinceInput) return null;
  const str = String(sinceInput).trim();
  const currentYear = new Date().getFullYear();

  // If input is pure 4-digit year (e.g. "2018")
  if (/^\d{4}$/.test(str)) {
    const year = parseInt(str, 10);
    if (year <= currentYear && year > 1900) {
      return currentYear - year;
    }
  }

  // If input is float/number (e.g. "5.5" or "10")
  const num = parseFloat(str);
  if (!isNaN(num)) {
    if (num > 1900 && num <= currentYear) {
      return currentYear - num;
    }
    return num >= 0 ? num : null;
  }

  return null;
}

