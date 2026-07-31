import { PawnTicket, PawnItem, Customer, Prisma } from '@prisma/client';
import { prisma } from '../../config/database';

export class PawnRepository {
  async findAndCount(params: {
    page: number;
    limit: number;
    status?: string;
    search?: string;
    customerId?: string;
  }): Promise<{ tickets: (PawnTicket & { customer: Customer; items: PawnItem[] })[]; totalCount: number }> {
    const { page, limit, status, search, customerId } = params;
    const skip = (page - 1) * limit;

    const whereClause: Prisma.PawnTicketWhereInput = {};

    if (status) {
      whereClause.status = status;
    }

    if (customerId) {
      whereClause.customerId = customerId;
    }

    if (search) {
      whereClause.OR = [
        { ticket_number: { contains: search, mode: 'insensitive' } },
        { customer: { full_name: { contains: search, mode: 'insensitive' } } },
        { customer: { phone_number: { contains: search } } }
      ];
    }

    const [tickets, totalCount] = await Promise.all([
      prisma.pawnTicket.findMany({
        where: whereClause,
        include: {
          customer: true,
          items: true
        },
        orderBy: { pawned_date: 'desc' },
        skip,
        take: limit
      }),
      prisma.pawnTicket.count({
        where: whereClause
      })
    ]);

    return { tickets: tickets as any, totalCount };
  }

  async findById(id: string): Promise<(PawnTicket & { customer: Customer; items: PawnItem[] }) | null> {
    return prisma.pawnTicket.findFirst({
      where: { id },
      include: {
        customer: true,
        items: true
      }
    }) as any;
  }

  async findByTicketNumber(ticketNumber: string): Promise<PawnTicket | null> {
    return prisma.pawnTicket.findFirst({
      where: { ticket_number: ticketNumber }
    });
  }

  async create(data: {
    shopId: string;
    customerId: string;
    ticket_number: string;
    loan_amount: Prisma.Decimal;
    original_loan_amount: Prisma.Decimal;
    interest_rate: Prisma.Decimal;
    adv_amount: Prisma.Decimal;
    interestType: string;
    graceDays: number;
    loanDuration: number;
    pawned_date: Date;
    maturityDate: Date;
    renewalDate: Date;
    auctionDate: Date;
    status: string;
    items: {
      name: string;
      type?: string;
      weight_grams: Prisma.Decimal;
      purity?: string;
      description?: string;
      item_photo_url?: string;
    }[];
  }): Promise<PawnTicket> {
    return prisma.$transaction(async (tx) => {
      const ticket = await tx.pawnTicket.create({
        data: {
          shopId: data.shopId,
          customerId: data.customerId,
          ticket_number: data.ticket_number,
          loan_amount: data.loan_amount,
          original_loan_amount: data.original_loan_amount,
          interest_rate: data.interest_rate,
          adv_amount: data.adv_amount,
          interestType: data.interestType,
          graceDays: data.graceDays,
          loanDuration: data.loanDuration,
          pawned_date: data.pawned_date,
          maturityDate: data.maturityDate,
          renewalDate: data.renewalDate,
          auctionDate: data.auctionDate,
          status: data.status
        }
      });

      if (data.items.length > 0) {
        await tx.pawnItem.createMany({
          data: data.items.map((item) => ({
            ticketId: ticket.id,
            name: item.name,
            type: item.type || null,
            weight_grams: item.weight_grams,
            purity: item.purity || null,
            description: item.description || null,
            item_photo_url: item.item_photo_url || null
          }))
        });
      }

      await tx.ledgerEntry.create({
        data: {
          shopId: data.shopId,
          ticketId: ticket.id,
          type: 'debit',
          category: 'principal_disbursed',
          amount: data.original_loan_amount,
          entryDate: data.pawned_date,
          description: `Disbursed pawn loan for ticket ${data.ticket_number}`
        }
      });

      return ticket;
    });
  }

  async update(
    id: string,
    ticketData: Partial<PawnTicket>,
    itemsData?: {
      name: string;
      type?: string;
      weight_grams: Prisma.Decimal;
      purity?: string;
      description?: string;
      item_photo_url?: string;
    }[]
  ): Promise<PawnTicket> {
    return prisma.$transaction(async (tx) => {
      const ticket = await tx.pawnTicket.update({
        where: { id },
        data: ticketData
      });

      if (itemsData) {
        await tx.pawnItem.deleteMany({
          where: { ticketId: id }
        });

        await tx.pawnItem.createMany({
          data: itemsData.map((item) => ({
            ticketId: id,
            name: item.name,
            type: item.type || null,
            weight_grams: item.weight_grams,
            purity: item.purity || null,
            description: item.description || null,
            item_photo_url: item.item_photo_url || null
          }))
        });
      }

      return ticket;
    });
  }

  async delete(id: string): Promise<PawnTicket> {
    return prisma.pawnTicket.delete({
      where: { id }
    });
  }
}

export const pawnRepository = new PawnRepository();
export default pawnRepository;
