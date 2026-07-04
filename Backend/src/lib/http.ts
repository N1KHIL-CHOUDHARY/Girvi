import type { NextFunction, Request, RequestHandler, Response } from 'express';
import type { ParsedQs } from 'qs';

export interface SuccessEnvelope<T> {
  success: true;
  message: string;
  data?: T;
  meta?: Record<string, unknown>;
}

export interface ErrorEnvelope {
  success: false;
  message: string;
  error?: unknown;
  details?: readonly string[];
}

export const asyncHandler = <
  P = Record<string, never>,
  ResBody = unknown,
  ReqBody = unknown,
  ReqQuery = ParsedQs,
  Locals extends Record<string, unknown> = Record<string, never>
>(
  handler: RequestHandler<P, ResBody, ReqBody, ReqQuery, Locals>
): RequestHandler<P, ResBody, ReqBody, ReqQuery, Locals> => {
  return (req: Request<P, ResBody, ReqBody, ReqQuery, Locals>, res: Response<ResBody, Locals>, next: NextFunction) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
};

export const sendSuccess = <T>(
  res: Response,
  payload: {
    status?: number;
    message: string;
    data?: T;
    meta?: Record<string, unknown>;
  }
): Response => {
  return res.status(payload.status ?? 200).json({
    success: true,
    message: payload.message,
    ...(payload.data === undefined ? {} : { data: payload.data }),
    ...(payload.meta === undefined ? {} : { meta: payload.meta }),
  });
};

export const sendError = (
  res: Response,
  payload: {
    status?: number;
    message: string;
    error?: unknown;
    details?: readonly string[];
  }
): Response => {
  return res.status(payload.status ?? 500).json({
    success: false,
    message: payload.message,
    ...(payload.error === undefined ? {} : { error: payload.error }),
    ...(payload.details === undefined ? {} : { details: payload.details }),
  });
};

export const parsePagination = (query: { page?: string; limit?: string }) => {
  const page = Number.parseInt(query.page ?? '1', 10);
  const limit = Number.parseInt(query.limit ?? '10', 10);
  return {
    page: Number.isFinite(page) && page > 0 ? page : 1,
    limit: Number.isFinite(limit) && limit > 0 ? limit : 10,
  };
};
