import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware';
import { getCustomerStatsController, getDashboardStatsController, getFinancialReportController } from './analytics.controller';

const router = Router();

router.use(authenticate);
router.get('/dashboard', getDashboardStatsController);
router.get('/financial-report', getFinancialReportController);
router.get('/customers/:id/stats', getCustomerStatsController);

export default router;
