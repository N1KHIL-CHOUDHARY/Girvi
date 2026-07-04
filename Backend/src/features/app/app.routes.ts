import { Router } from 'express';
import Joi from 'joi';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validate.js';
import analyticsRoutes from '../analytics/analytics.routes.js';
import customerRoutes from '../customer/customer.routes.js';
import employeeRoutes from '../employee/employee.routes.js';
import pawnRoutes from '../pawn/pawn.routes.js';
import paymentRoutes from '../payment/payment.routes.js';
import roleRoutes from '../role/role.routes.js';
import uploadRoutes from '../upload/upload.routes.js';
import { getMeController, updatePreferencesController } from './app.controller.js';

const router = Router();

const preferencesSchema = Joi.object({
  language: Joi.string().valid('en', 'hi', 'ta').required(),
});

router.get('/me', authenticate, getMeController);
router.put('/users/preferences', authenticate, validate(preferencesSchema), updatePreferencesController);
router.use('/roles', roleRoutes);
router.use('/customers', customerRoutes);
router.use('/employees', employeeRoutes);
router.use('/pawns', pawnRoutes);
router.use('/payments', paymentRoutes);
router.use('/upload', uploadRoutes);
router.use('/stat', analyticsRoutes);

export default router;
