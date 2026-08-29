import { PawnTicket, PawnItem, Customer, Prisma } from '@prisma/client';
import { prisma } from '../../config/database';
import { getTenantShopId } from '../../common/context/tenant.context';

export class PawnRepository {
  async findAndCount(params: {
    page: number;
    limit: number;
    status?: string;
    search?: string;
    customerId?: string;
    shopId?: string;
  }): Promise<{ tickets: (PawnTicket & { customer: Customer; items: PawnItem[] })[]; totalCount: number }> {
    const { page, limit, status, search, customerId } = params;
    const shopId = params.shopId || getTenantShopId();
    const skip = (page - 1) * limit;

    const whereClause: Prisma.PawnTicketWhereInput = {
      ...(shopId ? { shopId } : {}),
      deletedAt: null
    };

    if (status) {
      whereClause.status = status;
    }

    if (customerId) {
      whereClause.customerId = customerId;
    }

    if (search) {
      whereClause.AND = [
        {
          OR: [
            { ticketNumber: { contains: search, mode: 'insensitive' } },
            { customer: { fullName: { contains: search, mode: 'insensitive' } } },
            { customer: { phoneNumber: { contains: search } } }
          ]
        }
      ];
    }

    const [tickets, totalCount] = await Promise.all([
      prisma.pawnTicket.findMany({
        where: whereClause,
        include: {
          customer: true,
          items: {
            where: { deletedAt: null }
          }
        },
        orderBy: { pawnedDate: 'desc' },
        skip,
        take: limit
      }),
      prisma.pawnTicket.count({
        where: whereClause
      })
    ]);

    return { tickets, totalCount };
  }

  async findById(id: string, shopId?: string): Promise<(PawnTicket & { customer: Customer; items: PawnItem[] }) | null> {
    const effectiveShopId = shopId || getTenantShopId();
    return prisma.pawnTicket.findFirst({
      where: {
        id,
        ...(effectiveShopId ? { shopId: effectiveShopId } : {}),
        deletedAt: null
      },
      include: {
        customer: true,
        items: {
          where: { deletedAt: null }
        }
      }
    });
  }

  async findByTicketNumber(ticketNumber: string, shopId?: string): Promise<PawnTicket | null> {
    const effectiveShopId = shopId || getTenantShopId();
    return prisma.pawnTicket.findFirst({
      where: {
        ticketNumber,
        ...(effectiveShopId ? { shopId: effectiveShopId } : {}),
        deletedAt: null
      }
    });
  }

  async create(data: {
    shopId: string;
    customerId: string;
    ticketNumber: string;
    loanAmount: Prisma.Decimal;
    originalLoanAmount: Prisma.Decimal;
    interestRate: Prisma.Decimal;
    advAmount: Prisma.Decimal;
    interestType: string;
    graceDays: number;
    loanDuration: number;
    pawnedDate: Date;
    maturityDate: Date;
    renewalDate: Date;
    auctionDate: Date;
    status: string;
    items: {
      name: string;
      type?: string;
      weightGrams: Prisma.Decimal;
      purity?: string;
      description?: string;
      itemPhotoUrl?: string;
    }[];
  }): Promise<PawnTicket> {
    return prisma.$transaction(async (tx) => {
      const ticket = await tx.pawnTicket.create({
        data: {
          shop: { connect: { id: data.shopId } },
          customer: { connect: { id: data.customerId } },
          ticketNumber: data.ticketNumber,
          loanAmount: data.loanAmount,
          originalLoanAmount: data.originalLoanAmount,
          interestRate: data.interestRate,
          advAmount: data.advAmount,
          interestType: data.interestType,
          graceDays: data.graceDays,
          loanDuration: data.loanDuration,
          pawnedDate: data.pawnedDate,
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
            weightGrams: item.weightGrams,
            purity: item.purity || null,
            description: item.description || null,
            itemPhotoUrl: item.itemPhotoUrl || null
          }))
        });
      }

      await tx.ledgerEntry.create({
        data: {
          shop: { connect: { id: data.shopId } },
          ticket: { connect: { id: ticket.id } },
          type: 'debit',
          category: 'principal_disbursed',
          amount: data.originalLoanAmount,
          entryDate: data.pawnedDate,
          description: `Disbursed pawn loan for ticket ${data.ticketNumber}`
        }
      });

      return ticket;
    });
  }

  async update(
    id: string,
    ticketData: Prisma.PawnTicketUpdateInput,
    itemsData?: {
      name: string;
      type?: string;
      weightGrams: Prisma.Decimal;
      purity?: string;
      description?: string;
      itemPhotoUrl?: string;
    }[],
    shopId?: string
  ): Promise<PawnTicket> {
    const effectiveShopId = shopId || getTenantShopId();
    if (effectiveShopId) {
      const existing = await prisma.pawnTicket.findFirst({
        where: { id, shopId: effectiveShopId, deletedAt: null }
      });
      if (!existing) {
        throw new Error('Pawn ticket not found or access denied');
      }
    }

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
            weightGrams: item.weightGrams,
            purity: item.purity || null,
            description: item.description || null,
            itemPhotoUrl: item.itemPhotoUrl || null
          }))
        });
      }

      return ticket;
    });
  }

  async delete(id: string, shopId?: string): Promise<PawnTicket> {
    const effectiveShopId = shopId || getTenantShopId();
    if (effectiveShopId) {
      const existing = await prisma.pawnTicket.findFirst({
        where: { id, shopId: effectiveShopId, deletedAt: null }
      });
      if (!existing) {
        throw new Error('Pawn ticket not found or access denied');
      }
    }

    return prisma.pawnTicket.update({
      where: { id },
      data: {
        deletedAt: new Date()
      }
    });
  }
}

export const pawnRepository = new PawnRepository();
export default pawnRepository;
