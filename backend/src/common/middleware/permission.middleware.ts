import { Request, Response, NextFunction } from 'express';
import { AuthorizationError } from '../errors/AppError';
import { tenantContext } from '../context/tenant.context';
import { prisma } from '../../config/database';
import { redisClient } from '../../config/redis';

export const requirePermission = (permissionCode: string) => {
  return async (_req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const store = tenantContext.getStore();
    if (!store || !store.userId) {
      return next(new AuthorizationError('Access Denied: Unauthenticated context'));
    }

    const userId = store.userId;
    const cacheKey = `user:permissions:${userId}`;

    try {
      let permissions: string[] = [];

      // Attempt to load permissions from Redis Cache
      if (redisClient.isOpen) {
        const cachedPerms = await redisClient.get(cacheKey);
        if (cachedPerms) {
          permissions = JSON.parse(cachedPerms);
        }
      }

      // Query database if cache miss
      if (permissions.length === 0) {
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
            }
          }
        });

        if (user) {
          // If the role is the owner, grant absolute permissions
          if (user.role?.name === 'owner') {
            const allPerms = await prisma.permission.findMany();
            permissions = allPerms.map((p) => p.code);
          } else if (user.role?.permissions) {
            permissions = user.role.permissions.map((rp) => rp.permission.code);
          }

          // Cache the permissions in Redis for 10 minutes (600 seconds)
          if (redisClient.isOpen && permissions.length > 0) {
            await redisClient.setEx(cacheKey, 600, JSON.stringify(permissions));
          }
        }
      }

      // Check if user has permission
      if (!permissions.includes(permissionCode)) {
        return next(new AuthorizationError(`Access Denied: Required permission '${permissionCode}' missing`));
      }

      next();
    } catch (err) {
      next(err);
    }
  };
};

export default requirePermission;
