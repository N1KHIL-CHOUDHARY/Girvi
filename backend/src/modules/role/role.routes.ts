import { Router } from 'express';
import { roleController } from './role.controller';
import { authMiddleware } from '../../common/middleware/auth.middleware';
import { requirePermission } from '../../common/middleware/permission.middleware';
import { validateRequest } from '../../common/middleware/validation.middleware';
import { createRoleSchema, updateRoleSchema } from './role.validation';

const router = Router();

// Apply auth check globally to all role endpoints
router.use(authMiddleware);

router.get(
  '/',
  requirePermission('manage:roles'),
  roleController.getRoles
);

router.post(
  '/',
  requirePermission('manage:roles'),
  validateRequest({ body: createRoleSchema }),
  roleController.createRole
);

router.patch(
  '/:id',
  requirePermission('manage:roles'),
  validateRequest({ body: updateRoleSchema }),
  roleController.updateRole
);

router.delete(
  '/:id',
  requirePermission('manage:roles'),
  roleController.deleteRole
);

export default router;
