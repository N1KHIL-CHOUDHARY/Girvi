import { z } from 'zod';

export const createRoleSchema = z.object({
  name: z.string().min(2, 'Role name must be at least 2 characters'),
  description: z.string().min(5, 'Description must be at least 5 characters'),
  permissions: z.array(z.string()).min(1, 'At least one permission is required')
});

export const updateRoleSchema = z.object({
  name: z.string().min(2, 'Role name must be at least 2 characters').optional(),
  description: z.string().min(5, 'Description must be at least 5 characters').optional(),
  permissions: z.array(z.string()).optional()
});
