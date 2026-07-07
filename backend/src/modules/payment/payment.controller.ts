import { Request, Response, NextFunction } from 'express';
import { paymentService } from './payment.service';
import { sendResponse } from '../../common/utils/apiResponse';

export class PaymentController {
  async createPayment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await paymentService.createPayment(req.body);
      sendResponse(res, {
        statusCode: 201,
        message: 'Payment received and posted successfully',
        data: result.payment,
        meta: {
          remaining_balance: result.remaining_balance,
          ticket_status: result.ticket_status
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async getPaymentsForTicket(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { ticketId } = req.params;
      const list = await paymentService.getPaymentsForTicket(ticketId);

      sendResponse(res, {
        message: 'Payments retrieved successfully',
        data: list
      });
    } catch (error) {
      next(error);
    }
  }
}

export const paymentController = new PaymentController();
export default paymentController;
