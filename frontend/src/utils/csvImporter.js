/**
 * Robust CSV parser for Resident records.
 * Supports:
 *  - Quoted fields with commas inside (e.g. "Dela Cruz, Jr.")
 *  - Case-insensitive, space-insensitive, and alias matching for column headers
 *  - Automatic date normalization (converts DD/MM/YYYY, MM/DD/YYYY, YYYY/MM/DD to YYYY-MM-DD)
 *  - Fallback defaults for optional fields
 */

function normalizeKey(key) {
  if (!key) return '';
  return key.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function parseCSVLine(text) {
  const result = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      if (inQuotes && text[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (c === ',' && !inQuotes) {
      result.push(cur.trim());
      cur = '';
    } else {
      cur += c;
    }
  }
  result.push(cur.trim());
  return result;
}

export function normalizeDateToISO(dateStr) {
  if (!dateStr) return null;
  const str = dateStr.trim();
  if (!str) return null;

  // Already ISO format YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    return str;
  }

  // YYYY/MM/DD or YYYY.MM.DD
  if (/^\d{4}[\/\.]\d{1,2}[\/\.]\d{1,2}$/.test(str)) {
    const parts = str.split(/[\/\.]/);
    const y = parts[0];
    const m = parts[1].padStart(2, '0');
    const d = parts[2].padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  // DD/MM/YYYY or MM/DD/YYYY or DD-MM-YYYY or MM-DD-YYYY
  const slashDashMatch = str.match(/^(\d{1,2})[\/\.-](\d{1,2})[\/\.-](\d{4})$/);
  if (slashDashMatch) {
    const p1 = parseInt(slashDashMatch[1], 10);
    const p2 = parseInt(slashDashMatch[2], 10);
    const year = slashDashMatch[3];

    let day, month;
    if (p1 > 12) {
      // p1 is day (e.g. 15/05/1990)
      day = p1;
      month = p2;
    } else if (p2 > 12) {
      // p2 is day (e.g. 05/15/1990)
      month = p1;
      day = p2;
    } else {
      // Default to DD/MM/YYYY for PH/UK format
      day = p1;
      month = p2;
    }

    const mStr = String(month).padStart(2, '0');
    const dStr = String(day).padStart(2, '0');
    return `${year}-${mStr}-${dStr}`;
  }

  // Fallback to JS Date object parsing
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    const y = parsed.getFullYear();
    const m = String(parsed.getMonth() + 1).padStart(2, '0');
    const d = String(parsed.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  return null;
}

export function parseCSVResidents(csvContent) {
  if (!csvContent) return [];
  const lines = csvContent.split(/\r?\n/).filter(line => line.trim() !== "");
  if (lines.length < 2) return [];

  const rawHeaders = parseCSVLine(lines[0]);
  const headerMap = {};
  rawHeaders.forEach((h, index) => {
    headerMap[normalizeKey(h)] = index;
  });

  const getVal = (row, ...keys) => {
    for (const key of keys) {
      const idx = headerMap[normalizeKey(key)];
      if (idx !== undefined && row[idx] !== undefined && row[idx] !== '') {
        return row[idx];
      }
    }
    return '';
  };

  const parsedResidents = [];

  for (let i = 1; i < lines.length; i++) {
    const row = parseCSVLine(lines[i]);
    if (row.length === 0 || row.every(val => val === '')) continue;

    const firstName = getVal(row, 'firstName', 'first_name', 'First Name', 'fname', 'Given Name');
    const lastName = getVal(row, 'lastName', 'last_name', 'Last Name', 'lname', 'Surname', 'Family Name');
    const rawBirthDate = getVal(row, 'birthDate', 'birth_date', 'Birth Date', 'dob', 'Date of Birth', 'Birthday');
    const normalizedBirthDate = normalizeDateToISO(rawBirthDate) || '2000-01-01';

    if (firstName && lastName) {
      parsedResidents.push({
        firstName,
        middleName: getVal(row, 'middleName', 'middle_name', 'Middle Name', 'mname'),
        lastName,
        birthDate: normalizedBirthDate,
        sex: getVal(row, 'sex', 'gender', 'Sex', 'Gender') || 'Male',
        civilStatus: getVal(row, 'civilStatus', 'civil_status', 'Civil Status', 'Marital Status') || 'Single',
        contactNumber: getVal(row, 'contactNumber', 'contact_number', 'Contact Number', 'Phone', 'Mobile') || 'N/A',
        occupation: getVal(row, 'occupation', 'Occupation', 'Job') || 'Unemployed',
        company: getVal(row, 'company', 'Company', 'Employer') || 'N/A',
        citizenship: getVal(row, 'citizenship', 'Citizenship', 'Nationality') || 'Filipino',
        residencyStatus: getVal(row, 'residencyStatus', 'residency_status', 'Residency Status', 'Status') || 'Active',
        residencySince: getVal(row, 'residencySince', 'residency_length_years', 'Residency Length', 'Residency Years', 'Years Resident') || '1',
        isDependent: ['true', '1', 'yes'].includes((getVal(row, 'isDependent', 'is_dependent', 'Is Dependent', 'Dependent') || '').toLowerCase()),
        householdId: getVal(row, 'householdId', 'household_id', 'Household ID', 'Household') || null,
        familyId: getVal(row, 'familyId', 'family_id', 'Family ID', 'Family') || null,
        parentId: getVal(row, 'parentId', 'parent_id', 'Parent ID') || null,
        emergencyContactName: getVal(row, 'emergencyContactName', 'emergency_contact_name', 'Emergency Contact Name'),
        emergencyContactRelationship: getVal(row, 'emergencyContactRelationship', 'emergency_contact_relationship', 'Emergency Contact Relationship'),
        emergencyContactNumber: getVal(row, 'emergencyContactNumber', 'emergency_contact_number', 'Emergency Contact Number'),
      });
    }
  }
  return parsedResidents;
}
