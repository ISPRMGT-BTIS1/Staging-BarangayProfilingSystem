import { z } from 'zod'

export const householdSchema = z.object({
  houseNumber: z.string().min(1, 'House number is required'),
  streetId: z.string().min(1, 'Street is required'),
  barangayId: z.number().int().positive(),
  classification: z.enum(['A', 'B', 'C', 'D', 'E']),
  toiletType: z.string().optional(),
  waterSource: z.string().optional(),
  electricitySource: z.string().optional(),
  headResidentId: z.string().optional(),
})

export type HouseholdFormValues = z.infer<typeof householdSchema>
