import { Router, Request, Response, NextFunction } from 'express';
import { authMiddleware } from '../../common/middleware/auth.middleware';
import { prisma } from '../../config/database';
import { sendResponse } from '../../common/utils/apiResponse';
import { getTenantShopId, getTenantUserId } from '../../common/context/tenant.context';
import { NotFoundError, AppError } from '../../common/errors/AppError';

const router = Router();

// Apply authentication middleware to settings endpoints
router.use(authMiddleware);

/**
 * GET /app/me - Retrieves current user and associated shop details
 */
router.get('/me', async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
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

    // Convert permission list to dictionary
    const permissionsObj: Record<string, boolean> = {};
    if (user.role?.name === 'owner') {
      permissionsObj['*'] = true;
    } else if (user.role?.permissions) {
      user.role.permissions.forEach((rp) => {
        permissionsObj[rp.permission.code] = true;
      });
    }

    sendResponse(res, {
      message: 'Profile and shop details retrieved successfully',
      data: {
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
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /app/me - Updates the Shop's credentials
 */
router.patch('/me', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
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

    // Write audit log
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

    sendResponse(res, {
      message: 'Shop details updated successfully',
      data: updatedShop
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /app/users/preferences - Updates active user preference configuration (language, etc.)
 */
router.put('/users/preferences', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
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

    sendResponse(res, {
      message: 'User preference updated successfully',
      data: { language: updatedUser.language }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
