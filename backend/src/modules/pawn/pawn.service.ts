import { Prisma, PawnTicket } from '@prisma/client';
import dayjs from 'dayjs';
import { pawnRepository } from './pawn.repository';
import { prisma } from '../../config/database';
import { getTenantShopId, getTenantUserId } from '../../common/context/tenant.context';
import { NotFoundError, ConflictError, AppError } from '../../common/errors/AppError';

export class PawnService {
  async listTickets(params: { page: number; limit: number; status?: string; search?: string }) {
    const { tickets, totalCount } = await pawnRepository.findAndCount(params);
    const totalPages = Math.ceil(totalCount / params.limit);

    // Format response values for frontend consistency
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
        item_photo_url: i.item_photo_url
      })),
      customer: t.customer
        ? {
            id: t.customer.id,
            full_name: t.customer.full_name,
            phone_number: t.customer.phone_number,
            address: {
              line1: t.customer.address_line1 || '',
              city: t.customer.address_city || '',
              pincode: t.customer.address_pincode || ''
            }
          }
        : null
    }));

    return {
      tickets: formatted,
      totalPawnTickets: totalCount,
      totalPages,
      currentPage: params.page
    };
  }

  async getTicketById(id: string) {
    const ticket = await pawnRepository.findById(id);
    if (!ticket) {
      throw new NotFoundError('Pawn ticket not found');
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
        item_photo_url: i.item_photo_url
      })),
      customer: ticket.customer
        ? {
            id: ticket.customer.id,
            full_name: ticket.customer.full_name,
            phone_number: ticket.customer.phone_number,
            address: {
              line1: ticket.customer.address_line1 || '',
              city: ticket.customer.address_city || '',
              pincode: ticket.customer.address_pincode || ''
            }
          }
        : null
    };
  }

  async createTicket(data: any): Promise<PawnTicket> {
    const shopId = getTenantShopId();
    const userId = getTenantUserId() ?? null;
    if (!shopId) throw new AppError('Tenant context required', 400);

    // 1. Verify customer exists
    const customer = await prisma.customer.findFirst({
      where: { id: data.customer_id, shopId }
    });
    if (!customer) {
      throw new NotFoundError('Customer not found');
    }

    // 2. Validate ticket number uniqueness inside shop
    const existing = await pawnRepository.findByTicketNumber(data.ticket_number);
    if (existing) {
      throw new ConflictError(`Ticket number '${data.ticket_number}' is already allocated`);
    }

    // 3. Compute date schedules
    const pawned_date = data.pawned_date ? new Date(data.pawned_date) : new Date();
    const duration = data.loanDuration || 12;
    const grace = data.graceDays || 7;

    const maturityDate = dayjs(pawned_date).add(duration, 'month').toDate();
    const renewalDate = maturityDate;
    const auctionDate = dayjs(maturityDate).add(grace, 'day').toDate();

    // 4. Convert money inputs to Prisma Decimal
    const loan_amount = new Prisma.Decimal(data.loan_amount);
    const original_loan_amount = loan_amount;
    const interest_rate = new Prisma.Decimal(data.interest_rate);
    const adv_amount = new Prisma.Decimal(data.adv_amount || 0);

    // 5. Construct items
    const items = data.items.map((item: any) => ({
      name: item.name,
      type: item.type || null,
      weight_grams: new Prisma.Decimal(item.weight_grams),
      purity: item.purity || null,
      description: item.description || null,
      item_photo_url: item.item_photo_url || null
    }));

    // 6. Save
    const ticket = await pawnRepository.create({
      shopId,
      customerId: data.customer_id,
      ticket_number: data.ticket_number,
      loan_amount,
      original_loan_amount,
      interest_rate,
      adv_amount,
      interestType: data.interestType || 'monthly',
      graceDays: grace,
      loanDuration: duration,
      pawned_date,
      maturityDate,
      renewalDate,
      auctionDate,
      status: 'active',
      items
    });

    // 7. Audit
    await prisma.auditLog.create({
      data: {
        shopId,
        userId,
        entityName: 'PawnTicket',
        entityId: ticket.id,
        action: 'create',
        newValue: { ticket_number: ticket.ticket_number, loan_amount: ticket.original_loan_amount.toString() }
      }
    });

    return ticket;
  }

  async updateTicket(id: string, data: any): Promise<PawnTicket> {
    const shopId = getTenantShopId();
    const userId = getTenantUserId() ?? null;
    if (!shopId) throw new AppError('Tenant context required', 400);

    const ticket = await pawnRepository.findById(id);
    if (!ticket) {
      throw new NotFoundError('Pawn ticket not found');
    }

    const ticketPayload: Partial<PawnTicket> = {};
    const oldValues: any = {};
    const newValues: any = {};

    if (data.ticket_number !== undefined && data.ticket_number !== ticket.ticket_number) {
      const existing = await pawnRepository.findByTicketNumber(data.ticket_number);
      if (existing) {
        throw new ConflictError(`Ticket number '${data.ticket_number}' is already allocated`);
      }
      ticketPayload.ticket_number = data.ticket_number;
      oldValues.ticket_number = ticket.ticket_number;
      newValues.ticket_number = data.ticket_number;
    }

    if (data.loan_amount !== undefined) {
      const amt = new Prisma.Decimal(data.loan_amount);
      ticketPayload.loan_amount = amt;
      ticketPayload.original_loan_amount = amt;
      oldValues.loan_amount = ticket.loan_amount.toString();
      newValues.loan_amount = amt.toString();
    }

    if (data.interest_rate !== undefined) {
      ticketPayload.interest_rate = new Prisma.Decimal(data.interest_rate);
    }
    if (data.adv_amount !== undefined) {
      ticketPayload.adv_amount = new Prisma.Decimal(data.adv_amount);
    }
    if (data.interestType !== undefined) {
      ticketPayload.interestType = data.interestType;
    }
    if (data.graceDays !== undefined) {
      ticketPayload.graceDays = data.graceDays;
    }
    if (data.loanDuration !== undefined) {
      ticketPayload.loanDuration = data.loanDuration;
    }
    if (data.status !== undefined) {
      ticketPayload.status = data.status;
      ticketPayload.settled_date = data.status === 'settled' ? new Date() : null;
    }

    // Convert items if updated
    let items: any[] | undefined = undefined;
    if (data.items) {
      items = data.items.map((item: any) => ({
        name: item.name,
        type: item.type || null,
        weight_grams: new Prisma.Decimal(item.weight_grams),
        purity: item.purity || null,
        description: item.description || null,
        item_photo_url: item.item_photo_url || null
      }));
    }

    const updated = await pawnRepository.update(id, ticketPayload, items);

    await prisma.auditLog.create({
      data: {
        shopId,
        userId,
        entityName: 'PawnTicket',
        entityId: id,
        action: 'update',
        oldValue: oldValues,
        newValue: newValues
      }
    });

    return updated;
  }

  async deleteTicket(id: string): Promise<void> {
    const shopId = getTenantShopId();
    const userId = getTenantUserId() ?? null;
    if (!shopId) throw new AppError('Tenant context required', 400);

    const ticket = await pawnRepository.findById(id);
    if (!ticket) {
      throw new NotFoundError('Pawn ticket not found');
    }

    await pawnRepository.delete(id);

    await prisma.auditLog.create({
      data: {
        shopId,
        userId,
        entityName: 'PawnTicket',
        entityId: id,
        action: 'delete',
        oldValue: { ticket_number: ticket.ticket_number }
      }
    });
  }

  async updateTicketStatus(id: string, status: string): Promise<PawnTicket> {
    const shopId = getTenantShopId();
    const userId = getTenantUserId() ?? null;
    if (!shopId) throw new AppError('Tenant context required', 400);

    const ticket = await pawnRepository.findById(id);
    if (!ticket) {
      throw new NotFoundError('Pawn ticket not found');
    }

    const settled_date = status === 'settled' ? new Date() : null;

    const updated = await prisma.pawnTicket.update({
      where: { id },
      data: {
        status,
        settled_date
      }
    });

    await prisma.auditLog.create({
      data: {
        shopId,
        userId,
        entityName: 'PawnTicket',
        entityId: id,
        action: 'update',
        newValue: { status, settled_date: settled_date?.toISOString() }
      }
    });

    return updated;
  }
}

export const pawnService = new PawnService();
export default pawnService;
