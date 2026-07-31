import { Router } from 'express';
import { pawnController } from './pawn.controller';
import { authMiddleware } from '../../common/middleware/auth.middleware';
import { requirePermission } from '../../common/middleware/permission.middleware';
import { validateRequest } from '../../common/middleware/validation.middleware';
import {
  createPawnTicketSchema,
  updatePawnTicketSchema,
  settlePawnTicketSchema,
  queryPawnTicketSchema
} from './pawn.validation';

const router = Router();

router.use(authMiddleware);

router.get(
  '/',
  requirePermission('manage:pawns'),
  validateRequest({ query: queryPawnTicketSchema }),
  pawnController.getPawnTickets
);

router.post(
  '/',
  requirePermission('manage:pawns'),
  validateRequest({ body: createPawnTicketSchema }),
  pawnController.createPawnTicket
);

router.get(
  '/:id/stats',
  requirePermission('manage:pawns'),
  pawnController.getPawnTicketStats
);

router.patch(
  '/:id/settle',
  requirePermission('manage:pawns'),
  validateRequest({ body: settlePawnTicketSchema }),
  pawnController.updatePawnTicketStatus
);

router.get(
  '/:id',
  requirePermission('manage:pawns'),
  pawnController.getPawnTicketById
);

router.patch(
  '/:id',
  requirePermission('manage:pawns'),
  validateRequest({ body: updatePawnTicketSchema }),
  pawnController.updatePawnTicket
);

router.delete(
  '/:id',
  requirePermission('manage:pawns'),
  pawnController.deletePawnTicket
);

export default router;
