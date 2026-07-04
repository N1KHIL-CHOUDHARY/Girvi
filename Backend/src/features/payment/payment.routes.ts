import { Router } from 'express';
import Joi from 'joi';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validate.js';
import { createPaymentController, getPaymentsForTicketController } from './payment.controller.js';

const router = Router();

const paymentSchema = Joi.object({
  ticket_id: Joi.string().length(24).required(),
  amount_paid: Joi.number().positive().required(),
  payment_for: Joi.string().valid('interest', 'principal').required(),
  payment_date: Joi.date().iso().optional(),
});

router.use(authenticate);
router.post('/', validate(paymentSchema), createPaymentController);
router.get('/ticket/:ticketId', getPaymentsForTicketController);

export default router;
