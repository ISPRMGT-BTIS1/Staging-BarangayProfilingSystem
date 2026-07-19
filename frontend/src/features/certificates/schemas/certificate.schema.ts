import { z } from 'zod'
import { CertificateType } from '../types/certificate.types'

export const createCertificateSchema = z.object({
  type: z.nativeEnum(CertificateType, {
    errorMap: () => ({ message: 'Please select a valid certificate type' }),
  }),
  residentId: z.string().min(1, 'Resident is required'),
  barangayId: z.number().int().positive(),
  purpose: z.string().max(500, 'Purpose must be under 500 characters').optional(),
})

export type CreateCertificateFormValues = z.infer<typeof createCertificateSchema>
