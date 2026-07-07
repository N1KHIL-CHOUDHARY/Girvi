import { Response } from 'express';

interface ApiResponseOptions<T = any> {
  statusCode?: number;
  success?: boolean;
  message?: string;
  data?: T;
  meta?: any;
}

export const sendResponse = <T = any>(
  res: Response,
  options: ApiResponseOptions<T>
): Response => {
  const {
    statusCode = 200,
    success = true,
    message = '',
    data = {} as T,
    meta = {}
  } = options;

  return res.status(statusCode).json({
    success,
    message,
    data,
    meta
  });
};

export default sendResponse;
