import { Request, Response } from 'express';
import { dashboardService } from './dashboard.service';
import { sendSuccess } from '../../common/utils/apiResponse';
import { asyncHandler } from '../../common/utils/asyncHandler';

export class DashboardController {
  getDashboardStats = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    const stats = await dashboardService.getDashboardStatistics();
    sendSuccess(res, stats, 'Dashboard analytics retrieved successfully');
  });
}

export const dashboardController = new DashboardController();
export default dashboardController;
