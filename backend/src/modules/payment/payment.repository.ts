import { Payment, PawnTicket, LedgerEntry, Prisma } from '@prisma/client';
import { prisma, executeTenantRawQuery } from '../../config/database';
import { getTenantShopId } from '../../common/context/tenant.context';

export type TransactionClient = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

export class PaymentRepository {
  async findByTicketId(ticketId: string, shopId?: string): Promise<Payment[]> {
    const effectiveShopId = shopId || getTenantShopId();
    return prisma.payment.findMany({
      where: {
        ticketId,
        ...(effectiveShopId ? { shopId: effectiveShopId } : {}),
        deletedAt: null
      },
      orderBy: { paymentDate: 'desc' }
    });
  }

  async findById(id: string, shopId?: string): Promise<Payment | null> {
    const effectiveShopId = shopId || getTenantShopId();
    return prisma.payment.findFirst({
      where: {
        id,
        ...(effectiveShopId ? { shopId: effectiveShopId } : {}),
        deletedAt: null
      }
    });
  }

  async findByIdempotencyKey(
    idempotencyKey: string,
    shopId?: string
  ): Promise<(Payment & { ticket?: PawnTicket | null }) | null> {
    const effectiveShopId = shopId || getTenantShopId();
    return prisma.payment.findFirst({
      where: {
        idempotencyKey,
        ...(effectiveShopId ? { shopId: effectiveShopId } : {}),
        deletedAt: null
      },
      include: {
        ticket: true
      }
    });
  }

  async lockTicket(
    tx: TransactionClient,
    ticketId: string
  ): Promise<PawnTicket | null> {
    return executeTenantRawQuery(async (shopId) => {
      const rows = await tx.$queryRaw<PawnTicket[]>`
        SELECT * FROM "PawnTicket"
        WHERE "id" = ${ticketId}::uuid
          AND "shopId" = ${shopId}::uuid
          AND "deletedAt" IS NULL
        FOR UPDATE
      `;
      return rows[0] || null;
    });
  }

  async updateTicket(
    tx: TransactionClient,
    id: string,
    data: Prisma.PawnTicketUpdateInput
  ): Promise<PawnTicket> {
    return tx.pawnTicket.update({
      where: { id },
      data
    });
  }

  async createPayment(
    tx: TransactionClient,
    data: Prisma.PaymentCreateInput
  ): Promise<Payment> {
    return tx.payment.create({
      data
    });
  }

  async createLedgerEntry(
    tx: TransactionClient,
    data: Prisma.LedgerEntryCreateInput
  ): Promise<LedgerEntry> {
    return tx.ledgerEntry.create({
      data
    });
  }
}

export const paymentRepository = new PaymentRepository();
export default paymentRepository;
