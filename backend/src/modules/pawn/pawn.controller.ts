import { Request, Response, NextFunction } from 'express';
import { pawnService } from './pawn.service';
import { sendResponse } from '../../common/utils/apiResponse';

export class PawnController {
  async getPawnTickets(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 10;
      const status = req.query.status as string; // 'active' | 'settled' | 'defaulted'
      const search = req.query.search as string;

      const result = await pawnService.listTickets({ page, limit, status, search });

      sendResponse(res, {
        message: 'Pawn tickets retrieved successfully',
        data: {
          items: result.tickets,
          page: result.currentPage,
          limit,
          total: result.totalPawnTickets,
          totalPages: result.totalPages
        }
      });
    } catch (error) {
      next(error);
    }
  }
  async getPawnTicketById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const ticket = await pawnService.getTicketById(id);

      sendResponse(res, {
        message: 'Pawn ticket retrieved successfully',
        data: ticket
      });
    } catch (error) {
      next(error);
    }
  }

  async createPawnTicket(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const ticket = await pawnService.createTicket(req.body);

      sendResponse(res, {
        statusCode: 201,
        message: 'Pawn ticket issued successfully',
        data: ticket
      });
    } catch (error) {
      next(error);
    }
  }

  async updatePawnTicket(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const ticket = await pawnService.updateTicket(id, req.body);

      sendResponse(res, {
        message: 'Pawn ticket updated successfully',
        data: ticket
      });
    } catch (error) {
      next(error);
    }
  }

  async deletePawnTicket(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await pawnService.deleteTicket(id);

      sendResponse(res, {
        message: 'Pawn ticket cancelled and deleted'
      });
    } catch (error) {
      next(error);
    }
  }

  async updatePawnTicketStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const ticket = await pawnService.updateTicketStatus(id, status);

      sendResponse(res, {
        message: `Pawn ticket status modified to ${status}`,
        data: ticket
      });
    } catch (error) {
      next(error);
    }
  }
}

export const pawnController = new PawnController();
export default pawnController;
