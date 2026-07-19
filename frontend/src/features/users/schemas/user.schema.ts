import { z } from 'zod'

export const createUserSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').trim(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  fullName: z.string().min(1, 'Full name is required').trim(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  roleId: z.number().int().positive('Role is required'),
  barangayId: z.number().int().positive('Barangay is required'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

export const updateUserSchema = z.object({
  fullName: z.string().min(1).optional(),
  email: z.string().email().optional().or(z.literal('')),
  roleId: z.number().int().positive().optional(),
  barangayId: z.number().int().positive().optional(),
  isActive: z.boolean().optional(),
})

export type CreateUserFormValues = z.infer<typeof createUserSchema>
export type UpdateUserFormValues = z.infer<typeof updateUserSchema>
