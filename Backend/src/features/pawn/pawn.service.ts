import { type Prisma } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { prisma } from '../../config/prisma.js';
import { ApiError } from '../../lib/errors.js';
import { logActivity } from '../../lib/activity.js';
import { parseDecimal, decimalToString } from '../../lib/decimal.js';
import { parsePagination } from '../../lib/http.js';
import type { AuthSession } from '../auth/auth.types.js';
import type {
  CustomerPawnTicketsParams,
  PawnItemInput,
  PawnTicketBody,
  PawnTicketListResponse,
  PawnTicketQuery,
  PawnTicketRecord,
  PawnTicketUpdateBody,
} from './pawn.types.js';

const mapItem = (item: {
  id: string;
  name: string;
  type: string;
  weightGrams: Decimal;
  purity: Decimal | null;
  description: string | null;
  itemPhotoUrl: string | null;
}): PawnTicketRecord['items'][number] => ({
  id: item.id,
  name: item.name,
  type: item.type,
  weight_grams: decimalToString(item.weightGrams) ?? '0',
  purity: decimalToString(item.purity),
  description: item.description,
  item_photo_url: item.itemPhotoUrl,
});

const mapCustomer = (customer: {
  id: string;
  fullName: string;
  phoneNumber: string;
  addressLine1: string | null;
  city: string | null;
  pincode: string | null;
}) => ({
  id: customer.id,
  full_name: customer.fullName,
  phone_number: customer.phoneNumber,
  address:
    customer.addressLine1 || customer.city || customer.pincode
      ? {
          line1: customer.addressLine1 ?? undefined,
          city: customer.city ?? undefined,
          pincode: customer.pincode ?? undefined,
        }
      : undefined,
});

const mapTicket = (ticket: {
  id: string;
  customerId: string;
  ticketNumber: string;
  loanAmount: Decimal;
  originalLoanAmount: Decimal;
  interestRate: Decimal;
  advAmount: Decimal;
  pawnedDate: Date;
  status: 'ACTIVE' | 'SETTLED' | 'DEFAULTED';
  settledDate: Date | null;
  items: {
    id: string;
    name: string;
    type: string;
    weightGrams: Decimal;
    purity: Decimal | null;
    description: string | null;
    itemPhotoUrl: string | null;
  }[];
  customer?: {
    id: string;
    fullName: string;
    phoneNumber: string;
    addressLine1: string | null;
    city: string | null;
    pincode: string | null;
  };
}): PawnTicketRecord => ({
  id: ticket.id,
  customer_id: ticket.customerId,
  ticket_number: ticket.ticketNumber,
  loan_amount: decimalToString(ticket.loanAmount) ?? '0',
  original_loan_amount: decimalToString(ticket.originalLoanAmount) ?? '0',
  interest_rate: decimalToString(ticket.interestRate) ?? '0',
  adv_amount: decimalToString(ticket.advAmount) ?? '0',
  pawned_date: ticket.pawnedDate.toISOString(),
  status: ticket.status === 'ACTIVE' ? 'active' : ticket.status === 'SETTLED' ? 'settled' : 'defaulted',
  settled_date: ticket.settledDate?.toISOString() ?? null,
  items: ticket.items.map(mapItem),
  customer: ticket.customer ? mapCustomer(ticket.customer) : undefined,
});

const ensureCustomerExists = async (shopId: string, customerId: string) => {
  const customer = await prisma.customer.findFirst({
    where: {
      id: customerId,
      shopId,
      isDeleted: false,
    },
    select: { id: true, fullName: true },
  });

  if (!customer) {
    throw new ApiError(404, 'Customer not found for this shop.');
  }

  return customer;
};

const ensureTicketExists = async (shopId: string, ticketId: string) => {
  const ticket = await prisma.pawnTicket.findFirst({
    where: {
      id: ticketId,
      shopId,
      isDeleted: false,
    },
    include: {
      customer: {
        select: {
          id: true,
          fullName: true,
          phoneNumber: true,
          addressLine1: true,
          city: true,
          pincode: true,
        },
      },
      items: true,
    },
  });

  if (!ticket) {
    throw new ApiError(404, 'Ticket not found.');
  }

  return ticket;
};

