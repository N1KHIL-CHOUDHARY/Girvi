import { Request, Response } from 'express';
import { pawnService } from './pawn.service';
import { sendSuccess } from '../../common/utils/apiResponse';
import { asyncHandler } from '../../common/utils/asyncHandler';

export class PawnController {
  getPawnTickets = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const status = req.query.status as string;
    const search = req.query.search as string;
    const customerId = req.query.customerId as string;

    const result = await pawnService.listTickets({ page, limit, status, search, customerId });

    sendSuccess(
      res,
      result.tickets,
      'Pawn tickets retrieved successfully',
      200,
      {
        page: result.currentPage,
        limit,
        total: result.totalPawnTickets,
        totalPages: result.totalPages
      }
    );
  });

  getPawnTicketById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const ticket = await pawnService.getTicketById(id);
    sendSuccess(res, ticket, 'Pawn ticket retrieved successfully');
  });

  createPawnTicket = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const ticket = await pawnService.createTicket(req.body);
    sendSuccess(res, ticket, 'Pawn ticket issued successfully', 201);
  });

  updatePawnTicket = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const ticket = await pawnService.updateTicket(id, req.body);
    sendSuccess(res, ticket, 'Pawn ticket updated successfully');
  });

  deletePawnTicket = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    await pawnService.deleteTicket(id);
    sendSuccess(res, undefined, 'Pawn ticket cancelled and deleted');
  });

  updatePawnTicketStatus = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { status } = req.body;
    const ticket = await pawnService.updateTicketStatus(id, status);
    sendSuccess(res, ticket, `Pawn ticket status modified to ${status}`);
  });

  getPawnTicketStats = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const stats = await pawnService.getTicketStats(id);
    sendSuccess(res, stats, 'Pawn ticket stats retrieved successfully');
  });
}

export const pawnController = new PawnController();
export default pawnController;
