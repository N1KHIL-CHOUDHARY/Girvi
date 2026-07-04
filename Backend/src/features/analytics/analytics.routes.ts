import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { getDashboardStatsController, getFinancialReportController } from './analytics.controller.js';

const router = Router();

router.use(authenticate);
router.get('/dashboard', getDashboardStatsController);
router.get('/financial-report', getFinancialReportController);

export default router;
