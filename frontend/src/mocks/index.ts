/**
 * Re-exports the mock data from the original mockData.js file.
 * This bridge ensures all existing JSX components continue to work
 * during incremental migration to the real NestJS API.
 *
 * Once the real NestJS API is connected, replace these exports
 * with API service calls and remove this file.
 */
export const residents = []
export const households = []
export const streets = []
export const addresses = []
export const families = []
export const residentStatuses = []
export const users = []
export const roles = []
export const barangays = []
export const auditLog = []
export const localPrograms = []
export const generatedReports = []
export const getResidentDisplayName = () => ""
export const getResidentShortName = () => ""
export const calculateAge = () => 0
export const calculateResidencyLength = () => ""
export const generateId = () => ""
export const getHouseholdAddress = () => ""
export const getFullAddress = () => ""
export const getHouseholdBarangay = () => ""
export const getFamilyHeadName = () => ""
export const getFamilyMemberCount = () => 0
