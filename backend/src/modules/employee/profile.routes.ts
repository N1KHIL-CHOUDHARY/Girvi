import { Router, Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { authMiddleware } from '../../common/middleware/auth.middleware';
import { prisma } from '../../config/database';
import { sendSuccess } from '../../common/utils/apiResponse';
import { getTenantShopId, getTenantUserId } from '../../common/context/tenant.context';
import { NotFoundError, AppError, AuthorizationError } from '../../common/errors/AppError';
import { asyncHandler } from '../../common/utils/asyncHandler';
import { employeeService } from './employee.service';

const router = Router();

router.use(authMiddleware);

router.get('/me', asyncHandler(async (_req: Request, res: Response): Promise<void> => {
  const userId = getTenantUserId();
  const shopId = getTenantShopId();
  if (!userId || !shopId) {
    throw new AppError('Unauthenticated context', 401);
  }

  const user = await prisma.user.findUnique({
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
  if (!userId || !shopId) throw new AppError('Unauthenticated context', 401);

  const { firstName, lastName, email, phone, shopName, shopPhone, shopAddress } = req.body;

  const isUpdatingShop = shopName !== undefined || shopPhone !== undefined || shopAddress !== undefined;
  if (isUpdatingShop) {
    const userWithRole = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: {
          include: {
            permissions: {
              include: { permission: true }
            }
          }
        }
      }
    });

    const isOwner = userWithRole?.role?.name === 'owner';
    const hasSettingsPerm = userWithRole?.role?.permissions.some(
      (p) => p.permission.code === 'manage:settings'
    );

    if (!isOwner && !hasSettingsPerm) {
      throw new AuthorizationError('Only shop owners or users with manage:settings permission can modify shop settings');
    }
  }

  const userUpdateData: Prisma.UserUpdateInput = {};
  if (firstName !== undefined) userUpdateData.firstName = firstName;
  if (lastName !== undefined) userUpdateData.lastName = lastName;
  if (email !== undefined) userUpdateData.email = email;
  if (phone !== undefined) userUpdateData.phone = phone;

  if (Object.keys(userUpdateData).length > 0) {
    await prisma.user.update({
      where: { id: userId },
      data: userUpdateData
    });
  }

  const shopUpdateData: Prisma.ShopUpdateInput = {};
  if (shopName !== undefined) shopUpdateData.name = shopName;
  if (shopPhone !== undefined) shopUpdateData.phone = shopPhone;
  if (shopAddress !== undefined) shopUpdateData.address = shopAddress;

  if (Object.keys(shopUpdateData).length > 0) {
    await prisma.shop.update({
      where: { id: shopId },
      data: shopUpdateData
    });
  }

  const freshUser = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      role: true,
      shop: true
    }
  });

  if (!freshUser) {
    throw new NotFoundError('User profile not found');
  }

  sendSuccess(res, {
    id: freshUser.id,
    shopId: freshUser.shopId,
    role: freshUser.role?.name || 'worker',
    full_name: `${freshUser.firstName} ${freshUser.lastName}`.trim(),
    email: freshUser.email,
    language: freshUser.language,
    shop: {
      id: freshUser.shop.id,
      name: freshUser.shop.name,
      email: freshUser.shop.email,
      phone: freshUser.shop.phone,
      address: freshUser.shop.address
    }
  }, 'Profile updated successfully');
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

router.post('/change-password', asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = getTenantUserId();
  if (!userId) throw new AppError('Unauthenticated context', 401);

  const currentPassword = req.body.currentPassword || req.body.oldPassword;
  const newPassword = req.body.newPassword;

  if (!currentPassword || !newPassword) {
    throw new AppError('Current password and new password are required', 400);
  }

  if (typeof newPassword === 'string' && newPassword.length < 8) {
    throw new AppError('New password must be at least 8 characters', 400);
  }

  await employeeService.changePassword(userId, currentPassword, newPassword);

  sendSuccess(res, undefined, 'Password changed successfully');
}));

export default router;
