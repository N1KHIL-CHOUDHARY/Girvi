import { Router } from 'express';
import { paymentController } from './payment.controller';
import { authMiddleware } from '../../common/middleware/auth.middleware';
import { requirePermission } from '../../common/middleware/permission.middleware';
import { validateRequest } from '../../common/middleware/validation.middleware';
import { createPaymentSchema } from './payment.validation';

const router = Router();

// Apply auth check globally to all payment endpoints
router.use(authMiddleware);

router.post(
  '/',
  requirePermission('manage:payments'),
  validateRequest({ body: createPaymentSchema }),
  paymentController.createPayment
);

router.get(
  '/ticket/:ticketId',
  requirePermission('manage:payments'),
  paymentController.getPaymentsForTicket
);

export default router;
