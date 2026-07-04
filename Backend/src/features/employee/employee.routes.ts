import { Router } from 'express';
import Joi from 'joi';
import { authenticate, checkPermission } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validate.js';
import {
  createEmployeeController,
  deleteEmployeeController,
  listEmployeesController,
  updateEmployeeController,
} from './employee.controller.js';

const router = Router();

const employeeSchema = Joi.object({
  full_name: Joi.string().min(3).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  roleId: Joi.string().length(24).optional(),
});

const employeeUpdateSchema = Joi.object({
  full_name: Joi.string().min(3).max(100).optional(),
  email: Joi.string().email().optional(),
  password: Joi.string().min(6).optional(),
  roleId: Joi.string().length(24).optional(),
});

router.use(authenticate);
router.get('/', checkPermission('can_manage_employees'), listEmployeesController);
router.post('/', checkPermission('can_manage_employees'), validate(employeeSchema), createEmployeeController);
router.patch('/:employeeId', checkPermission('can_manage_employees'), validate(employeeUpdateSchema), updateEmployeeController);
router.delete('/:employeeId', checkPermission('can_manage_employees'), deleteEmployeeController);

export default router;
