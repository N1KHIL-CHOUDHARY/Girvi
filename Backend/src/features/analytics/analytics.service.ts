import { type Prisma } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { prisma } from '../../config/prisma';
import { decimalToString } from '../../lib/decimal';
import { parsePagination } from '../../lib/http';
import type { AuthSession } from '../auth/auth.types';
import type {
  CustomerStatsResponse,
  DashboardAreaDatum,
  DashboardGenderDatum,
  DashboardStatsResponse,
  FinancialReportQuery,
  FinancialReportResponse,
} from './analytics.types';

const mapStatus = (status: 'ACTIVE' | 'SETTLED' | 'DEFAULTED'): 'active' | 'settled' | 'defaulted' => {
  if (status === 'ACTIVE') {
    return 'active';
  }
  if (status === 'SETTLED') {
    return 'settled';
  }
  return 'defaulted';
};

export const getDashboardStats = async (session: AuthSession): Promise<DashboardStatsResponse> => {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [activeStats, monthlyStats, totalActiveTickets, genderRows, areaRows, tickets, recentActivity] = await Promise.all([
    prisma.pawnTicket.aggregate({
      where: { shopId: session.shopId, isDeleted: false, status: 'ACTIVE' },
      _sum: { loanAmount: true },
    }),
    prisma.pawnTicket.aggregate({
      where: { shopId: session.shopId, isDeleted: false, pawnedDate: { gte: thirtyDaysAgo } },
      _sum: { loanAmount: true },
    }),
    prisma.pawnTicket.count({
      where: { shopId: session.shopId, isDeleted: false, status: 'ACTIVE' },
    }),
    prisma.customer.groupBy({
      by: ['gender'],
      where: { shopId: session.shopId, isDeleted: false, gender: { not: null } },
      _count: { gender: true },
    }),
    prisma.customer.groupBy({
      by: ['pincode'],
      where: {
        shopId: session.shopId,
        isDeleted: false,
        AND: [{ pincode: { not: null } }, { pincode: { not: '' } }],
      },
      _count: { pincode: true },
      orderBy: { _count: { pincode: 'desc' } },
      take: 5,
    }),
    prisma.pawnTicket.findMany({
      where: { shopId: session.shopId, isDeleted: false },
      select: {
        customerId: true,
        loanAmount: true,
        customer: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
    }),
    prisma.activity.findMany({
      where: { shopId: session.shopId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        user: {
          select: { fullName: true },
        },
      },
    }),
  ]);

  const topCustomersMap = new Map<string, { id: string; full_name: string; total_loan: Decimal }>();
  for (const ticket of tickets) {
    const existing = topCustomersMap.get(ticket.customerId);
    if (existing) {
      existing.total_loan = existing.total_loan.plus(ticket.loanAmount);
      continue;
    }

    topCustomersMap.set(ticket.customerId, {
      id: ticket.customer?.id ?? ticket.customerId,
      full_name: ticket.customer?.fullName ?? 'Unknown',
      total_loan: ticket.loanAmount,
    });
  }

  const topCustomers = Array.from(topCustomersMap.values())
    .sort((left, right) => right.total_loan.comparedTo(left.total_loan))
    .slice(0, 5)
    .map((item) => ({
      id: item.id,
      full_name: item.full_name,
      total_loan: decimalToString(item.total_loan) ?? '0',
    }));

  const genderData: DashboardGenderDatum[] = (genderRows as Array<{ gender: 'Male' | 'Female' | 'Other' | null; _count: { gender: number } }>).map((row) => ({
    gender: row.gender,
    count: row._count.gender,
  }));

  const areaData: DashboardAreaDatum[] = areaRows
    .filter((row: { pincode: string | null; _count: { pincode: number } }): row is { pincode: string; _count: { pincode: number } } => typeof row.pincode === 'string' && row.pincode.length > 0)
    .map((row: { pincode: string; _count: { pincode: number } }) => ({
      pincode: row.pincode,
      count: row._count.pincode,
    }));

  return {
    stats: {
      total_loan_active: decimalToString(activeStats._sum.loanAmount) ?? '0',
      monthly_loan_given: decimalToString(monthlyStats._sum.loanAmount) ?? '0',
      total_active_tickets: totalActiveTickets,
    },
    gender_data: genderData,
    area_data: areaData,
    top_customers: topCustomers,
    recent_activity: (recentActivity as Array<{ id: string; type: string; message: string; createdAt: Date; user: { fullName: string } | null }>).map((activity) => ({
      id: activity.id,
      type: activity.type,
      message: activity.message,
      createdAt: activity.createdAt.toISOString(),
      user: activity.user ? { full_name: activity.user.fullName } : null,
    })),
  };
};

export const getFinancialReport = async (session: AuthSession, query: FinancialReportQuery): Promise<FinancialReportResponse> => {
  const { page, limit } = parsePagination(query);
  const search = query.search?.trim();

  const where = {
    shopId: session.shopId,
    isDeleted: false,
    ...(search
      ? {
          ticketNumber: {
            contains: search,
            mode: 'insensitive' as const,
          },
        }
      : {}),
  };

  const [totalItems, tickets] = await Promise.all([
    prisma.pawnTicket.count({ where }),
    prisma.pawnTicket.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { ticketNumber: 'asc' },
      include: {
        customer: {
          select: { fullName: true },
        },
        payments: {
          select: {
            amountPaid: true,
            paymentFor: true,
          },
        },
      },
    }),
  ]);

  const report = (tickets as Array<{
    id: string;
    ticketNumber: string;
    status: 'ACTIVE' | 'SETTLED' | 'DEFAULTED';
    originalLoanAmount: Decimal;
    loanAmount: Decimal;
    customer: { fullName: string };
    payments: Array<{ amountPaid: Decimal; paymentFor: 'INTEREST' | 'PRINCIPAL' }>;
  }>).map((ticket) => {
    const totalInterestPaid = ticket.payments
      .filter((payment: { amountPaid: Decimal; paymentFor: 'INTEREST' | 'PRINCIPAL' }) => payment.paymentFor === 'INTEREST')
      .reduce((sum: Decimal, payment: { amountPaid: Decimal; paymentFor: 'INTEREST' | 'PRINCIPAL' }) => sum.plus(payment.amountPaid), new Decimal(0));
    const totalPrincipalPaid = ticket.payments
      .filter((payment: { amountPaid: Decimal; paymentFor: 'INTEREST' | 'PRINCIPAL' }) => payment.paymentFor === 'PRINCIPAL')
      .reduce((sum: Decimal, payment: { amountPaid: Decimal; paymentFor: 'INTEREST' | 'PRINCIPAL' }) => sum.plus(payment.amountPaid), new Decimal(0));

    return {
      id: ticket.id,
      ticket_number: ticket.ticketNumber,
      status: mapStatus(ticket.status),
      original_loan_amount: decimalToString(ticket.originalLoanAmount) ?? '0',
      loan_amount: decimalToString(ticket.loanAmount) ?? '0',
      total_interest_paid: decimalToString(totalInterestPaid) ?? '0',
      total_principal_paid: decimalToString(totalPrincipalPaid) ?? '0',
      customer_name: ticket.customer.fullName,
    };
  });

  return {
    report,
    totalItems,
    totalPages: Math.ceil(totalItems / limit),
    page,
    limit,
  };
};

