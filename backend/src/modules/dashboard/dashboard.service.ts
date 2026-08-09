import { prisma } from '../../config/database';
import { redisClient } from '../../config/redis';
import { getTenantShopId } from '../../common/context/tenant.context';
import { AppError } from '../../common/errors/AppError';
import { Prisma } from '@prisma/client';
import dayjs from 'dayjs';

export class DashboardService {
  async getDashboardStatistics(): Promise<any> {
    const shopId = getTenantShopId();
    if (!shopId) throw new AppError('Tenant context required', 400);

    const cacheKey = `dashboard_stats:${shopId}`;

    // 1. Attempt to load from cache
    if (redisClient.isOpen) {
      try {
        const cachedData = await redisClient.get(cacheKey);
        if (cachedData) {
          return JSON.parse(cachedData);
        }
      } catch (err) {
        // Continue to query db if Redis fails
      }
    }

    // 2. Fetch and calculate dashboard data
    const startOfMonth = dayjs().startOf('month').toDate();

    const [activeTickets, monthlyTickets, genderDataRaw, areaDataRaw, activityLogs] = await Promise.all([
      // Active tickets
      prisma.pawnTicket.findMany({
        where: { status: 'active' }
      }),
      // Monthly issued tickets
      prisma.pawnTicket.findMany({
        where: {
          pawned_date: { gte: startOfMonth }
        }
      }),
      // Customers gender grouping
      prisma.customer.groupBy({
        by: ['gender'],
        _count: { gender: true }
      }),
      // Customers pincode grouping
      prisma.customer.groupBy({
        by: ['address_pincode'],
        _count: { address_pincode: true },
        where: { address_pincode: { not: null } }
      }),
      // Recent activities
      prisma.activityLog.findMany({
        include: {
          user: true
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      })
    ]);

    // Aggregate stats
    const totalLoanActive = activeTickets.reduce(
      (acc, t) => acc.plus(t.loan_amount),
      new Prisma.Decimal(0)
    );
    const monthlyLoanGiven = monthlyTickets.reduce(
      (acc, t) => acc.plus(t.original_loan_amount),
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
      pincode: a.address_pincode || 'Unknown',
      count: a._count.address_pincode
    }));

    // Calculate top customers by aggregate loan amount using database-level aggregation
    const topCustomersGrouped = await prisma.pawnTicket.groupBy({
      by: ['customerId'],
      _sum: {
        original_loan_amount: true
      },
      orderBy: {
        _sum: {
          original_loan_amount: 'desc'
        }
      },
      take: 5
    });

    const topCustomerIds = topCustomersGrouped.map((cg) => cg.customerId);
    const customersInfo = await prisma.customer.findMany({
      where: { id: { in: topCustomerIds } }
    });

    const infoMap = new Map(customersInfo.map((c) => [c.id, c.full_name]));

    const top_customers = topCustomersGrouped.map((cg) => {
      const fullName = infoMap.get(cg.customerId) || 'Walk-in Customer';
      const totalSum = cg._sum.original_loan_amount || new Prisma.Decimal(0);
      return {
        id: cg.customerId,
        full_name: fullName,
        total_loan: totalSum.toFixed(2)
      };
    });

    // Format activities
    const recent_activity = activityLogs.map((log) => ({
      id: log.id,
      type: log.action,
      message: (log.details as any)?.message || `${log.action} action performed`,
      createdAt: log.createdAt.toISOString(),
      user: log.user ? { full_name: `${log.user.firstName} ${log.user.lastName}`.trim() } : null
    }));

    const responseData = {
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
      } catch (err) {
        // Gracefully ignore cache writing errors
      }
    }

    return responseData;
  }
}

export const dashboardService = new DashboardService();
export default dashboardService;
