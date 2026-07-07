import { paymentRepository } from './payment.repository';
import { prisma } from '../../config/database';
import { getTenantShopId, getTenantUserId } from '../../common/context/tenant.context';
import { NotFoundError, ValidationError, AppError } from '../../common/errors/AppError';
import { Prisma } from '@prisma/client';

export class PaymentService {
  async getPaymentsForTicket(ticketId: string): Promise<any[]> {
    const list = await paymentRepository.findByTicketId(ticketId);
    return list.map((p) => ({
      id: p.id,
      shop_id: p.shopId,
      customer_id: p.customerId,
      ticket_id: p.ticketId,
      amount_paid: p.amount_paid.toString(),
      payment_for: p.payment_for,
      payment_date: p.payment_date.toISOString(),
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString()
    }));
  }

  async createPayment(data: {
    ticket_id: string;
    amount_paid: number;
    payment_for: string;
    payment_date?: string;
  }): Promise<any> {
    const shopId = getTenantShopId();
    const userId = getTenantUserId();
    if (!shopId) throw new AppError('Tenant context required', 400);

    // 1. Fetch pawn ticket
    const ticket = await prisma.pawnTicket.findFirst({
      where: { id: data.ticket_id, shopId }
    });
    if (!ticket) {
      throw new NotFoundError('Pawn ticket not found');
    }

    if (ticket.status !== 'active' && ticket.status !== 'defaulted') {
      throw new ValidationError(`Cannot post payment: Ticket is already '${ticket.status}'`);
    }

    // 2. Prevent overpaying principal
    const amountDecimal = new Prisma.Decimal(data.amount_paid);
    if (data.payment_for === 'principal' && amountDecimal.greaterThan(ticket.loan_amount)) {
      throw new ValidationError(
        `Payment amount of ${data.amount_paid} exceeds the remaining loan balance of ${ticket.loan_amount}`
      );
    }

    // 3. Map payment categories to double-entry ledger categories
    let ledgerCategory = 'fee_collected';
    switch (data.payment_for) {
      case 'principal':
        ledgerCategory = 'principal_repaid';
        break;
      case 'interest':
        ledgerCategory = 'interest_received';
        break;
      case 'penalty':
      case 'fine':
        ledgerCategory = 'penalty_collected';
        break;
      case 'auction':
        ledgerCategory = 'auction_revenue';
        break;
      case 'processing_fee':
      case 'service_fee':
        ledgerCategory = 'fee_collected';
        break;
      case 'waiver':
      case 'discount':
        ledgerCategory = 'discount_given';
        break;
    }

    const paymentDate = data.payment_date ? new Date(data.payment_date) : new Date();

    // 4. Create the payment and post ledger entries in a database transaction
    const { payment, ticket: updatedTicket } = await paymentRepository.create({
      shopId,
      customerId: ticket.customerId,
      ticketId: ticket.id,
      amount_paid: amountDecimal,
      payment_for: data.payment_for,
      payment_date: paymentDate,
      ledgerCategory
    });

    // 5. Post audit log
    await prisma.auditLog.create({
      data: {
        shopId,
        userId,
        entityName: 'Payment',
        entityId: payment.id,
        action: 'create',
        newValue: {
          ticket_number: ticket.ticket_number,
          amount_paid: payment.amount_paid.toString(),
          payment_for: payment.payment_for
        }
      }
    });

    return {
      payment: {
        id: payment.id,
        shop_id: payment.shopId,
        customer_id: payment.customerId,
        ticket_id: payment.ticketId,
        amount_paid: payment.amount_paid.toString(),
        payment_for: payment.payment_for,
        payment_date: payment.payment_date.toISOString(),
        createdAt: payment.createdAt.toISOString()
      },
      remaining_balance: updatedTicket.loan_amount.toString(),
      ticket_status: updatedTicket.status
    };
  }
}

export const paymentService = new PaymentService();
export default paymentService;
