/**
 * CertificateType enum — all supported certificate types.
 *
 * Design notes:
 * - Each enum value maps to a unique string key used as the `type` field in the database.
 * - The NestJS CertificatesService uses this enum to route to the correct generator.
 * - The generators/ directory (on the backend) has one file per certificate type.
 * - To add a new certificate type: add the enum value here AND create the generator.
 *
 * Current certificate types (9):
 *   BARANGAY_CLEARANCE, OATH_OF_UNDERTAKING,
 *   APPLICATION_BARANGAY_CLEARANCE, CERTIFICATION_SLIP,
 *   CERTIFICATION_OF_INDIGENCY, CERTIFICATION_FINANCIAL_ASSISTANCE,
 *   CERTIFICATION_FIRST_TIME_JOBSEEKER, CERTIFICATION_OF_GUARDIANSHIP,
 *   CERTIFICATION_GOOD_MORAL
 *
 * Scalability: Add new types here. The backend generator is discovered via
 * a registry map keyed by this enum, not a switch-case.
 */
export enum CertificateType {
  BARANGAY_CLEARANCE                    = 'BARANGAY_CLEARANCE',
  OATH_OF_UNDERTAKING                   = 'OATH_OF_UNDERTAKING',
  APPLICATION_BARANGAY_CLEARANCE        = 'APPLICATION_BARANGAY_CLEARANCE',
  CERTIFICATION_SLIP                    = 'CERTIFICATION_SLIP',
  CERTIFICATION_OF_INDIGENCY            = 'CERTIFICATION_OF_INDIGENCY',
  CERTIFICATION_FINANCIAL_ASSISTANCE    = 'CERTIFICATION_FINANCIAL_ASSISTANCE',
  CERTIFICATION_FIRST_TIME_JOBSEEKER    = 'CERTIFICATION_FIRST_TIME_JOBSEEKER',
  CERTIFICATION_OF_GUARDIANSHIP         = 'CERTIFICATION_OF_GUARDIANSHIP',
  CERTIFICATION_GOOD_MORAL              = 'CERTIFICATION_GOOD_MORAL',
  // ── Add new certificate types below ──────────────────────────────────────
  // CERTIFICATION_OF_RESIDENCY          = 'CERTIFICATION_OF_RESIDENCY',
  // BARANGAY_ID                         = 'BARANGAY_ID',
  // CERTIFICATION_OF_EMPLOYMENT         = 'CERTIFICATION_OF_EMPLOYMENT',
}

/**
 * Human-readable labels for each certificate type.
 * Used by the CertificateList UI component.
 */
export const CERTIFICATE_TYPE_LABELS: Record<CertificateType, string> = {
  [CertificateType.BARANGAY_CLEARANCE]:                 'Barangay Clearance',
  [CertificateType.OATH_OF_UNDERTAKING]:                'Oath of Undertaking',
  [CertificateType.APPLICATION_BARANGAY_CLEARANCE]:     'Application for Barangay Clearance',
  [CertificateType.CERTIFICATION_SLIP]:                 'Certification Slip',
  [CertificateType.CERTIFICATION_OF_INDIGENCY]:         'Certification of Indigency',
  [CertificateType.CERTIFICATION_FINANCIAL_ASSISTANCE]: 'Certification for Financial Assistance',
  [CertificateType.CERTIFICATION_FIRST_TIME_JOBSEEKER]: 'Certification for First Time Jobseekers Act of 2019',
  [CertificateType.CERTIFICATION_OF_GUARDIANSHIP]:      'Certification of Guardianship',
  [CertificateType.CERTIFICATION_GOOD_MORAL]:           'Certification of Good Moral',
}

/**
 * Certificate request status lifecycle:
 *   PENDING → APPROVED → GENERATED → RELEASED
 *              ↓
 *           REJECTED
 */
export type CertificateStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'GENERATED'
  | 'RELEASED'
  | 'REJECTED'

export interface CertificateRequest {
  certificateId: string
  type: CertificateType
  status: CertificateStatus
  residentId: string
  barangayId: number
  purpose?: string
  requestedAt: string
  approvedAt?: string
  generatedAt?: string
  releasedAt?: string
  rejectedAt?: string
  rejectionReason?: string
  requestedBy: string   // userId of the staff who filed the request
  approvedBy?: string   // userId of the official who approved
  orNumber?: string     // Official Receipt number
  controlNumber?: string
}

export interface CreateCertificateRequestDto {
  type: CertificateType
  residentId: string
  barangayId: number
  purpose?: string
}

export interface GenerateCertificateDto {
  certificateId: string
  format: 'PDF' | 'DOCX'  // Reserved for future implementation
}
