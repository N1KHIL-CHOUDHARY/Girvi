import { Response } from 'express';

export interface MetaData {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
}

export interface ApiResponseOptions<T = any> {
  statusCode?: number;
  success?: boolean;
  message?: string;
  data?: T;
  meta?: MetaData;
  error?: {
    code: string;
    details?: any;
  };
}

export const sendSuccess = <T = any>(
  res: Response,
  data?: T,
  message: string = '',
  statusCode: number = 200,
  meta?: MetaData
): Response => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    meta
  });
};

export const sendError = (
  res: Response,
  message: string = '',
  statusCode: number = 500,
  errorCode: string = 'APP_ERROR',
  details?: any
): Response => {
  return res.status(statusCode).json({
    success: false,
    message,
    error: {
      code: errorCode,
      details
    }
  });
};

export const sendResponse = <T = any>(
  res: Response,
  options: ApiResponseOptions<T>
): Response => {
  const success = options.success !== false;
  const statusCode = options.statusCode || (success ? 200 : 500);
  const message = options.message || '';

  if (success) {
    return sendSuccess(res, options.data, message, statusCode, options.meta);
  } else {
    const errCode = options.error?.code || 'APP_ERROR';
    const errDetails = options.error?.details || options.data;
    return sendError(res, message, statusCode, errCode, errDetails);
  }
};

export default sendResponse;
