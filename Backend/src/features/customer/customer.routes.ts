import { Router } from 'express';
import Joi from 'joi';
import { authenticate, checkPermission } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate';
import {
  createCustomerController,
  deleteCustomerController,
  getCustomerByIdController,
  listCustomersController,
  updateCustomerController,
} from './customer.controller';

const router = Router();

const customerSchema = Joi.object({
  full_name: Joi.string().min(3).max(100).required(),
  phone_number: Joi.string().min(10).max(15).required(),
  gender: Joi.string().valid('Male', 'Female', 'Other').optional(),
  address: Joi.object({
    line1: Joi.string().allow('').optional(),
    city: Joi.string().allow('').optional(),
    pincode: Joi.string().allow('').optional(),
  }).optional(),
  customer_photo_url: Joi.string().uri().allow('').optional(),
  aadhaar_number: Joi.string().allow('').optional(),
  pan_number: Joi.string().allow('').optional(),
});

const customerUpdateSchema = Joi.object({
  full_name: Joi.string().min(3).max(100).optional(),
  phone_number: Joi.string().min(10).max(15).optional(),
  gender: Joi.string().valid('Male', 'Female', 'Other').optional(),
  address: Joi.object({
    line1: Joi.string().allow('').optional(),
    city: Joi.string().allow('').optional(),
    pincode: Joi.string().allow('').optional(),
  }).optional(),
  customer_photo_url: Joi.string().uri().allow('').optional(),
  aadhaar_number: Joi.string().allow('').optional(),
  pan_number: Joi.string().allow('').optional(),
});

router.use(authenticate);
router.get('/', checkPermission('can_view_customers'), listCustomersController);
router.post('/', checkPermission('can_create_customers'), validate(customerSchema), createCustomerController);
router.get('/:id', checkPermission('can_view_customers'), getCustomerByIdController);
router.patch('/:id', checkPermission('can_edit_customers'), validate(customerUpdateSchema), updateCustomerController);
router.delete('/:id', checkPermission('can_delete_customers'), deleteCustomerController);

export default router;
