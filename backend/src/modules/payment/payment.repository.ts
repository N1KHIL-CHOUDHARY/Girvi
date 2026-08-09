import { Payment, PawnTicket, LedgerEntry, Prisma } from '@prisma/client';
import { prisma } from '../../config/database';

export type TransactionClient = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

export class PaymentRepository {
  async findByTicketId(ticketId: string): Promise<Payment[]> {
    return prisma.payment.findMany({
      where: { ticketId },
      orderBy: { payment_date: 'desc' }
    });
  }

  async findById(id: string): Promise<Payment | null> {
    return prisma.payment.findFirst({
      where: { id }
    });
  }

  async findByIdempotencyKey(
    idempotencyKey: string,
    shopId?: string
  ): Promise<(Payment & { ticket?: PawnTicket | null }) | null> {
    return prisma.payment.findFirst({
      where: {
        idempotencyKey,
        ...(shopId ? { shopId } : {})
      },
      include: {
        ticket: true
      }
    });
  }

  async lockTicket(
    tx: TransactionClient,
    ticketId: string,
    shopId?: string
  ): Promise<PawnTicket | null> {
    const rows: PawnTicket[] = shopId
      ? await tx.$queryRaw<PawnTicket[]>(
          Prisma.sql`SELECT * FROM "PawnTicket" WHERE id = ${ticketId}::uuid AND "shopId" = ${shopId}::uuid AND "deletedAt" IS NULL FOR UPDATE`
        )
      : await tx.$queryRaw<PawnTicket[]>(
          Prisma.sql`SELECT * FROM "PawnTicket" WHERE id = ${ticketId}::uuid AND "deletedAt" IS NULL FOR UPDATE`
        );
    return rows[0] || null;
  }

  async updateTicket(
    tx: TransactionClient,
    id: string,
    data: Prisma.PawnTicketUncheckedUpdateInput
  ): Promise<PawnTicket> {
    return tx.pawnTicket.update({
      where: { id },
      data
    });
  }

  async createPayment(
    tx: TransactionClient,
    data: Prisma.PaymentUncheckedCreateInput
  ): Promise<Payment> {
    return tx.payment.create({
      data
    });
  }

  async createLedgerEntry(
    tx: TransactionClient,
    data: Prisma.LedgerEntryUncheckedCreateInput
  ): Promise<LedgerEntry> {
    return tx.ledgerEntry.create({
      data
    });
  }
}

export const paymentRepository = new PaymentRepository();
export default paymentRepository;
