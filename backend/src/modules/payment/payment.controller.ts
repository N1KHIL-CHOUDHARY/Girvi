import { Request, Response } from 'express';
import { paymentService } from './payment.service';
import { sendSuccess } from '../../common/utils/apiResponse';
import { asyncHandler } from '../../common/utils/asyncHandler';

export class PaymentController {
  createPayment = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const idempotencyKey = (
      req.headers['x-idempotency-key'] ||
      req.headers['idempotency-key'] ||
      req.body?.idempotencyKey ||
      req.body?.idempotency_key
    ) as string | undefined;

    const result = await paymentService.createPayment({
      ...req.body,
      idempotencyKey
    });

    const statusCode = result.isDuplicate ? 200 : 201;
    const message = result.isDuplicate
      ? 'Duplicate payment request ignored (Idempotent response)'
      : 'Payment received and posted successfully';

    sendSuccess(
      res,
      result.payment,
      message,
      statusCode,
      {
        remaining_balance: result.remaining_balance,
        ticket_status: result.ticket_status,
        isDuplicate: result.isDuplicate
      }
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