const normalizeStatus = (status?: string): 'ACTIVE' | 'SETTLED' | 'DEFAULTED' | undefined => {
  if (status === 'active') {
    return 'ACTIVE';
  }
  if (status === 'settled') {
    return 'SETTLED';
  }
  if (status === 'defaulted') {
    return 'DEFAULTED';
  }
  return undefined;
};

const resolveItems = (items: PawnItemInput[]) => {
  return items.map((item) => ({
    name: item.name.trim(),
    type: item.type?.trim() || 'gold',
    weightGrams: parseDecimal(item.weight_grams, 'weight_grams'),
    purity: item.purity === null || item.purity === undefined || item.purity === '' ? null : parseDecimal(item.purity, 'purity'),
    description: item.description?.trim() || null,
    itemPhotoUrl: item.item_photo_url?.trim() || null,
  }));
};

export const createPawnTicket = async (session: AuthSession, body: PawnTicketBody): Promise<PawnTicketRecord> => {
  await ensureCustomerExists(session.shopId, body.customer_id);

  const ticketNumberExists = await prisma.pawnTicket.findFirst({
    where: {
      shopId: session.shopId,
      ticketNumber: body.ticket_number,
    },
    select: { id: true },
  });

  if (ticketNumberExists) {
    throw new ApiError(409, 'Ticket number already exists.');
  }

  const pawnedDate = body.pawned_date ? new Date(body.pawned_date) : new Date();

  const ticket = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const createdTicket = await tx.pawnTicket.create({
      data: {
        shopId: session.shopId,
        customerId: body.customer_id,
        createdByUserId: session.userId,
        ticketNumber: body.ticket_number,
        loanAmount: parseDecimal(body.loan_amount, 'loan_amount'),
        originalLoanAmount: parseDecimal(body.loan_amount, 'loan_amount'),
        interestRate: parseDecimal(body.interest_rate, 'interest_rate'),
        advAmount: parseDecimal(body.adv_amount, 'adv_amount'),
        pawnedDate,
        items: {
          create: resolveItems(body.items),
        },
      },
      include: {
        customer: {
          select: {
            id: true,
            fullName: true,
            phoneNumber: true,
            addressLine1: true,
            city: true,
            pincode: true,
          },
        },
        items: true,
      },
    });

    return createdTicket;
  });

  await logActivity({
    shopId: session.shopId,
    userId: session.userId,
    type: 'NEW_TICKET',
    message: `Created ticket ${ticket.ticketNumber}`,
    customerId: ticket.customerId,
    ticketId: ticket.id,
  });

  return mapTicket(ticket);
};

export const listPawnTickets = async (session: AuthSession, query: PawnTicketQuery): Promise<PawnTicketListResponse> => {
  const { page, limit } = parsePagination(query);
  const search = query.search?.trim();
  const status = normalizeStatus(query.status);

  const where = {
    shopId: session.shopId,
    isDeleted: false,
    ...(status ? { status } : {}),
    ...(search
      ? {
          OR: [
            {
              ticketNumber: {
                contains: search,
                mode: 'insensitive' as const,
              },
            },
            {
              items: {
                some: {
                  name: {
                    contains: search,
                    mode: 'insensitive' as const,
                  },
                },
              },
            },
          ],
        }
      : {}),
  };

  const [totalPawnTickets, tickets] = await Promise.all([
    prisma.pawnTicket.count({ where }),
    prisma.pawnTicket.findMany({
      where,
      orderBy: { pawnedDate: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        customer: {
          select: {
            id: true,
            fullName: true,
            phoneNumber: true,
            addressLine1: true,
            city: true,
            pincode: true,
          },
        },
        items: true,
      },
    }),
  ]);

  return {
    tickets: tickets.map(mapTicket),
    totalPawnTickets,
    totalPages: Math.ceil(totalPawnTickets / limit),
    currentPage: page,
  };
};

export const getPawnTicketById = async (session: AuthSession, id: string): Promise<PawnTicketRecord> => {
  const ticket = await ensureTicketExists(session.shopId, id);
  return mapTicket(ticket);
};

