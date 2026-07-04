import type { Request, Response } from 'express';
import { ApiError } from '../../lib/errors';
import { asyncHandler, sendSuccess } from '../../lib/http';
import type { PaymentBody, PaymentParams, PaymentRecord } from './payment.types';
import { createPayment, getPaymentsForTicket } from './payment.service';

export const createPaymentController = asyncHandler<unknown, PaymentRecord, PaymentBody>(async (req, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, 'Not authorized. Token missing.');
  }

  const payment = await createPayment(req.user, req.body);
  sendSuccess(res, {
    status: 201,
    message: 'Payment recorded successfully.',
    data: payment,
  });
});

export const getPaymentsForTicketController = asyncHandler<{ ticketId: string }>(async (req: Request<{ ticketId: string }>, res) => {
  if (!req.user) {
    throw new ApiError(401, 'Not authorized. Token missing.');
  }

  const payments = await getPaymentsForTicket(req.user, req.params.ticketId);
  sendSuccess(res, {
    message: 'Payments fetched successfully.',
    data: payments,
  });
});
