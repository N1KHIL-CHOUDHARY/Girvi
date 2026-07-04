import type { NextFunction, Request, RequestHandler, Response } from 'express';
import type { ObjectSchema } from 'joi';
import { ApiError } from '../lib/errors.js';

export const validate = <T>(schema: ObjectSchema<T>): RequestHandler => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
      convert: true,
    });

    if (result.error) {
      next(new ApiError(400, 'Validation failed.', result.error.details.map((detail) => detail.message)));
      return;
    }

    req.body = result.value as T;
    next();
  };
};
