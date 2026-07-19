/**
 * Re-exports the mock data from the original mockData.js file.
 * This bridge ensures all existing JSX components continue to work
 * during incremental migration to the real NestJS API.
 *
 * Once the real NestJS API is connected, replace these exports
 * with API service calls and remove this file.
 */
export {
  residents,
  households,
  streets,
  addresses,
  families,
  residentStatuses,
  users,
  roles,
  barangays,
  auditLog,
  localPrograms,
  generatedReports,
  getResidentDisplayName,
  getResidentShortName,
  calculateAge,
  calculateResidencyLength,
  generateId,
  getHouseholdAddress,
  getFullAddress,
  getHouseholdBarangay,
  getFamilyHeadName,
  getFamilyMemberCount,
} from '../mockData'
