import { prisma } from '../../config/database';
import { redisClient } from '../../config/redis';
import { getTenantShopId } from '../../common/context/tenant.context';
import { AppError } from '../../common/errors/AppError';
import { Prisma } from '@prisma/client';
import dayjs from 'dayjs';

export interface DashboardStatsResponse {
  stats: {
    total_loan_active: string;
    monthly_loan_given: string;
    total_active_tickets: number;
  };
  gender_data: {
    gender: string;
    count: number;
  }[];
  area_data: {
    pincode: string;
    count: number;
  }[];
  top_customers: {
    id: string;
    full_name: string;
    total_loan: string;
  }[];
  recent_activity: {
    id: string;
    type: string;
    message: string;
    createdAt: string;
    user: { full_name: string } | null;
  }[];
}

export class DashboardService {
  async getDashboardStatistics(): Promise<DashboardStatsResponse> {
    const shopId = getTenantShopId();
    if (!shopId) throw new AppError('Tenant context required', 400);

    const cacheKey = `dashboard_stats:${shopId}`;

    // 1. Attempt to load from cache
    if (redisClient.isOpen) {
      try {
        const cachedData = await redisClient.get(cacheKey);
        if (cachedData) {
          return JSON.parse(cachedData) as DashboardStatsResponse;
        }
      } catch (_err) {
        // Continue to query db if Redis fails
      }
    }

    // 2. Fetch and calculate dashboard data strictly scoped to this shopId
    const startOfMonth = dayjs().startOf('month').toDate();

    const [activeTickets, monthlyTickets, genderDataRaw, areaDataRaw, activityLogs] = await Promise.all([
      // Active tickets for this shop
      prisma.pawnTicket.findMany({
        where: { shopId, status: 'active', deletedAt: null }
      }),
      // Monthly issued tickets for this shop
      prisma.pawnTicket.findMany({
        where: {
          shopId,
          pawnedDate: { gte: startOfMonth },
          deletedAt: null
        }
      }),
      // Customers gender grouping for this shop
      prisma.customer.groupBy({
        by: ['gender'],
        where: { shopId, deletedAt: null },
        _count: { gender: true }
      }),
      // Customers pincode grouping for this shop
      prisma.customer.groupBy({
        by: ['addressPincode'],
        where: { shopId, addressPincode: { not: null }, deletedAt: null },
        _count: { addressPincode: true }
      }),
      // Recent activities for this shop
      prisma.activityLog.findMany({
        where: { shopId },
        include: {
          user: true
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      })
    ]);

    // Aggregate stats
    const totalLoanActive = activeTickets.reduce(
      (acc, t) => acc.plus(t.loanAmount),
      new Prisma.Decimal(0)
    );
    const monthlyLoanGiven = monthlyTickets.reduce(
      (acc, t) => acc.plus(t.originalLoanAmount),
      new Prisma.Decimal(0)
    );

    const stats = {
      total_loan_active: totalLoanActive.toFixed(2),
      monthly_loan_given: monthlyLoanGiven.toFixed(2),
      total_active_tickets: activeTickets.length
    };

    // Format gender distribution
    const gender_data = genderDataRaw.map((g) => ({
      gender: g.gender || 'Other',
      count: g._count.gender
    }));

    // Format area (pincode) distribution
    const area_data = areaDataRaw.map((a) => ({
      pincode: a.addressPincode || 'Unknown',
      count: a._count.addressPincode
    }));

    // Calculate top customers by aggregate loan amount scoped to shop
    const topCustomersGrouped = await prisma.pawnTicket.groupBy({
      by: ['customerId'],
      where: { shopId, deletedAt: null },
      _sum: {
        originalLoanAmount: true
      },
      orderBy: {
        _sum: {
          originalLoanAmount: 'desc'
        }
      },
      take: 5
    });

    const topCustomerIds = topCustomersGrouped.map((cg) => cg.customerId);
    const customersInfo = topCustomerIds.length > 0
      ? await prisma.customer.findMany({
          where: { id: { in: topCustomerIds }, shopId, deletedAt: null }
        })
      : [];

    const infoMap = new Map(customersInfo.map((c) => [c.id, c.fullName]));

    const top_customers = topCustomersGrouped.map((cg) => {
      const fullName = infoMap.get(cg.customerId) || 'Walk-in Customer';
      const totalSum = cg._sum.originalLoanAmount || new Prisma.Decimal(0);
      return {
        id: cg.customerId,
        full_name: fullName,
        total_loan: totalSum.toFixed(2)
      };
    });

    // Format activities
    const recent_activity = activityLogs.map((log) => {
      const details = typeof log.details === 'object' && log.details !== null
        ? (log.details as Record<string, unknown>)
        : {};
      const message = typeof details.message === 'string'
        ? details.message
        : `${log.action} action performed`;

      return {
        id: log.id,
        type: log.action,
        message,
        createdAt: log.createdAt.toISOString(),
        user: log.user ? { full_name: `${log.user.firstName} ${log.user.lastName}`.trim() } : null
      };
    });

    const responseData: DashboardStatsResponse = {
      stats,
      gender_data,
      area_data,
      top_customers,
      recent_activity
    };

    // 3. Cache inside Redis for 5 minutes (300 seconds)
    if (redisClient.isOpen) {
      try {
        await redisClient.setEx(cacheKey, 300, JSON.stringify(responseData));
      } catch (_err) {
        // Gracefully ignore cache writing errors
      }
    }

    return responseData;
  }
}

export const dashboardService = new DashboardService();
export default dashboardService;
