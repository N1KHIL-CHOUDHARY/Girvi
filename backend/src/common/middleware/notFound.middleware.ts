import { Request, Response, NextFunction } from 'express';
import { NotFoundError } from '../errors/AppError';

export const notFoundMiddleware = (req: Request, _res: Response, next: NextFunction): void => {
  next(new NotFoundError(`Requested path '${req.method} ${req.originalUrl}' does not exist`));
};

export default notFoundMiddleware;