export const updatePawnTicket = async (session: AuthSession, id: string, body: PawnTicketUpdateBody): Promise<PawnTicketRecord> => {
  const ticket = await ensureTicketExists(session.shopId, id);

  if (body.ticket_number && body.ticket_number !== ticket.ticketNumber) {
    const duplicate = await prisma.pawnTicket.findFirst({
      where: {
        shopId: session.shopId,
        ticketNumber: body.ticket_number,
        id: {
          not: id,
        },
      },
      select: { id: true },
    });

    if (duplicate) {
      throw new ApiError(409, 'Ticket number already exists.');
    }
  }

  const updated = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    if (body.items) {
      await tx.pawnTicketItem.deleteMany({ where: { ticketId: ticket.id } });
      await tx.pawnTicketItem.createMany({
        data: resolveItems(body.items).map((item) => ({
          ticketId: ticket.id,
          ...item,
        })),
      });
    }

    return tx.pawnTicket.update({
      where: { id: ticket.id },
      data: {
        ...(body.ticket_number ? { ticketNumber: body.ticket_number } : {}),
        ...(body.loan_amount !== undefined ? { loanAmount: parseDecimal(body.loan_amount, 'loan_amount') } : {}),
        ...(body.loan_amount !== undefined ? { originalLoanAmount: parseDecimal(body.loan_amount, 'loan_amount') } : {}),
        ...(body.interest_rate !== undefined ? { interestRate: parseDecimal(body.interest_rate, 'interest_rate') } : {}),
        ...(body.adv_amount !== undefined ? { advAmount: parseDecimal(body.adv_amount, 'adv_amount') } : {}),
        ...(body.pawned_date ? { pawnedDate: new Date(body.pawned_date) } : {}),
        ...(body.status ? { status: normalizeStatus(body.status) ?? ticket.status } : {}),
      },
      include: {
        customer: {
          select: {
            id: true,
            fullName: true,
            phoneNumber: true,
            addressLine1: true,
            city: true,
            pincode: true,
          },
        },
        items: true,
      },
    });
  });

  return mapTicket(updated);
};

export const deletePawnTicket = async (session: AuthSession, id: string): Promise<{ ticketId: string }> => {
  const ticket = await ensureTicketExists(session.shopId, id);

  await prisma.pawnTicket.update({
    where: { id: ticket.id },
    data: { isDeleted: true },
  });

  await logActivity({
    shopId: session.shopId,
    userId: session.userId,
    type: 'DELETED_TICKET',
    message: `Deleted ticket ${ticket.ticketNumber}`,
    customerId: ticket.customerId,
    ticketId: ticket.id,
  });

  return { ticketId: ticket.id };
};

export const settlePawnTicket = async (session: AuthSession, id: string): Promise<PawnTicketRecord> => {
  const ticket = await ensureTicketExists(session.shopId, id);

  const updated = await prisma.pawnTicket.update({
    where: { id: ticket.id },
    data: {
      status: 'SETTLED',
      settledDate: new Date(),
    },
    include: {
      customer: {
        select: {
          id: true,
          fullName: true,
          phoneNumber: true,
          addressLine1: true,
          city: true,
          pincode: true,
        },
      },
      items: true,
    },
  });

  await logActivity({
    shopId: session.shopId,
    userId: session.userId,
    type: 'SETTLED_TICKET',
    message: `Settled ticket ${updated.ticketNumber}`,
    customerId: updated.customerId,
    ticketId: updated.id,
  });

  return mapTicket(updated);
};

export const getPawnTicketsForCustomer = async (session: AuthSession, customerId: string): Promise<{ tickets: PawnTicketRecord[] }> => {
  const tickets = await prisma.pawnTicket.findMany({
    where: {
      shopId: session.shopId,
      customerId,
      isDeleted: false,
    },
    orderBy: { pawnedDate: 'desc' },
    include: {
      customer: {
        select: {
          id: true,
          fullName: true,
          phoneNumber: true,
          addressLine1: true,
          city: true,
          pincode: true,
        },
      },
      items: true,
    },
  });

  return { tickets: tickets.map(mapTicket) };
};
