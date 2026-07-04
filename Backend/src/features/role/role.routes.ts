import { Router } from 'express';
import Joi from 'joi';
import { authenticate, checkPermission } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validate.js';
import { createRoleController, deleteRoleController, getRolesController, updateRoleController } from './role.controller.js';

const router = Router();

const permissionSchema = Joi.object({
  can_view_dashboard: Joi.boolean().optional(),
  can_view_customers: Joi.boolean().optional(),
  can_create_customers: Joi.boolean().optional(),
  can_edit_customers: Joi.boolean().optional(),
  can_delete_customers: Joi.boolean().optional(),
  can_view_tickets: Joi.boolean().optional(),
  can_create_tickets: Joi.boolean().optional(),
  can_settle_tickets: Joi.boolean().optional(),
  can_delete_tickets: Joi.boolean().optional(),
  can_manage_employees: Joi.boolean().optional(),
  can_manage_roles: Joi.boolean().optional(),
  can_view_reports: Joi.boolean().optional(),
});

const roleSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  permissions: permissionSchema.optional(),
});

router.use(authenticate);
router.get('/', getRolesController);
router.post('/', checkPermission('can_manage_roles'), validate(roleSchema), createRoleController);
router.patch('/:roleId', checkPermission('can_manage_roles'), validate(roleSchema), updateRoleController);
router.delete('/:roleId', checkPermission('can_manage_roles'), deleteRoleController);

export default router;
