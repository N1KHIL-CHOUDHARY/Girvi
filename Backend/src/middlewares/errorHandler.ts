import type { ErrorRequestHandler } from 'express';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { ApiError } from '../lib/errors.js';
import { sendError } from '../lib/http.js';

export const errorHandler: ErrorRequestHandler = (error, _req, res, next) => {
  if (res.headersSent) {
    next(error);
    return;
  }

  if (error instanceof ApiError) {
    sendError(res, {
      status: error.statusCode,
      message: error.message,
      details: error.details,
    });
    return;
  }

  if (error instanceof PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      sendError(res, {
        status: 409,
        message: 'Resource already exists.',
      });
      return;
    }

    if (error.code === 'P2025') {
      sendError(res, {
        status: 404,
        message: 'Resource not found.',
      });
      return;
    }
  }

  sendError(res, {
    status: 500,
    message: 'Internal server error.',
  });
};
