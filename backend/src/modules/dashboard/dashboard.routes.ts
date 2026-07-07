import { Router } from 'express';
import { dashboardController } from './dashboard.controller';
import { authMiddleware } from '../../common/middleware/auth.middleware';
import { requirePermission } from '../../common/middleware/permission.middleware';

const router = Router();

// Apply auth check globally
router.use(authMiddleware);

router.get(
  '/dashboard',
  requirePermission('read:dashboard'),
  dashboardController.getDashboardStats
);

export default router;
