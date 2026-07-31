import { Router } from 'express';
import { customerController } from './customer.controller';
import { authMiddleware } from '../../common/middleware/auth.middleware';
import { requirePermission } from '../../common/middleware/permission.middleware';
import { validateRequest } from '../../common/middleware/validation.middleware';
import {
  createCustomerSchema,
  updateCustomerSchema,
  queryCustomerSchema
} from './customer.validation';

const router = Router();

router.use(authMiddleware);

router.get(
  '/',
  requirePermission('manage:customers'),
  validateRequest({ query: queryCustomerSchema }),
  customerController.getCustomers
);

router.post(
  '/',
  requirePermission('manage:customers'),
  validateRequest({ body: createCustomerSchema }),
  customerController.createCustomer
);

router.get(
  '/:id/stats',
  requirePermission('manage:customers'),
  customerController.getCustomerStats
);

router.get(
  '/:id/tickets',
  requirePermission('manage:customers'),
  customerController.getCustomerTickets
);

router.get(
  '/:accountId/pawns',
  requirePermission('manage:customers'),
  customerController.getCustomerTickets
);

router.get(
  '/:id',
  requirePermission('manage:customers'),
  customerController.getCustomerById
);

router.patch(
  '/:id',
  requirePermission('manage:customers'),
  validateRequest({ body: updateCustomerSchema }),
  customerController.updateCustomer
);

router.delete(
  '/:id',
  requirePermission('manage:customers'),
  customerController.deleteCustomer
);

export default router;
