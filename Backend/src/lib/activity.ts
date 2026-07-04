import { prisma } from '../config/prisma.js';

export interface ActivityInput {
  shopId: string;
  userId?: string | null;
  type: string;
  message: string;
  customerId?: string | null;
  ticketId?: string | null;
}

export const logActivity = async (input: ActivityInput): Promise<void> => {
  await prisma.activity.create({
    data: {
      shopId: input.shopId,
      userId: input.userId ?? null,
      type: input.type,
      message: input.message,
      customerId: input.customerId ?? null,
      ticketId: input.ticketId ?? null,
    },
  });
};
