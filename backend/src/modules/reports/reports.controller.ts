import { Request, Response, NextFunction } from 'express';
import { reportsService } from './reports.service';
import { sendResponse } from '../../common/utils/apiResponse';

export class ReportsController {
  async getFinancialReport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 10;
      const search = req.query.search as string;

      const result = await reportsService.getFinancialReport({ page, limit, search });

      sendResponse(res, {
        message: 'Financial report generated successfully',
        data: {
          items: result.report,
          page: result.page,
          limit: result.limit,
          total: result.totalItems,
          totalPages: result.totalPages
        }
      });
    } catch (error) {
      next(error);
    }
  }
  async exportCsv(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const search = req.query.search as string;
      const csv = await reportsService.exportToCsv(search);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="financial-report.csv"');
      res.status(200).send(csv);
    } catch (error) {
      next(error);
    }
  }

  async exportExcel(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const search = req.query.search as string;
      const excelBuffer = await reportsService.exportToExcel(search);

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename="financial-report.xlsx"');
      res.status(200).send(excelBuffer);
    } catch (error) {
      next(error);
    }
  }
}

export const reportsController = new ReportsController();
export default reportsController;
