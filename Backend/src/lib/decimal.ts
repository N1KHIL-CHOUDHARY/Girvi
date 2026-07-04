import { Decimal } from '@prisma/client/runtime/library';
import { ApiError } from './errors.js';

export type DecimalLike = string | number | Decimal | null | undefined;

export const parseDecimal = (value: DecimalLike, fieldName: string): Decimal => {
  if (value instanceof Decimal) {
    if (!value.isFinite()) {
      throw new ApiError(400, `${fieldName} must be a valid decimal.`);
    }
    return value;
  }

  if (value === null || value === undefined || value === '') {
    throw new ApiError(400, `${fieldName} must be a valid decimal.`);
  }

  try {
    const decimal = new Decimal(value);
    if (!decimal.isFinite()) {
      throw new ApiError(400, `${fieldName} must be a valid decimal.`);
    }
    return decimal;
  } catch {
    throw new ApiError(400, `${fieldName} must be a valid decimal.`);
  }
};

export const optionalDecimal = (value: DecimalLike, fieldName: string): Decimal | null => {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  return parseDecimal(value, fieldName);
};

export const decimalToString = (value: Decimal | number | string | null | undefined): string | null => {
  if (value === null || value === undefined) {
    return null;
  }
  if (value instanceof Decimal) {
    return value.toFixed();
  }
  return new Decimal(value).toFixed();
};
