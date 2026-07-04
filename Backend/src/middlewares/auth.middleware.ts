import type { NextFunction, Request, Response } from 'express';
import { prisma } from '../config/prisma.js';
import { ApiError } from '../lib/errors.js';
import { verifyAccessToken } from '../lib/tokens.js';
import { parsePermissionSet, type PermissionSet } from '../lib/permissions.js';
import type { AuthSession } from '../features/auth/auth.types.js';

const extractBearerToken = (authorizationHeader?: string): string => {
  if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
    throw new ApiError(401, 'Not authorized. Token missing.');
  }

  const token = authorizationHeader.slice('Bearer '.length).trim();
  if (!token) {
    throw new ApiError(401, 'Not authorized. Token missing.');
  }

  return token;
};

const loadPermissions = async (session: AuthSession): Promise<PermissionSet> => {
  if (session.permissions) {
    return session.permissions;
  }

  const role = await prisma.role.findFirst({
    where: {
      id: session.roleId ?? undefined,
      shopId: session.shopId,
    },
    select: {
      permissions: true,
    },
  });

  if (!role || typeof role.permissions !== 'object' || role.permissions === null) {
    throw new ApiError(401, 'Not authorized. Token invalid.');
  }

  return parsePermissionSet(role.permissions);
};

export const authenticate = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = extractBearerToken(req.headers.authorization);
    const session = verifyAccessToken(token);
    const permissions = await loadPermissions(session);
    req.user = { ...session, permissions };
    next();
  } catch (error) {
    next(error);
  }
};

export const checkPermission = (permissionName: keyof PermissionSet) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user || req.user.permissions[permissionName] !== true) {
      next(new ApiError(403, 'Forbidden. Insufficient permissions.'));
      return;
    }

    next();
  };
};
