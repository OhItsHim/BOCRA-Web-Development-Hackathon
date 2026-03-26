import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  phone: z.string().optional(),
  organization: z.string().optional(),
})

export const complaintSchema = z.object({
  category: z.string().min(1, 'Category is required'),
  sector: z.string().min(1, 'Sector is required'),
  licensee_id: z.string().optional(),
  description: z.string().min(50, 'Description must be at least 50 characters'),
  contact_email: z.string().email('Invalid email').optional().or(z.literal('')),
})

export const licenseApplicationSchema = z.object({
  license_type: z.string().min(1, 'License type is required'),
  business_name: z.string().min(2, 'Business name is required'),
  registration_number: z.string().optional(),
  contact_email: z.string().email('Invalid email'),
  contact_phone: z.string().optional(),
  address: z.string().optional(),
})
