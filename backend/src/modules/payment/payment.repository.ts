import { Payment, PawnTicket, Prisma } from '@prisma/client';
import { prisma } from '../../config/database';

export class PaymentRepository {
  async findByTicketId(ticketId: string): Promise<Payment[]> {
    return prisma.payment.findMany({
      where: { ticketId },
      orderBy: { payment_date: 'desc' }
    });
  }

  async create(data: {
    shopId: string;
    customerId: string;
    ticketId: string;
    amount_paid: Prisma.Decimal;
    payment_for: string;
    payment_date: Date;
    ledgerCategory: string;
  }): Promise<{ payment: Payment; ticket: PawnTicket }> {
    return prisma.$transaction(async (tx) => {
      // 1. Fetch the ticket
      const ticket = await tx.pawnTicket.findFirst({
        where: { id: data.ticketId }
      });
      if (!ticket) {
        throw new Error('Pawn ticket not found');
      }

      if (ticket.status === 'settled') {
        throw new Error('Pawn ticket is already settled and closed');
      }

      // 2. Adjust remaining principal if paying principal, waiver, or discount
      let remainingLoan = new Prisma.Decimal(ticket.loan_amount);
      let status = ticket.status;
      let settled_date = ticket.settled_date;

      const reducesPrincipal = ['principal', 'waiver', 'discount'].includes(data.payment_for);
      
      if (reducesPrincipal) {
        remainingLoan = remainingLoan.minus(data.amount_paid);
        if (remainingLoan.lessThanOrEqualTo(0)) {
          remainingLoan = new Prisma.Decimal(0);
          status = 'settled';
          settled_date = data.payment_date;
        }
      }

      // 3. Update Pawn Ticket
      const updatedTicket = await tx.pawnTicket.update({
        where: { id: data.ticketId },
        data: {
          loan_amount: remainingLoan,
          status,
          settled_date
        }
      });

      // 4. Record Payment
      const payment = await tx.payment.create({
        data: {
          shopId: data.shopId,
          customerId: data.customerId,
          ticketId: data.ticketId,
          amount_paid: data.amount_paid,
          payment_for: data.payment_for,
          payment_date: data.payment_date
        }
      });

      // 5. Post Bookkeeping Ledger Entry
      await tx.ledgerEntry.create({
        data: {
          shopId: data.shopId,
          ticketId: data.ticketId,
          paymentId: payment.id,
          type: 'credit', // Credit asset (reducing loans receivable) or interest income
          category: data.ledgerCategory,
          amount: data.amount_paid,
          entryDate: data.payment_date,
          description: `Received payment for ${data.payment_for} on ticket ${ticket.ticket_number}`
        }
      });

      return { payment, ticket: updatedTicket };
    });
  }
}

export const paymentRepository = new PaymentRepository();
export default paymentRepository;
