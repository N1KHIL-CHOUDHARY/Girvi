import { z } from 'zod';

export const createPaymentSchema = z.object({
  ticket_id: z.string().uuid('Invalid ticket ID'),
  amount_paid: z.coerce.number().positive('Payment amount must be greater than 0'),
  payment_for: z.enum([
    'principal',
    'interest',
    'penalty',
    'fine',
    'auction',
    'processing_fee',
    'service_fee',
    'waiver',
    'discount'
  ]),
  payment_date: z.string().datetime().optional().or(z.string().date()).optional(),
  idempotencyKey: z.string().max(128).optional(),
  idempotency_key: z.string().max(128).optional()
});
