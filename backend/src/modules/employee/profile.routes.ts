import { Router, Request, Response } from 'express';
import { authMiddleware } from '../../common/middleware/auth.middleware';
import { prisma } from '../../config/database';
import { sendSuccess } from '../../common/utils/apiResponse';
import { getTenantShopId, getTenantUserId } from '../../common/context/tenant.context';
import { NotFoundError, AppError } from '../../common/errors/AppError';
import { asyncHandler } from '../../common/utils/asyncHandler';

const router = Router();

router.use(authMiddleware);

router.get('/me', asyncHandler(async (_req: Request, res: Response): Promise<void> => {
  const userId = getTenantUserId();
  const shopId = getTenantShopId();
  if (!userId || !shopId) {
    throw new AppError('Unauthenticated context', 401);
  }

  const user = await prisma.user.findFirst({
    where: { id: userId },
    include: {
      role: {
        include: {
          permissions: {
            include: {
              permission: true
            }
          }
        }
      },
      shop: true
    }
  });

  if (!user) {
    throw new NotFoundError('User profile not found');
  }

  const permissionsObj: Record<string, boolean> = {};
  if (user.role?.name === 'owner') {
    permissionsObj['*'] = true;
  } else if (user.role?.permissions) {
    user.role.permissions.forEach((rp) => {
      permissionsObj[rp.permission.code] = true;
    });
  }

  sendSuccess(res, {
    id: user.id,
    shopId: user.shopId,
    role: user.role?.name || 'worker',
    full_name: `${user.firstName} ${user.lastName}`.trim(),
    email: user.email,
    language: user.language,
    permissions: permissionsObj,
    shop: {
      id: user.shop.id,
      name: user.shop.name,
      email: user.shop.email,
      phone: user.shop.phone,
      address: user.shop.address
    }
  }, 'Profile and shop details retrieved successfully');
}));

router.patch('/me', asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const shopId = getTenantShopId();
  const userId = getTenantUserId();
  if (!shopId) throw new AppError('Tenant context required', 400);

  const { name, email, phone, address } = req.body;

  const updatedShop = await prisma.shop.update({
    where: { id: shopId },
    data: {
      name,
      email,
      phone,
      address
    }
  });

  await prisma.auditLog.create({
    data: {
      shopId,
      userId,
      entityName: 'Shop',
      entityId: shopId,
      action: 'update',
      newValue: { name, email, phone, address }
    }
  });

  sendSuccess(res, updatedShop, 'Shop details updated successfully');
}));

router.put('/users/preferences', asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = getTenantUserId();
  const shopId = getTenantShopId();
  if (!userId || !shopId) throw new AppError('Unauthenticated context', 401);

  const { language } = req.body;
  if (!language || !['en', 'hi', 'ta'].includes(language)) {
    throw new AppError('Invalid language selection (must be en, hi, or ta)', 400);
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { language }
  });

  sendSuccess(res, { language: updatedUser.language }, 'User preference updated successfully');
}));

export default router;
