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
    const { tickets, totalCount } = await pawnRepository.findAndCount(params);
    const totalPages = Math.ceil(totalCount / params.limit);

    const formatted = tickets.map((t) => ({
      id: t.id,
      customer_id: t.customerId,
      ticket_number: t.ticket_number,
      loan_amount: t.loan_amount.toString(),
      original_loan_amount: t.original_loan_amount.toString(),
      interest_rate: t.interest_rate.toString(),
      adv_amount: t.adv_amount.toString(),
      interestType: t.interestType,
      graceDays: t.graceDays,
      loanDuration: t.loanDuration,
      pawned_date: t.pawned_date.toISOString(),
      maturityDate: t.maturityDate?.toISOString() || null,
      renewalDate: t.renewalDate?.toISOString() || null,
      auctionDate: t.auctionDate?.toISOString() || null,
      status: t.status,
      settled_date: t.settled_date ? t.settled_date.toISOString() : null,
      items: t.items.map((i) => ({
        id: i.id,
        name: i.name,
        type: i.type,
        weight_grams: i.weight_grams.toString(),
        purity: i.purity,
        description: i.description,
        item_photo_url: i.item_photo_url,
      })),
      customer: t.customer
        ? {
            id: t.customer.id,
            full_name: t.customer.full_name,
            phone_number: t.customer.phone_number,
            address: {
              line1: t.customer.address_line1 || "",
              city: t.customer.address_city || "",
              pincode: t.customer.address_pincode || "",
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
    const ticket = await pawnRepository.findById(id);
    if (!ticket) {
      throw new NotFoundError("Pawn ticket not found");
    }

    return {
      id: ticket.id,
      customer_id: ticket.customerId,
      ticket_number: ticket.ticket_number,
      loan_amount: ticket.loan_amount.toString(),
      original_loan_amount: ticket.original_loan_amount.toString(),
      interest_rate: ticket.interest_rate.toString(),
      adv_amount: ticket.adv_amount.toString(),
      interestType: ticket.interestType,
      graceDays: ticket.graceDays,
      loanDuration: ticket.loanDuration,
      pawned_date: ticket.pawned_date.toISOString(),
      maturityDate: ticket.maturityDate?.toISOString() || null,
      renewalDate: ticket.renewalDate?.toISOString() || null,
      auctionDate: ticket.auctionDate?.toISOString() || null,
      status: ticket.status,
      settled_date: ticket.settled_date ? ticket.settled_date.toISOString() : null,
      items: ticket.items.map((i) => ({
        id: i.id,
        name: i.name,
        type: i.type,
        weight_grams: i.weight_grams.toString(),
        purity: i.purity,
        description: i.description,
        item_photo_url: i.item_photo_url,
      })),
      customer: ticket.customer
        ? {
            id: ticket.customer.id,
            full_name: ticket.customer.full_name,
            phone_number: ticket.customer.phone_number,
            address: {
              line1: ticket.customer.address_line1 || "",
              city: ticket.customer.address_city || "",
              pincode: ticket.customer.address_pincode || "",
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
      where: { id: data.customer_id },
    });
    if (!customer) {
      throw new NotFoundError("Customer not found");
    }

    const existing = await pawnRepository.findByTicketNumber(data.ticket_number);
    if (existing) {
      throw new ConflictError(`Ticket number '${data.ticket_number}' is already allocated`);
    }

    const pawned_date = data.pawned_date ? new Date(data.pawned_date) : new Date();
    const duration = data.loanDuration || DEFAULT_LOAN_DURATION_MONTHS;
    const grace = data.graceDays || DEFAULT_GRACE_DAYS;

    const maturityDate = calculateMaturityDate(pawned_date, duration);
    const renewalDate = maturityDate;
    const auctionDate = calculateAuctionDate(maturityDate, grace);

    const loan_amount = new Prisma.Decimal(data.loan_amount);
    const original_loan_amount = loan_amount;
    const interest_rate = new Prisma.Decimal(data.interest_rate);
    const adv_amount = new Prisma.Decimal(data.adv_amount || 0);

    const items = data.items.map((item) => ({
      name: item.name,
      type: item.type || null,
      weight_grams: new Prisma.Decimal(item.weight_grams),
      purity: item.purity || null,
      description: item.description || null,
      item_photo_url: item.item_photo_url || null,
    }));

    return prisma.$transaction(async (tx) => {
      const ticket = await tx.pawnTicket.create({
        data: {
          customerId: data.customer_id,
          ticket_number: data.ticket_number,
          loan_amount,
          original_loan_amount,
          interest_rate,
          adv_amount,
          interestType: data.interestType || "monthly",
          graceDays: grace,
          loanDuration: duration,
          pawned_date,
          maturityDate,
          renewalDate,
          auctionDate,
          status: "active",
          items: {
            create: items,
          },
        } as unknown as Prisma.PawnTicketCreateInput,
      });

      await tx.auditLog.create({
        data: {
          userId,
          entityName: "PawnTicket",
          entityId: ticket.id,
          action: "create",
          newValue: { ticket_number: ticket.ticket_number, loan_amount: ticket.original_loan_amount.toString() },
        } as unknown as Prisma.AuditLogCreateInput,
      });

      return ticket;
    });
  }

  async updateTicket(id: string, data: Record<string, unknown>): Promise<PawnTicket> {
    const shopId = getTenantShopId();
    const userId = getTenantUserId() ?? null;
    if (!shopId) throw new AppError("Tenant context required", 400);

    const ticket = await pawnRepository.findById(id);
    if (!ticket) {
      throw new NotFoundError("Pawn ticket not found");
    }

    const ticketPayload: Prisma.PawnTicketUpdateInput = {};
    const oldValues: Record<string, unknown> = {};
    const newValues: Record<string, unknown> = {};

    if (data.ticket_number !== undefined && data.ticket_number !== ticket.ticket_number) {
      const existing = await pawnRepository.findByTicketNumber(String(data.ticket_number));
      if (existing) {
        throw new ConflictError(`Ticket number '${data.ticket_number}' is already allocated`);
      }
      ticketPayload.ticket_number = String(data.ticket_number);
      oldValues.ticket_number = ticket.ticket_number;
      newValues.ticket_number = data.ticket_number;
    }

    if (data.loan_amount !== undefined) {
      const amt = new Prisma.Decimal(data.loan_amount as number | string);
      ticketPayload.loan_amount = amt;
      ticketPayload.original_loan_amount = amt;
      oldValues.loan_amount = ticket.loan_amount.toString();
      newValues.loan_amount = amt.toString();
    }

    if (data.interest_rate !== undefined) {
      ticketPayload.interest_rate = new Prisma.Decimal(data.interest_rate as number | string);
    }
    if (data.adv_amount !== undefined) {
      ticketPayload.adv_amount = new Prisma.Decimal(data.adv_amount as number | string);
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
      ticketPayload.settled_date = data.status === "settled" ? new Date() : null;
    }

    return prisma.$transaction(async (tx) => {
      const updated = await tx.pawnTicket.update({
        where: { id },
        data: ticketPayload,
      });

      await tx.auditLog.create({
        data: {
          userId,
          entityName: "PawnTicket",
          entityId: id,
          action: "update",
          oldValue: oldValues,
          newValue: newValues,
        } as unknown as Prisma.AuditLogCreateInput,
      });

      return updated;
    });
  }

  async deleteTicket(id: string): Promise<void> {
    const shopId = getTenantShopId();
    const userId = getTenantUserId() ?? null;
    if (!shopId) throw new AppError("Tenant context required", 400);

    const ticket = await pawnRepository.findById(id);
    if (!ticket) {
      throw new NotFoundError("Pawn ticket not found");
    }

    await pawnRepository.delete(id);

    await prisma.auditLog.create({
      data: {
        userId,
        entityName: "PawnTicket",
        entityId: id,
        action: "delete",
        oldValue: { ticket_number: ticket.ticket_number },
      } as unknown as Prisma.AuditLogCreateInput,
    });
  }

  async updateTicketStatus(id: string, status: string): Promise<PawnTicket> {
    const shopId = getTenantShopId();
    const userId = getTenantUserId() ?? null;
    if (!shopId) throw new AppError("Tenant context required", 400);

    const ticket = await pawnRepository.findById(id);
    if (!ticket) {
      throw new NotFoundError("Pawn ticket not found");
    }

    const settled_date = status === "settled" ? new Date() : null;

    return prisma.$transaction(async (tx) => {
      const updated = await tx.pawnTicket.update({
        where: { id },
        data: {
          status,
          settled_date,
        },
      });

      await tx.auditLog.create({
        data: {
          userId,
          entityName: "PawnTicket",
          entityId: id,
          action: "update",
          newValue: { status, settled_date: settled_date?.toISOString() },
        } as unknown as Prisma.AuditLogCreateInput,
      });

      return updated;
    });
  }

  async getTicketStats(id: string) {
    const ticket = await pawnRepository.findById(id);
    if (!ticket) {
      throw new NotFoundError("Pawn ticket not found");
    }

    const payments = await prisma.payment.findMany({
      where: { ticketId: id }
    });

    const totalPaid = payments.reduce((acc, p) => acc.plus(p.amount_paid), new Prisma.Decimal(0));
    const interestPaid = payments
      .filter((p) => p.payment_for === "interest" || p.payment_for === "penalty" || p.payment_for === "fine")
      .reduce((acc, p) => acc.plus(p.amount_paid), new Prisma.Decimal(0));
    const principalPaid = payments
      .filter((p) => p.payment_for === "principal")
      .reduce((acc, p) => acc.plus(p.amount_paid), new Prisma.Decimal(0));

    const remainingBalance = ticket.loan_amount.minus(principalPaid);

    return {
      ticket_number: ticket.ticket_number,
      loan_amount: ticket.loan_amount.toString(),
      original_loan_amount: ticket.original_loan_amount.toString(),
      total_paid: totalPaid.toString(),
      interest_paid: interestPaid.toString(),
      principal_paid: principalPaid.toString(),
      remaining_balance: remainingBalance.toString(),
      payments_count: payments.length,
      status: ticket.status
    };
  }
}

export const pawnService = new PawnService();
export default pawnService;
