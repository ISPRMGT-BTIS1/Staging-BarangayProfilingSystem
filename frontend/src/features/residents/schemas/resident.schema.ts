import { z } from 'zod'

export const residentSchema = z.object({
  firstName: z.string().min(1, 'First name is required').trim(),
  middleName: z.string().optional(),
  lastName: z.string().min(1, 'Last name is required').trim(),
  suffix: z.string().optional(),
  birthDate: z.string().min(1, 'Birth date is required'),
  sex: z.enum(['Male', 'Female']),
  civilStatus: z.enum(['Single', 'Married', 'Widowed', 'Separated', 'Annulled']),
  contactNumber: z.string().optional(),
  occupation: z.string().optional(),
  company: z.string().optional(),
  citizenship: z.string().default('Filipino'),
  residencySince: z.string().min(1, 'Residency date is required'),
  householdId: z.string().min(1, 'Household is required'),
  barangayId: z.number().int().positive(),
  isVoter: z.boolean().default(false),
  isSeniorCitizen: z.boolean().default(false),
  isPwd: z.boolean().default(false),
  isYouth: z.boolean().default(false),
  isIndigent: z.boolean().default(false),
  isSoloParent: z.boolean().default(false),
  isDependent: z.boolean().default(false),
  emergencyContactName: z.string().optional(),
  emergencyContactRelationship: z.string().optional(),
  emergencyContactNumber: z.string().optional(),
})

export type ResidentFormValues = z.infer<typeof residentSchema>
