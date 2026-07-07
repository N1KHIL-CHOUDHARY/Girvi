import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';
import { logger } from '../logger';
import { env } from '../../config/env';

export const errorMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let statusCode = 500;
  let message = 'Internal Server Error';
  let errors: any[] = [];

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    errors = err.errors;
  } else {
    // Log unexpected errors
    logger.error(
      {
        err: {
          message: err.message,
          stack: err.stack,
          name: err.name
        },
        request: {
          method: req.method,
          url: req.originalUrl,
          body: req.body,
          params: req.params,
          query: req.query
        }
      },
      'Unhandled Server Exception'
    );

    // Check for Prisma Database Errors
    if (err.name?.startsWith('PrismaClient') || err.message?.includes('prisma')) {
      statusCode = 400;
      message = 'Database operations constraint violation';
      if (env.NODE_ENV === 'development') {
        message = err.message;
        errors = [err];
      }
    }
  }

  res.status(statusCode).json({
    success: false,
    message,
    errors,
    statusCode
  });
};

export default errorMiddleware;
