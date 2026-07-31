import { Router } from 'express';
import { reportsController } from './reports.controller';
import { dashboardController } from '../dashboard/dashboard.controller';
import { authMiddleware } from '../../common/middleware/auth.middleware';
import { requirePermission } from '../../common/middleware/permission.middleware';

const router = Router();

router.use(authMiddleware);

router.get(
  '/',
  requirePermission('manage:reports'),
  reportsController.getFinancialReport
);

router.get(
  '/financial',
  requirePermission('manage:reports'),
  reportsController.getFinancialReport
);

router.get(
  '/financial-report',
  requirePermission('manage:reports'),
  reportsController.getFinancialReport
);

router.get(
  '/dashboard',
  requirePermission('read:dashboard'),
  dashboardController.getDashboardStats
);

router.get(
  '/export/csv',
  requirePermission('manage:reports'),
  reportsController.exportCsv
);

router.get(
  '/export/excel',
  requirePermission('manage:reports'),
  reportsController.exportExcel
);

router.get(
  '/financial-report/export/csv',
  requirePermission('manage:reports'),
  reportsController.exportCsv
);

router.get(
  '/financial-report/export/excel',
  requirePermission('manage:reports'),
  reportsController.exportExcel
);

export default router;
