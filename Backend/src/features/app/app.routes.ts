import { Router } from 'express';
import Joi from 'joi';
import { authenticate } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate';
import analyticsRoutes from '../analytics/analytics.routes';
import customerRoutes from '../customer/customer.routes';
import employeeRoutes from '../employee/employee.routes';
import pawnRoutes from '../pawn/pawn.routes';
import paymentRoutes from '../payment/payment.routes';
import roleRoutes from '../role/role.routes';
import { getMeController, updatePreferencesController } from './app.controller';

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
router.use('/stat', analyticsRoutes);

export default router;
