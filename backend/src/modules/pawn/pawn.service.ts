import { Prisma, PawnTicket } from "@prisma/client";
import { pawnRepository } from "./pawn.repository";
import { prisma } from "../../config/database";
import { getTenantShopId, getTenantUserId } from "../../common/context/tenant.context";
import { NotFoundError, ConflictError, AppError } from "../../common/errors/AppError";
import {
  DEFAULT_GRACE_DAYS,
  DEFAULT_LOAN_DURATION_MONTHS,
  calculateMaturityDate,
  calculateAuctionDate,
} from "./pawn.policy";

export class PawnService {
  async listTickets(params: { page: number; limit: number; status?: string; search?: string; customerId?: string }) {
    const shopId = getTenantShopId();
    if (!shopId) throw new AppError("Tenant context required", 400);

    const { tickets, totalCount } = await pawnRepository.findAndCount({ ...params, shopId });
    const totalPages = Math.ceil(totalCount / params.limit);

    const formatted = tickets.map((t) => ({
      id: t.id,
      customer_id: t.customerId,
      ticket_number: t.ticketNumber,
      loan_amount: t.loanAmount.toString(),
      original_loan_amount: t.originalLoanAmount.toString(),
      interest_rate: t.interestRate.toString(),
      adv_amount: t.advAmount.toString(),
      interestType: t.interestType,
      graceDays: t.graceDays,
      loanDuration: t.loanDuration,
      pawned_date: t.pawnedDate.toISOString(),
      maturityDate: t.maturityDate?.toISOString() || null,
      renewalDate: t.renewalDate?.toISOString() || null,
      auctionDate: t.auctionDate?.toISOString() || null,
      status: t.status,
      settled_date: t.settledDate ? t.settledDate.toISOString() : null,
      items: t.items.map((i) => ({
        id: i.id,
        name: i.name,
        type: i.type,
        weight_grams: i.weightGrams.toString(),
        purity: i.purity,
        description: i.description,
        item_photo_url: i.itemPhotoUrl,
      })),
      customer: t.customer
        ? {
            id: t.customer.id,
            full_name: t.customer.fullName,
            phone_number: t.customer.phoneNumber,
            address: {
              line1: t.customer.addressLine1 || "",
              city: t.customer.addressCity || "",
              pincode: t.customer.addressPincode || "",
            },
          }
        : null,
    }));

    return {
      tickets: formatted,
      totalPawnTickets: totalCount,
      totalPages,
      currentPage: params.page,
    };
  }

  async getTicketById(id: string) {
    const shopId = getTenantShopId();
    if (!shopId) throw new AppError("Tenant context required", 400);

    const ticket = await pawnRepository.findById(id, shopId);
    if (!ticket) {
      throw new NotFoundError("Pawn ticket not found");
    }

    return {
      id: ticket.id,
      customer_id: ticket.customerId,
      ticket_number: ticket.ticketNumber,
      loan_amount: ticket.loanAmount.toString(),
      original_loan_amount: ticket.originalLoanAmount.toString(),
      interest_rate: ticket.interestRate.toString(),
      adv_amount: ticket.advAmount.toString(),
      interestType: ticket.interestType,
      graceDays: ticket.graceDays,
      loanDuration: ticket.loanDuration,
      pawned_date: ticket.pawnedDate.toISOString(),
      maturityDate: ticket.maturityDate?.toISOString() || null,
      renewalDate: ticket.renewalDate?.toISOString() || null,
      auctionDate: ticket.auctionDate?.toISOString() || null,
      status: ticket.status,
      settled_date: ticket.settledDate ? ticket.settledDate.toISOString() : null,
      items: ticket.items.map((i) => ({
        id: i.id,
        name: i.name,
        type: i.type,
        weight_grams: i.weightGrams.toString(),
        purity: i.purity,
        description: i.description,
        item_photo_url: i.itemPhotoUrl,
      })),
      customer: ticket.customer
        ? {
            id: ticket.customer.id,
            full_name: ticket.customer.fullName,
            phone_number: ticket.customer.phoneNumber,
            address: {
              line1: ticket.customer.addressLine1 || "",
              city: ticket.customer.addressCity || "",
              pincode: ticket.customer.addressPincode || "",
            },
          }
        : null,
    };
  }

