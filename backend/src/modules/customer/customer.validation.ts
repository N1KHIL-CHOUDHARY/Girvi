import { z } from 'zod';

const addressSchema = z.object({
  line1: z.string().optional(),
  city: z.string().optional(),
  pincode: z.string().regex(/^\d{6}$/, 'Pincode must be exactly 6 digits').optional().or(z.literal(''))
});

export const createCustomerSchema = z.object({
  full_name: z.string().min(1, 'Full name is required'),
  phone_number: z.string().min(10, 'Phone number must be at least 10 digits'),
  gender: z.enum(['Male', 'Female', 'Other']).optional(),
  customer_photo_url: z.string().url('Invalid photo URL').optional().or(z.literal('')),
  aadhaar_number: z.string().regex(/^\d{12}$/, 'Aadhaar number must be exactly 12 digits').optional().or(z.literal('')),
  pan_number: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN card format').optional().or(z.literal('')),
  address: addressSchema.optional(),
  dateOfBirth: z.string().datetime({ precision: 3 }).optional().or(z.string().date()).optional().or(z.literal('')),
  occupation: z.string().optional(),
  nominee_name: z.string().optional(),
  nominee_phone: z.string().optional(),
  nominee_relation: z.string().optional(),
  notes: z.string().optional(),
  customerCode: z.string().optional(),
  kycStatus: z.enum(['pending', 'verified', 'rejected']).optional()
});

export const updateCustomerSchema = z.object({
  full_name: z.string().optional(),
  phone_number: z.string().min(10).optional(),
  gender: z.enum(['Male', 'Female', 'Other']).optional(),
  customer_photo_url: z.string().url().optional().or(z.literal('')),
  aadhaar_number: z.string().regex(/^\d{12}$/).optional().or(z.literal('')),
  pan_number: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/).optional().or(z.literal('')),
  address: addressSchema.optional(),
  dateOfBirth: z.string().datetime().optional().or(z.string().date()).optional().or(z.literal('')),
  occupation: z.string().optional(),
  nominee_name: z.string().optional(),
  nominee_phone: z.string().optional(),
  nominee_relation: z.string().optional(),
  notes: z.string().optional(),
  customerCode: z.string().optional(),
  kycStatus: z.enum(['pending', 'verified', 'rejected']).optional()
});

export const queryCustomerSchema = z.object({
  page: z.preprocess((val) => (val === '' || val === 'all' || val === 'undefined' ? undefined : val), z.coerce.number().int().min(1).optional()).default(1),
  limit: z.preprocess((val) => (val === '' || val === 'all' || val === 'undefined' ? undefined : val), z.coerce.number().int().min(1).max(100).optional()).default(10),
  search: z.preprocess((val) => (val === '' || val === 'undefined' ? undefined : val), z.string().optional())
});
