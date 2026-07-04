import type { Request, Response } from 'express';
import { ApiError } from '../../lib/errors';
import { asyncHandler, sendSuccess } from '../../lib/http';
import type {
  CustomerPawnTicketsParams,
  PawnTicketBody,
  PawnTicketListResponse,
  PawnTicketParams,
  PawnTicketQuery,
  PawnTicketRecord,
  PawnTicketUpdateBody,
} from './pawn.types';
import {
  createPawnTicket,
  deletePawnTicket,
  getPawnTicketById,
  getPawnTicketsForCustomer,
  listPawnTickets,
  settlePawnTicket,
  updatePawnTicket,
} from './pawn.service';

export const createPawnTicketController = asyncHandler<unknown, PawnTicketRecord, PawnTicketBody>(async (req, res: Response<PawnTicketRecord>) => {
  if (!req.user) {
    throw new ApiError(401, 'Not authorized. Token missing.');
  }

  const ticket = await createPawnTicket(req.user, req.body);
  sendSuccess(res, {
    status: 201,
    message: 'Pawn ticket created successfully.',
    data: ticket,
  });
});

export const listPawnTicketsController = asyncHandler<unknown, PawnTicketListResponse, unknown, PawnTicketQuery>(async (req, res: Response<PawnTicketListResponse>) => {
  if (!req.user) {
    throw new ApiError(401, 'Not authorized. Token missing.');
  }

  const result = await listPawnTickets(req.user, req.query as PawnTicketQuery);
  sendSuccess(res, {
    message: 'Pawn tickets fetched successfully.',
    data: result,
    meta: {
      page: result.currentPage,
      totalPages: result.totalPages,
      totalItems: result.totalPawnTickets,
    },
  });
});

export const getPawnTicketByIdController = asyncHandler<{ id: string }>(async (req: Request<{ id: string }>, res) => {
  if (!req.user) {
    throw new ApiError(401, 'Not authorized. Token missing.');
  }

  const ticket = await getPawnTicketById(req.user, req.params.id);
  sendSuccess(res, {
    message: 'Pawn ticket fetched successfully.',
    data: ticket,
  });
});

export const updatePawnTicketController = asyncHandler<{ id: string }, PawnTicketRecord, PawnTicketUpdateBody>(async (req: Request<{ id: string }>, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, 'Not authorized. Token missing.');
  }

  const ticket = await updatePawnTicket(req.user, req.params.id, req.body);
  sendSuccess(res, {
    message: 'Pawn ticket updated successfully.',
    data: ticket,
  });
});

export const deletePawnTicketController = asyncHandler<{ id: string }>(async (req: Request<{ id: string }>, res) => {
  if (!req.user) {
    throw new ApiError(401, 'Not authorized. Token missing.');
  }

  const result = await deletePawnTicket(req.user, req.params.id);
  sendSuccess(res, {
    message: 'Pawn ticket deleted successfully.',
    data: result,
  });
});

export const settlePawnTicketController = asyncHandler<{ id: string }>(async (req: Request<{ id: string }>, res) => {
  if (!req.user) {
    throw new ApiError(401, 'Not authorized. Token missing.');
  }

  const ticket = await settlePawnTicket(req.user, req.params.id);
  sendSuccess(res, {
    message: 'Pawn ticket settled successfully.',
    data: ticket,
  });
});

export const getPawnTicketsForCustomerController = asyncHandler<{ id: string }>(async (req: Request<{ id: string }>, res) => {
  if (!req.user) {
    throw new ApiError(401, 'Not authorized. Token missing.');
  }

  const result = await getPawnTicketsForCustomer(req.user, req.params.id);
  sendSuccess(res, {
    message: 'Customer pawn tickets fetched successfully.',
    data: result,
    meta: {
      totalItems: result.tickets.length,
    },
  });
});
