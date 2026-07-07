import { Request, Response, NextFunction } from 'express';
import { dashboardService } from './dashboard.service';
import { sendResponse } from '../../common/utils/apiResponse';

export class DashboardController {
  async getDashboardStats(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await dashboardService.getDashboardStatistics();
      sendResponse(res, {
        message: 'Dashboard analytics retrieved successfully',
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }
}

export const dashboardController = new DashboardController();
export default dashboardController;
