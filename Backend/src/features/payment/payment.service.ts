import { type Prisma } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { prisma } from '../../config/prisma';
import { ApiError } from '../../lib/errors';
import { logActivity } from '../../lib/activity';
import { decimalToString, parseDecimal } from '../../lib/decimal';
import type { AuthSession } from '../auth/auth.types';
import type { PaymentBody, PaymentRecord } from './payment.types';

const mapPayment = (payment: {
  id: string;
  shopId: string;
  customerId: string;
  ticketId: string;
  amountPaid: Decimal;
  paymentFor: 'INTEREST' | 'PRINCIPAL';
  paymentDate: Date;
  createdAt: Date;
  updatedAt: Date;
}): PaymentRecord => ({
  id: payment.id,
  shop_id: payment.shopId,
  customer_id: payment.customerId,
  ticket_id: payment.ticketId,
  amount_paid: decimalToString(payment.amountPaid) ?? '0',
  payment_for: payment.paymentFor === 'INTEREST' ? 'interest' : 'principal',
  payment_date: payment.paymentDate.toISOString(),
  createdAt: payment.createdAt.toISOString(),
  updatedAt: payment.updatedAt.toISOString(),
});

export const createPayment = async (session: AuthSession, body: PaymentBody): Promise<PaymentRecord> => {
  const amount = parseDecimal(body.amount_paid, 'amount_paid');
  if (amount.lessThanOrEqualTo(0)) {
    throw new ApiError(400, 'amount_paid must be a number greater than 0.');
  }

  const paymentFor = body.payment_for === 'interest' ? 'INTEREST' : 'PRINCIPAL';

  const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const ticket = await tx.pawnTicket.findFirst({
      where: {
        id: body.ticket_id,
        shopId: session.shopId,
        isDeleted: false,
      },
      select: {
        id: true,
        customerId: true,
        ticketNumber: true,
        loanAmount: true,
        status: true,
        settledDate: true,
      },
    });

    if (!ticket) {
      throw new ApiError(404, 'Pawn ticket not found for this shop.');
    }

    if (paymentFor === 'PRINCIPAL' && new Decimal(ticket.loanAmount).lessThanOrEqualTo(0)) {
      throw new ApiError(400, 'This ticket is already settled.');
    }

    const payment = await tx.payment.create({
      data: {
        shopId: session.shopId,
        customerId: ticket.customerId,
        ticketId: ticket.id,
        createdByUserId: session.userId,
        amountPaid: amount,
        paymentFor,
        paymentDate: body.payment_date ? new Date(body.payment_date) : new Date(),
      },
    });

    if (paymentFor === 'PRINCIPAL') {
      const remaining = new Decimal(ticket.loanAmount).minus(amount);
      const updatedLoan = remaining.lessThan(0) ? new Decimal(0) : remaining;

      await tx.pawnTicket.update({
        where: { id: ticket.id },
        data: {
          loanAmount: updatedLoan,
          status: updatedLoan.lessThanOrEqualTo(0) ? 'SETTLED' : ticket.status,
          settledDate: updatedLoan.lessThanOrEqualTo(0) ? ticket.settledDate ?? new Date() : ticket.settledDate,
        },
      });
    }

    return payment;
  });

  await logActivity({
    shopId: session.shopId,
    userId: session.userId,
    type: 'NEW_PAYMENT',
    message: `Recorded ${body.payment_for} payment of ₹${decimalToString(amount) ?? '0'}`,
    ticketId: body.ticket_id,
  });

  return mapPayment(result);
};

export const getPaymentsForTicket = async (session: AuthSession, ticketId: string): Promise<PaymentRecord[]> => {
  const ticket = await prisma.pawnTicket.findFirst({
    where: {
      id: ticketId,
      shopId: session.shopId,
      isDeleted: false,
    },
    select: { id: true },
  });

  if (!ticket) {
    throw new ApiError(404, 'Pawn ticket not found for this shop.');
  }

  const payments = await prisma.payment.findMany({
    where: {
      ticketId,
      shopId: session.shopId,
    },
    orderBy: [{ paymentDate: 'desc' }, { createdAt: 'desc' }],
  });

  return payments.map(mapPayment);
};
