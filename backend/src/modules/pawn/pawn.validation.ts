import { z } from 'zod';

export const createPawnItemSchema = z.object({
  name: z.string().min(1, 'Item name is required'),
  type: z.string().optional(),
  weight_grams: z.coerce.number().positive('Weight must be greater than 0'),
  purity: z.string().optional(),
  description: z.string().optional(),
  item_photo_url: z.string().url('Invalid item photo URL').optional().or(z.literal(''))
});

export const createPawnTicketSchema = z.object({
  customer_id: z.string().uuid('Invalid customer ID'),
  ticket_number: z.string().min(1, 'Ticket number is required'),
  loan_amount: z.coerce.number().positive('Loan amount must be greater than 0'),
  interest_rate: z.coerce.number().positive('Interest rate must be greater than 0'),
  adv_amount: z.coerce.number().min(0, 'Advance amount cannot be negative').default(0),
  pawned_date: z.string().datetime().optional().or(z.string().date()).optional(),
  interestType: z.enum(['monthly', 'daily', 'simple', 'compound']).default('monthly'),
  graceDays: z.coerce.number().int().min(0).default(7),
  loanDuration: z.coerce.number().int().positive('Duration must be greater than 0').default(12),
  items: z.array(createPawnItemSchema).min(1, 'At least one pawn item is required')
});

export const updatePawnTicketSchema = z.object({
  ticket_number: z.string().optional(),
  loan_amount: z.coerce.number().positive().optional(),
  interest_rate: z.coerce.number().positive().optional(),
  adv_amount: z.coerce.number().min(0).optional(),
  pawned_date: z.string().datetime().optional().or(z.string().date()).optional(),
  interestType: z.enum(['monthly', 'daily', 'simple', 'compound']).optional(),
  graceDays: z.coerce.number().int().min(0).optional(),
  loanDuration: z.coerce.number().int().positive().optional(),
  status: z.enum(['active', 'settled', 'defaulted']).optional(),
  items: z.array(createPawnItemSchema).optional()
});

export const settlePawnTicketSchema = z.object({
  status: z.enum(['active', 'settled', 'defaulted'])
});

export const queryPawnTicketSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
  status: z.enum(['active', 'settled', 'defaulted']).optional()
});
