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
      amount_paid: p.amountPaid.toString(),
      payment_for: p.paymentFor,
      payment_date: p.paymentDate.toISOString(),
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
      const existingPayment = await paymentRepository.findByIdempotencyKey(idempotencyKey);
      if (existingPayment) {
        return {
          payment: {
            id: existingPayment.id,
            shop_id: existingPayment.shopId,
            customer_id: existingPayment.customerId,
            ticket_id: existingPayment.ticketId,
            amount_paid: existingPayment.amountPaid.toString(),
            payment_for: existingPayment.paymentFor,
            payment_date: existingPayment.paymentDate.toISOString(),
            createdAt: existingPayment.createdAt.toISOString(),
          },
          remaining_balance: existingPayment.ticket ? existingPayment.ticket.loanAmount.toString() : "0.00",
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
      const ticket = await paymentRepository.lockTicket(tx, data.ticket_id);
      if (!ticket) {
        throw new NotFoundError("Pawn ticket not found");
      }

      // Check idempotency in case of concurrent requests waiting on the row lock
      if (idempotencyKey) {
        const concurrentPayment = await tx.payment.findUnique({
          where: { idempotencyKey },
          include: { ticket: true },
        });
        if (concurrentPayment) {
          return {
            payment: {
              id: concurrentPayment.id,
              shop_id: concurrentPayment.shopId,
              customer_id: concurrentPayment.customerId,
              ticket_id: concurrentPayment.ticketId,
              amount_paid: concurrentPayment.amountPaid.toString(),
              payment_for: concurrentPayment.paymentFor,
              payment_date: concurrentPayment.paymentDate.toISOString(),
              createdAt: concurrentPayment.createdAt.toISOString(),
            },
            remaining_balance: concurrentPayment.ticket ? concurrentPayment.ticket.loanAmount.toString() : "0.00",
            ticket_status: concurrentPayment.ticket ? concurrentPayment.ticket.status : "settled",
            isDuplicate: true,
          };
        }
      }

      // Strict Validation
      if (ticket.status !== "active" && ticket.status !== "defaulted") {
        throw new ValidationError(`Cannot post payment: Ticket is already '${ticket.status}'`);
      }

      const currentLoanAmount = new Prisma.Decimal(ticket.loanAmount);
      if (data.payment_for === "principal" && amountDecimal.greaterThan(currentLoanAmount)) {
        throw new ValidationError(
          `Payment amount of ${data.amount_paid} exceeds the remaining loan balance of ${currentLoanAmount}`
        );
      }

      // Atomic Balance & Status Update
      let remainingLoan = currentLoanAmount;
      let newStatus = ticket.status;
      let settledDate = ticket.settledDate;

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
        loanAmount: remainingLoan,
        status: newStatus,
        settledDate: settledDate,
      });

      // Record Payment using native Prisma.PaymentCreateInput with relation connects
      const payment = await paymentRepository.createPayment(tx, {
        amountPaid: amountDecimal,
        paymentFor: data.payment_for,
        paymentDate: paymentDate,
        idempotencyKey: idempotencyKey || null,
        shop: {
          connect: { id: shopId }
        },
        customer: {
          connect: { id: ticket.customerId }
        },
        ticket: {
          connect: { id: ticket.id }
        }
      });

      // Bookkeeping Double-Entry Ledger using native Prisma.LedgerEntryCreateInput with relation connects
      await paymentRepository.createLedgerEntry(tx, {
        type: "credit",
        category: ledgerCategory,
        amount: amountDecimal,
        entryDate: paymentDate,
        description: `Received payment for ${data.payment_for} on ticket ${ticket.ticketNumber}`,
        shop: {
          connect: { id: shopId }
        },
        ticket: {
          connect: { id: ticket.id }
        },
        payment: {
          connect: { id: payment.id }
        }
      });

      // Write Audit Log
      const auditData: Prisma.AuditLogCreateInput = {
        entityName: "Payment",
        entityId: payment.id,
        action: "create",
        newValue: {
          ticketNumber: ticket.ticketNumber,
          amountPaid: payment.amountPaid.toString(),
          paymentFor: payment.paymentFor,
          idempotencyKey: payment.idempotencyKey,
        },
        shop: {
          connect: { id: shopId }
        },
        ...(userId
          ? {
              user: {
                connect: { id: userId }
              }
            }
          : {})
      };

      await tx.auditLog.create({
        data: auditData,
      });

      return {
        payment: {
          id: payment.id,
          shop_id: payment.shopId,
          customer_id: payment.customerId,
          ticket_id: payment.ticketId,
          amount_paid: payment.amountPaid.toString(),
          payment_for: payment.paymentFor,
          payment_date: payment.paymentDate.toISOString(),
          createdAt: payment.createdAt.toISOString(),
        },
        remaining_balance: updatedTicket.loanAmount.toString(),
        ticket_status: updatedTicket.status,
        isDuplicate: false,
      };
    });
  }
}

export const paymentService = new PaymentService();
export default paymentService;
