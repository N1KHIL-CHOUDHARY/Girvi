import { Router, Request, Response } from 'express';
import { prisma } from '../../config/database';
import { authMiddleware } from '../../common/middleware/auth.middleware';
import { sendSuccess } from '../../common/utils/apiResponse';
import { getTenantShopId } from '../../common/context/tenant.context';
import { asyncHandler } from '../../common/utils/asyncHandler';

const router = Router();

router.get('/', authMiddleware, asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const shopId = getTenantShopId();
  if (!shopId) {
    res.status(400).json({ success: false, message: 'Shop context required' });
    return;
  }

  const query = String(req.query.q || '').trim();
  if (!query) {
    sendSuccess(res, { customers: [], tickets: [] }, 'Search results');
    return;
  }

  const customers = await prisma.customer.findMany({
    where: {
      shopId,
      OR: [
        { full_name: { contains: query, mode: 'insensitive' } },
        { phone_number: { contains: query, mode: 'insensitive' } },
        { customerCode: { contains: query, mode: 'insensitive' } }
      ]
    },
    take: 5
  });

  const tickets = await prisma.pawnTicket.findMany({
    where: {
      shopId,
      ticket_number: { contains: query, mode: 'insensitive' }
    },
    take: 5
  });

  sendSuccess(res, { customers, tickets }, 'Search results');
}));

export default router;
