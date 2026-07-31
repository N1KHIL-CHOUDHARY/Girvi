import { Request, Response } from 'express';
import { paymentService } from './payment.service';
import { sendSuccess } from '../../common/utils/apiResponse';
import { asyncHandler } from '../../common/utils/asyncHandler';

export class PaymentController {
  createPayment = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const result = await paymentService.createPayment(req.body);
    sendSuccess(
      res,
      result.payment,
      'Payment received and posted successfully',
      201,
      {
        remaining_balance: result.remaining_balance,
        ticket_status: result.ticket_status
      } as any
    );
  });

  getPaymentsForTicket = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { ticketId } = req.params;
    const list = await paymentService.getPaymentsForTicket(ticketId);
    sendSuccess(res, list, 'Payments retrieved successfully');
  });
}

export const paymentController = new PaymentController();
export default paymentController;
