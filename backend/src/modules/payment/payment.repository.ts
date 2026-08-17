import { Payment, PawnTicket, LedgerEntry, Prisma } from '@prisma/client';
import { prisma, executeTenantRawQuery } from '../../config/database';

export type TransactionClient = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

export class PaymentRepository {
  async findByTicketId(ticketId: string): Promise<Payment[]> {
    return prisma.payment.findMany({
      where: { ticketId },
      orderBy: { paymentDate: 'desc' }
    });
  }

  async findById(id: string): Promise<Payment | null> {
    return prisma.payment.findUnique({
      where: { id }
    });
  }

  async findByIdempotencyKey(
    idempotencyKey: string
  ): Promise<(Payment & { ticket?: PawnTicket | null }) | null> {
    return prisma.payment.findUnique({
      where: { idempotencyKey },
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
