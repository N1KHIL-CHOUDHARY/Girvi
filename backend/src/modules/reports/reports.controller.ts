import { Request, Response } from 'express';
import { reportsService } from './reports.service';
import { sendSuccess } from '../../common/utils/apiResponse';
import { asyncHandler } from '../../common/utils/asyncHandler';

export class ReportsController {
  getFinancialReport = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const search = req.query.search as string;

    const result = await reportsService.getFinancialReport({ page, limit, search });

    sendSuccess(
      res,
      result.report,
      'Financial report generated successfully',
      200,
      {
        page: result.page,
        limit: result.limit,
        total: result.totalItems,
        totalPages: result.totalPages
      }
    );
  });

  exportCsv = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const search = req.query.search as string;
    const csv = await reportsService.exportToCsv(search);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="financial-report.csv"');
    res.status(200).send(csv);
  });

  exportExcel = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const search = req.query.search as string;
    const excelBuffer = await reportsService.exportToExcel(search);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="financial-report.xlsx"');
    res.status(200).send(excelBuffer);
  });
}

export const reportsController = new ReportsController();
export default reportsController;
