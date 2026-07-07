import { Router } from 'express';
import { reportsController } from './reports.controller';
import { authMiddleware } from '../../common/middleware/auth.middleware';
import { requirePermission } from '../../common/middleware/permission.middleware';

const router = Router();

// Apply auth check globally
router.use(authMiddleware);

router.get(
  '/financial-report',
  requirePermission('manage:reports'),
  reportsController.getFinancialReport
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
