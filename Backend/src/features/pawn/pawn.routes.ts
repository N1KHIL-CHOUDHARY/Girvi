import { Router } from 'express';
import Joi from 'joi';
import { authenticate, checkPermission } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validate.js';
import {
  createPawnTicketController,
  deletePawnTicketController,
  getPawnTicketByIdController,
  listPawnTicketsController,
  settlePawnTicketController,
  updatePawnTicketController,
} from './pawn.controller.js';

const router = Router();

const itemSchema = Joi.object({
  name: Joi.string().required(),
  type: Joi.string().optional(),
  weight_grams: Joi.number().positive().required(),
  purity: Joi.number().optional(),
  description: Joi.string().allow('').optional(),
  item_photo_url: Joi.string().uri().allow('').optional(),
});

const pawnTicketSchema = Joi.object({
  customer_id: Joi.string().min(1).required(),
  ticket_number: Joi.string().min(1).required(),
  loan_amount: Joi.number().positive().required(),
  interest_rate: Joi.number().min(0).required(),
  adv_amount: Joi.number().min(0).required(),
  pawned_date: Joi.date().iso().optional(),
  items: Joi.array().items(itemSchema).min(1).required(),
});

const pawnTicketUpdateSchema = Joi.object({
  ticket_number: Joi.string().min(1).optional(),
  loan_amount: Joi.number().positive().optional(),
  interest_rate: Joi.number().min(0).optional(),
  adv_amount: Joi.number().min(0).optional(),
  pawned_date: Joi.date().iso().optional(),
  status: Joi.string().valid('active', 'settled', 'defaulted').optional(),
  items: Joi.array().items(itemSchema).min(1).optional(),
});

router.use(authenticate);
router.post('/', checkPermission('can_create_tickets'), validate(pawnTicketSchema), createPawnTicketController);
router.get('/', checkPermission('can_view_tickets'), listPawnTicketsController);
router.get('/:id', checkPermission('can_view_tickets'), getPawnTicketByIdController);
router.patch('/:id', checkPermission('can_create_tickets'), validate(pawnTicketUpdateSchema), updatePawnTicketController);
router.delete('/:id', checkPermission('can_delete_tickets'), deletePawnTicketController);
router.patch('/:id/settle', checkPermission('can_settle_tickets'), settlePawnTicketController);

export default router;
