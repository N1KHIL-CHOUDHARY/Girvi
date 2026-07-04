import type { Request, Response } from 'express';
import { ApiError } from '../../lib/errors.js';
import { asyncHandler, sendSuccess } from '../../lib/http.js';
import type { CustomerStatsResponse, DashboardStatsResponse, FinancialReportQuery, FinancialReportResponse } from './analytics.types.js';
import { getCustomerStats, getDashboardStats, getFinancialReport } from './analytics.service.js';

export const getDashboardStatsController = asyncHandler(async (req, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, 'Not authorized. Token missing.');
  }

  const data = await getDashboardStats(req.user);
  sendSuccess(res, {
    message: 'Dashboard stats fetched successfully.',
    data,
  });
});

export const getFinancialReportController = asyncHandler<unknown, FinancialReportResponse, unknown, FinancialReportQuery>(async (req, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, 'Not authorized. Token missing.');
  }

  const data = await getFinancialReport(req.user, req.query as FinancialReportQuery);
  sendSuccess(res, {
    message: 'Financial report fetched successfully.',
    data,
    meta: {
      page: data.page,
      totalPages: data.totalPages,
      totalItems: data.totalItems,
      limit: data.limit,
    },
  });
});

export const getCustomerStatsController = asyncHandler<{ id: string }>(async (req: Request<{ id: string }>, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, 'Not authorized. Token missing.');
  }

  const data = await getCustomerStats(req.user, req.params.id);
  sendSuccess(res, {
    message: 'Customer stats fetched successfully.',
    data,
  });
});