export const getCustomerStats = async (session: AuthSession, customerId: string): Promise<CustomerStatsResponse> => {
  const [ticketStats, paymentStats] = await Promise.all([
    prisma.pawnTicket.aggregate({
      where: {
        shopId: session.shopId,
        customerId,
        isDeleted: false,
      },
      _sum: { loanAmount: true },
      _count: { id: true },
    }),
    prisma.payment.groupBy({
      by: ['paymentFor'],
      where: {
        shopId: session.shopId,
        customerId,
      },
      _sum: { amountPaid: true },
    }),
  ]);

  const activeTicketCount = await prisma.pawnTicket.count({
    where: {
      shopId: session.shopId,
      customerId,
      isDeleted: false,
      status: 'ACTIVE',
    },
  });

  return {
    stats: {
      total_loan_value: decimalToString(ticketStats._sum.loanAmount) ?? '0',
      total_active_loan: decimalToString(ticketStats._sum.loanAmount) ?? '0',
      total_tickets: ticketStats._count.id,
      active_tickets: activeTicketCount,
    },
    payments: (paymentStats as Array<{ paymentFor: 'INTEREST' | 'PRINCIPAL'; _sum: { amountPaid: Decimal | null } }>).map((payment) => ({
      payment_for: payment.paymentFor === 'INTEREST' ? 'interest' : 'principal',
      total_paid: decimalToString(payment._sum.amountPaid) ?? '0',
    })),
  };
};
