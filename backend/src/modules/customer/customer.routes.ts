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

// Apply auth check globally to all customer endpoints
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

router.get(
  '/:id/stats',
  requirePermission('manage:customers'),
  customerController.getCustomerStats
);

// Fetch pawn tickets linked to a specific customer account ID
router.get(
  '/:accountId/pawns',
  requirePermission('manage:customers'),
  customerController.getCustomerTickets
);

export default router;
