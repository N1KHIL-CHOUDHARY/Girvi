import { paymentRepository } from "./payment.repository";
import { prisma } from "../../config/database";
import { getTenantShopId, getTenantUserId } from "../../common/context/tenant.context";
import { NotFoundError, ValidationError, AppError } from "../../common/errors/AppError";
import { Prisma } from "@prisma/client";

export interface CreatePaymentInput {
  ticket_id: string;
  amount_paid: number;
  payment_for: string;
  payment_date?: string;
  idempotencyKey?: string;
  idempotency_key?: string;
}

export interface PaymentResponse {
  payment: {
    id: string;
    shop_id: string;
    customer_id: string;
    ticket_id: string;
    amount_paid: string;
    payment_for: string;
    payment_date: string;
    createdAt: string;
  };
  remaining_balance: string;
  ticket_status: string;
  isDuplicate: boolean;
}

export class PaymentService {
  async getPaymentsForTicket(ticketId: string) {
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
      updatedAt: p.updatedAt.toISOString(),
    }));
  }

  async createPayment(data: CreatePaymentInput): Promise<PaymentResponse> {
    const shopId = getTenantShopId();
    const userId = getTenantUserId() ?? null;
    if (!shopId) throw new AppError("Tenant context required", 400);

    const idempotencyKey = data.idempotencyKey || data.idempotency_key;

    // 1. Upfront Idempotency Check
    if (idempotencyKey) {
      const existingPayment = await paymentRepository.findByIdempotencyKey(idempotencyKey, shopId);
      if (existingPayment) {
        return {
          payment: {
            id: existingPayment.id,
            shop_id: existingPayment.shopId,
            customer_id: existingPayment.customerId,
            ticket_id: existingPayment.ticketId,
            amount_paid: existingPayment.amount_paid.toString(),
            payment_for: existingPayment.payment_for,
            payment_date: existingPayment.payment_date.toISOString(),
            createdAt: existingPayment.createdAt.toISOString(),
          },
          remaining_balance: existingPayment.ticket ? existingPayment.ticket.loan_amount.toString() : "0.00",
          ticket_status: existingPayment.ticket ? existingPayment.ticket.status : "settled",
          isDuplicate: true,
        };
      }
    }

    let ledgerCategory = "fee_collected";
    switch (data.payment_for) {
      case "principal":
        ledgerCategory = "principal_repaid";
        break;
      case "interest":
        ledgerCategory = "interest_received";
        break;
      case "penalty":
      case "fine":
        ledgerCategory = "penalty_collected";
        break;
      case "auction":
        ledgerCategory = "auction_revenue";
        break;
      case "processing_fee":
      case "service_fee":
        ledgerCategory = "fee_collected";
        break;
      case "waiver":
      case "discount":
        ledgerCategory = "discount_given";
        break;
    }

    const paymentDate = data.payment_date ? new Date(data.payment_date) : new Date();
    const amountDecimal = new Prisma.Decimal(data.amount_paid);

    // 2. Atomic Transaction with Pessimistic Row Locking
    return prisma.$transaction(async (tx) => {
      // Row-level lock on PawnTicket
      const ticket = await paymentRepository.lockTicket(tx, data.ticket_id, shopId);
      if (!ticket) {
        throw new NotFoundError("Pawn ticket not found");
      }

      // Check idempotency in case of concurrent requests waiting on the row lock
      if (idempotencyKey) {
        const concurrentPayment = await tx.payment.findFirst({
          where: { idempotencyKey, shopId },
          include: { ticket: true },
        });
        if (concurrentPayment) {
          return {
            payment: {
              id: concurrentPayment.id,
              shop_id: concurrentPayment.shopId,
              customer_id: concurrentPayment.customerId,
              ticket_id: concurrentPayment.ticketId,
              amount_paid: concurrentPayment.amount_paid.toString(),
              payment_for: concurrentPayment.payment_for,
              payment_date: concurrentPayment.payment_date.toISOString(),
              createdAt: concurrentPayment.createdAt.toISOString(),
            },
            remaining_balance: concurrentPayment.ticket ? concurrentPayment.ticket.loan_amount.toString() : "0.00",
            ticket_status: concurrentPayment.ticket ? concurrentPayment.ticket.status : "settled",
            isDuplicate: true,
          };
        }
      }

      // Strict Validation
      if (ticket.status !== "active" && ticket.status !== "defaulted") {
        throw new ValidationError(`Cannot post payment: Ticket is already '${ticket.status}'`);
      }

      const currentLoanAmount = new Prisma.Decimal(ticket.loan_amount);
      if (data.payment_for === "principal" && amountDecimal.greaterThan(currentLoanAmount)) {
        throw new ValidationError(
          `Payment amount of ${data.amount_paid} exceeds the remaining loan balance of ${currentLoanAmount}`
        );
      }

      // Atomic Balance & Status Update
      let remainingLoan = currentLoanAmount;
      let newStatus = ticket.status;
      let settledDate = ticket.settled_date;

      const reducesPrincipal = ["principal", "waiver", "discount"].includes(data.payment_for);
      if (reducesPrincipal) {
        remainingLoan = remainingLoan.minus(amountDecimal);
        if (remainingLoan.lessThanOrEqualTo(0)) {
          remainingLoan = new Prisma.Decimal(0);
          newStatus = "settled";
          settledDate = paymentDate;
        }
      }

      const updatedTicket = await paymentRepository.updateTicket(tx, ticket.id, {
        loan_amount: remainingLoan,
        status: newStatus,
        settled_date: settledDate,
      });

      // Record Payment
      const payment = await paymentRepository.createPayment(tx, {
        shopId,
        customerId: ticket.customerId,
        ticketId: ticket.id,
        amount_paid: amountDecimal,
        payment_for: data.payment_for,
        payment_date: paymentDate,
        idempotencyKey: idempotencyKey || null,
      });

      // Bookkeeping Double-Entry Ledger
      await paymentRepository.createLedgerEntry(tx, {
        shopId,
        ticketId: ticket.id,
        paymentId: payment.id,
        type: "credit",
        category: ledgerCategory,
        amount: amountDecimal,
        entryDate: paymentDate,
        description: `Received payment for ${data.payment_for} on ticket ${ticket.ticket_number}`,
      });

      // Write Audit Log
      await tx.auditLog.create({
        data: {
          shopId,
          userId,
          entityName: "Payment",
          entityId: payment.id,
          action: "create",
          newValue: {
            ticket_number: ticket.ticket_number,
            amount_paid: payment.amount_paid.toString(),
            payment_for: payment.payment_for,
            idempotencyKey: payment.idempotencyKey,
          },
        } as unknown as Prisma.AuditLogCreateInput,
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
          createdAt: payment.createdAt.toISOString(),
        },
        remaining_balance: updatedTicket.loan_amount.toString(),
        ticket_status: updatedTicket.status,
        isDuplicate: false,
      };
    });
  }
}

export const paymentService = new PaymentService();
export default paymentService;
