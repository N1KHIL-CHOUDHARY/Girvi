import { Request, Response, NextFunction } from 'express';
import { AuthenticationError } from '../errors/AppError';
import { tenantContext } from '../context/tenant.context';

export const authMiddleware = (_req: Request, _res: Response, next: NextFunction): void => {
  const store = tenantContext.getStore();
  if (!store || !store.userId || !store.shopId) {
    throw new AuthenticationError('Authentication required: Invalid or expired token');
  }
  next();
};

export default authMiddleware;
