import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import { tenantContext } from '../context/tenant.context';
import { env } from '../../config/env';

export const tenantMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const requestId = (req.headers['x-request-id'] as string) || uuidv4();
  res.setHeader('x-request-id', requestId);

  const ipAddress = req.ip || req.socket.remoteAddress;
  const userAgent = req.headers['user-agent'];

  let shopId: string | undefined = undefined;
  let userId: string | undefined = undefined;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as { shopId: string; userId: string };
      shopId = decoded.shopId;
      userId = decoded.userId;
    } catch (err) {
      // Gracefully continue. authMiddleware will validate authenticity for protected routes.
    }
  }

  // Bind parameters to AsyncLocalStorage context
  tenantContext.run(
    {
      shopId,
      userId,
      ipAddress,
      userAgent,
      requestId
    },
    () => {
      next();
    }
  );
};

export default tenantMiddleware;
