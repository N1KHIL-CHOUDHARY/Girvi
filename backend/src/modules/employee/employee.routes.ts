import { Router } from 'express';
import { employeeController } from './employee.controller';
import { authMiddleware } from '../../common/middleware/auth.middleware';
import { requirePermission } from '../../common/middleware/permission.middleware';
import { validateRequest } from '../../common/middleware/validation.middleware';
import { createEmployeeSchema, updateEmployeeSchema } from './employee.validation';

const router = Router();

// Apply auth check globally to all employee paths
router.use(authMiddleware);

router.get(
  '/',
  requirePermission('manage:employees'),
  employeeController.getEmployees
);

router.post(
  '/',
  requirePermission('manage:employees'),
  validateRequest({ body: createEmployeeSchema }),
  employeeController.createEmployee
);

router.patch(
  '/:id',
  requirePermission('manage:employees'),
  validateRequest({ body: updateEmployeeSchema }),
  employeeController.updateEmployee
);

router.delete(
  '/:id',
  requirePermission('manage:employees'),
  employeeController.deleteEmployee
);

export default router;
