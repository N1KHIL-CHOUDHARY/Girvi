import { paymentRepository } from "./payment.repository";
import { prisma } from "../../config/database";
import { getTenantShopId, getTenantUserId } from "../../common/context/tenant.context";
import { NotFoundError, ValidationError, BadRequestError } from "../../common/errors/AppError";
import { Prisma, Payment, PawnTicket } from "@prisma/client";

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

const LEDGER_CATEGORY_MAP: Record<string, string> = {
  principal: "principal_repaid",
  interest: "interest_received",
  penalty: "penalty_collected",
  fine: "penalty_collected",
  auction: "auction_revenue",
  processing_fee: "fee_collected",
  service_fee: "fee_collected",
  waiver: "discount_given",
  discount: "discount_given",
};

export class PaymentService {
  private formatPaymentResponse(
    payment: Payment,
    ticket: Partial<PawnTicket> | null | undefined,
    isDuplicate: boolean
  ): PaymentResponse {
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
      remaining_balance: ticket?.loanAmount ? ticket.loanAmount.toString() : "0.00",
      ticket_status: ticket?.status ?? "settled",
      isDuplicate,
    };
  }

  async getPaymentsForTicket(ticketId: string) {
    const shopId = getTenantShopId();
    if (!shopId) throw new BadRequestError("Tenant context required");

    const list = await paymentRepository.findByTicketId(ticketId, shopId);
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
    if (!shopId) throw new BadRequestError("Tenant context required");

    const idempotencyKey = data.idempotencyKey ?? data.idempotency_key;

    // 1. Upfront Idempotency Check
    if (idempotencyKey) {
      const existing = await paymentRepository.findByIdempotencyKey(idempotencyKey, shopId);
      if (existing) {
        return this.formatPaymentResponse(existing, existing.ticket, true);
      }
    }

    const ledgerCategory = LEDGER_CATEGORY_MAP[data.payment_for.toLowerCase()] ?? "fee_collected";
    const paymentDate = data.payment_date ? new Date(data.payment_date) : new Date();
    const amountDecimal = new Prisma.Decimal(data.amount_paid);

    // 2. Atomic Transaction with Pessimistic Row Locking
    return prisma.$transaction(async (tx) => {
      const ticket = await paymentRepository.lockTicket(tx, data.ticket_id);
      if (!ticket) {
        throw new NotFoundError("Pawn ticket not found");
      }

      // Check idempotency in case of concurrent queue wait
      if (idempotencyKey) {
        const concurrentPayment = await tx.payment.findFirst({
          where: { idempotencyKey, shopId, deletedAt: null },
          include: { ticket: true },
        });
        if (concurrentPayment) {
          return this.formatPaymentResponse(concurrentPayment, concurrentPayment.ticket, true);
        }
      }

      // Strict Domain Validation
      if (!["active", "defaulted"].includes(ticket.status)) {
        throw new ValidationError(`Cannot post payment: Ticket is already '${ticket.status}'`);
      }

      const currentLoanAmount = new Prisma.Decimal(ticket.loanAmount);
      if (data.payment_for === "principal" && amountDecimal.greaterThan(currentLoanAmount)) {
        throw new ValidationError(
          `Payment amount of ${data.amount_paid} exceeds the remaining loan balance of ${currentLoanAmount}`
        );
      }

      // Compute Remaining Loan & Status
      let remainingLoan = currentLoanAmount;
      let newStatus = ticket.status;
      let settledDate = ticket.settledDate;

      const reducesPrincipal = ["principal", "waiver", "discount"].includes(data.payment_for.toLowerCase());
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
        settledDate,
      });

      // Post Payment
      const payment = await paymentRepository.createPayment(tx, {
        amountPaid: amountDecimal,
        paymentFor: data.payment_for,
        paymentDate,
        idempotencyKey: idempotencyKey ?? null,
        shop: { connect: { id: shopId } },
        customer: { connect: { id: ticket.customerId } },
        ticket: { connect: { id: ticket.id } },
      });

      // Double-Entry Ledger Posting
      await paymentRepository.createLedgerEntry(tx, {
        type: "credit",
        category: ledgerCategory,
        amount: amountDecimal,
        entryDate: paymentDate,
        description: `Received payment for ${data.payment_for} on ticket ${ticket.ticketNumber}`,
        shop: { connect: { id: shopId } },
        ticket: { connect: { id: ticket.id } },
        payment: { connect: { id: payment.id } },
      });

      // Write Audit Log
      await tx.auditLog.create({
        data: {
          entityName: "Payment",
          entityId: payment.id,
          action: "create",
          newValue: {
            ticketNumber: ticket.ticketNumber,
            amountPaid: payment.amountPaid.toString(),
            paymentFor: payment.paymentFor,
            idempotencyKey: payment.idempotencyKey,
          },
          shop: { connect: { id: shopId } },
          ...(userId ? { user: { connect: { id: userId } } } : {}),
        },
      });

      return this.formatPaymentResponse(payment, updatedTicket, false);
    });
  }
}

export const paymentService = new PaymentService();
export default paymentService;
