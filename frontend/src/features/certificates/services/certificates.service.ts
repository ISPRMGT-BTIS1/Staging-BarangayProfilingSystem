import { apiClient } from '@/shared/lib/axios'
import type { PaginationParams } from '@/shared/types/api.types'
import type {
  CreateCertificateRequestDto,
  GenerateCertificateDto,
} from '../types/certificate.types'

/**
 * Certificates service — wraps NestJS /certificates endpoints.
 *
 * PDF/DOCX generation is NOT implemented yet.
 * The generate() method is stubbed — it will call the NestJS backend which
 * will delegate to the appropriate generator (barangay-clearance.generator.ts, etc.)
 *
 * When the generation module is implemented:
 *   1. The backend generator returns a file stream (PDF or DOCX buffer).
 *   2. The frontend calls generate() and receives a blob URL to trigger download.
 */
export const certificatesService = {
  /** GET /certificates — paginated list of all certificate requests */
  getAll: (params?: PaginationParams) =>
    apiClient.get('/certificates', { params }),

  /** GET /certificates/:id — single certificate request detail */
  getById: (id: string) =>
    apiClient.get(`/certificates/${id}`),

  /** GET /certificates/resident/:residentId — all certs for a resident */
  getByResident: (residentId: string) =>
    apiClient.get(`/certificates/resident/${residentId}`),

  /** POST /certificates — file a new certificate request */
  create: (data: CreateCertificateRequestDto) =>
    apiClient.post('/certificates', data),

  /** PATCH /certificates/:id/approve — approve a pending request */
  approve: (id: string, orNumber?: string) =>
    apiClient.patch(`/certificates/${id}/approve`, { orNumber }),

  /** PATCH /certificates/:id/reject — reject a pending request */
  reject: (id: string, reason: string) =>
    apiClient.patch(`/certificates/${id}/reject`, { reason }),

  /**
   * POST /certificates/:id/generate
   *
   * @reserved — PDF/DOCX generation is NOT implemented yet.
   * This will be implemented by a separate developer.
   * The NestJS backend uses the CertificateType to route to the correct generator.
   */
  generate: (data: GenerateCertificateDto) =>
    apiClient.post(`/certificates/${data.certificateId}/generate`, {
      format: data.format,
    }, { responseType: 'blob' }),

  /** PATCH /certificates/:id/release — mark as released */
  release: (id: string) =>
    apiClient.patch(`/certificates/${id}/release`),
}