  async createTicket(data: {
    customer_id: string;
    ticket_number: string;
    loan_amount: number | string;
    interest_rate: number | string;
    adv_amount?: number | string;
    interestType?: string;
    graceDays?: number;
    loanDuration?: number;
    pawned_date?: string | Date;
    items: Array<{
      name: string;
      type?: string;
      weight_grams: number | string;
      purity?: string;
      description?: string;
      item_photo_url?: string;
    }>;
  }): Promise<PawnTicket> {
    const shopId = getTenantShopId();
    const userId = getTenantUserId() ?? null;
    if (!shopId) throw new AppError("Tenant context required", 400);

    const customer = await prisma.customer.findFirst({
      where: { id: data.customer_id, shopId, deletedAt: null },
    });
    if (!customer) {
      throw new NotFoundError("Customer not found in your shop");
    }

    const existing = await pawnRepository.findByTicketNumber(data.ticket_number, shopId);
    if (existing) {
      throw new ConflictError(`Ticket number '${data.ticket_number}' is already allocated in your shop`);
    }

    const pawnedDate = data.pawned_date ? new Date(data.pawned_date) : new Date();
    const duration = data.loanDuration || DEFAULT_LOAN_DURATION_MONTHS;
    const grace = data.graceDays || DEFAULT_GRACE_DAYS;

    const maturityDate = calculateMaturityDate(pawnedDate, duration);
    const renewalDate = maturityDate;
    const auctionDate = calculateAuctionDate(maturityDate, grace);

    const loanAmount = new Prisma.Decimal(data.loan_amount);
    const originalLoanAmount = loanAmount;
    const interestRate = new Prisma.Decimal(data.interest_rate);
    const advAmount = new Prisma.Decimal(data.adv_amount || 0);

    const items = data.items.map((item) => ({
      name: item.name,
      type: item.type || null,
      weightGrams: new Prisma.Decimal(item.weight_grams),
      purity: item.purity || null,
      description: item.description || null,
      itemPhotoUrl: item.item_photo_url || null,  
    }));

    return prisma.$transaction(async (tx) => {
      const ticketData: Prisma.PawnTicketCreateInput = {
        ticketNumber: data.ticket_number,
        loanAmount,
        originalLoanAmount,
        interestRate,
        advAmount,
        interestType: data.interestType || "monthly",
        graceDays: grace,
        loanDuration: duration,
        pawnedDate,
        maturityDate,
        renewalDate,
        auctionDate,
        status: "active",
        shop: {
          connect: { id: shopId }
        },
        customer: {
          connect: { id: data.customer_id }
        },
        items: {
          create: items,
        },
      };

      const ticket = await tx.pawnTicket.create({
        data: ticketData,
      });

      // Automated double-entry ledger record for disbursed loan
      await tx.ledgerEntry.create({
        data: {
          shop: { connect: { id: shopId } },
          ticket: { connect: { id: ticket.id } },
          type: "debit",
          category: "principal_disbursed",
          amount: originalLoanAmount,
          entryDate: pawnedDate,
          description: `Disbursed pawn loan for ticket ${ticket.ticketNumber}`,
        }
      });

      const auditData: Prisma.AuditLogCreateInput = {
        entityName: "PawnTicket",
        entityId: ticket.id,
        action: "create",
        newValue: { ticket_number: ticket.ticketNumber, loan_amount: ticket.originalLoanAmount.toString() },
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

      return ticket;
    });
  }

  async updateTicket(id: string, data: Record<string, unknown>): Promise<PawnTicket> {
    const shopId = getTenantShopId();
    const userId = getTenantUserId() ?? null;
    if (!shopId) throw new AppError("Tenant context required", 400);

    const ticket = await pawnRepository.findById(id, shopId);
    if (!ticket) {
      throw new NotFoundError("Pawn ticket not found");
    }

    const ticketPayload: Prisma.PawnTicketUpdateInput = {};
    const oldValues: Record<string, unknown> = {};
    const newValues: Record<string, unknown> = {};

    if (data.ticket_number !== undefined && data.ticket_number !== ticket.ticketNumber) {
      const existing = await pawnRepository.findByTicketNumber(String(data.ticket_number), shopId);
      if (existing) {
        throw new ConflictError(`Ticket number '${data.ticket_number}' is already allocated`);
      }
      ticketPayload.ticketNumber = String(data.ticket_number);
      oldValues.ticket_number = ticket.ticketNumber;
      newValues.ticket_number = data.ticket_number;
    }

    if (data.loan_amount !== undefined) {
      const amt = new Prisma.Decimal(data.loan_amount as number | string);
      ticketPayload.loanAmount = amt;
      ticketPayload.originalLoanAmount = amt;
      oldValues.loan_amount = ticket.loanAmount.toString();
      newValues.loan_amount = amt.toString();
    }

    if (data.interest_rate !== undefined) {
      ticketPayload.interestRate = new Prisma.Decimal(data.interest_rate as number | string);
    }
    if (data.adv_amount !== undefined) {
      ticketPayload.advAmount = new Prisma.Decimal(data.adv_amount as number | string);
    }
    if (data.interestType !== undefined) {
      ticketPayload.interestType = String(data.interestType);
    }
    if (data.graceDays !== undefined) {
      ticketPayload.graceDays = Number(data.graceDays);
    }
    if (data.loanDuration !== undefined) {
      ticketPayload.loanDuration = Number(data.loanDuration);
    }
    if (data.status !== undefined) {
      ticketPayload.status = String(data.status);
      ticketPayload.settledDate = data.status === "settled" ? new Date() : null;
    }

    return prisma.$transaction(async (tx) => {
      const updated = await tx.pawnTicket.update({
        where: { id },
        data: ticketPayload,
      });

      const auditData: Prisma.AuditLogCreateInput = {
        entityName: "PawnTicket",
        entityId: id,
        action: "update",
        oldValue: oldValues as Prisma.InputJsonValue,
        newValue: newValues as Prisma.InputJsonValue,
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

      return updated;
    });
  }

  async deleteTicket(id: string): Promise<void> {
    const shopId = getTenantShopId();
    const userId = getTenantUserId() ?? null;
    if (!shopId) throw new AppError("Tenant context required", 400);

    const ticket = await pawnRepository.findById(id, shopId);
    if (!ticket) {
      throw new NotFoundError("Pawn ticket not found");
    }

    await pawnRepository.delete(id, shopId);

    const auditData: Prisma.AuditLogCreateInput = {
      entityName: "PawnTicket",
      entityId: id,
      action: "delete",
      oldValue: { ticket_number: ticket.ticketNumber },
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

    await prisma.auditLog.create({
      data: auditData,
    });
  }

  async updateTicketStatus(id: string, status: string): Promise<PawnTicket> {
    const shopId = getTenantShopId();
    const userId = getTenantUserId() ?? null;
    if (!shopId) throw new AppError("Tenant context required", 400);

    const ticket = await pawnRepository.findById(id, shopId);
    if (!ticket) {
      throw new NotFoundError("Pawn ticket not found");
    }

    const settledDate = status === "settled" ? new Date() : null;

    return prisma.$transaction(async (tx) => {
      const updated = await tx.pawnTicket.update({
        where: { id },
        data: {
          status,
          settledDate,
        },
      });

      const auditData: Prisma.AuditLogCreateInput = {
        entityName: "PawnTicket",
        entityId: id,
        action: "update",
        newValue: { status, settled_date: settledDate?.toISOString() },
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

      return updated;
    });
  }

  async getTicketStats(id: string) {
    const shopId = getTenantShopId();
    if (!shopId) throw new AppError("Tenant context required", 400);

    const ticket = await pawnRepository.findById(id, shopId);
    if (!ticket) {
      throw new NotFoundError("Pawn ticket not found");
    }

    const [paymentsCount, paymentGroups] = await Promise.all([
      prisma.payment.count({
        where: { ticketId: id, shopId, deletedAt: null }
      }),
      prisma.payment.groupBy({
        by: ['paymentFor'],
        where: { ticketId: id, shopId, deletedAt: null },
        _sum: { amountPaid: true }
      })
    ]);

    let totalPaid = new Prisma.Decimal(0);
    let interestPaid = new Prisma.Decimal(0);
    let principalPaid = new Prisma.Decimal(0);

    for (const group of paymentGroups) {
      const sum = group._sum.amountPaid ?? new Prisma.Decimal(0);
      totalPaid = totalPaid.plus(sum);
      const pf = (group.paymentFor || '').toLowerCase();
      if (pf === 'interest' || pf === 'penalty' || pf === 'fine') {
        interestPaid = interestPaid.plus(sum);
      } else if (pf === 'principal') {
        principalPaid = principalPaid.plus(sum);
      }
    }

    const remainingBalance = ticket.loanAmount.minus(principalPaid);

    return {
      ticket_number: ticket.ticketNumber,
      loan_amount: ticket.loanAmount.toString(),
      original_loan_amount: ticket.originalLoanAmount.toString(),
      total_paid: totalPaid.toString(),
      interest_paid: interestPaid.toString(),
      principal_paid: principalPaid.toString(),
      remaining_balance: remainingBalance.toString(),
      payments_count: paymentsCount,
      status: ticket.status
    };
  }
}

export const pawnService = new PawnService();
export default pawnService;
