export type StructuredErrorPayload =
  | { field: string; message: string }
  | Record<string, unknown>
  | string;

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly success: boolean = false;
  public readonly errors: StructuredErrorPayload[];

  constructor(
    message: string,
    statusCode = 500,
    errors: StructuredErrorPayload[] = []
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.errors = errors;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Bad Request', errors: StructuredErrorPayload[] = []) {
    super(message, 400, errors);
  }
}

export class ValidationError extends AppError {
  constructor(
    message = 'Validation Failed',
    errors: { field: string; message: string }[] = []
  ) {
    super(message, 400, errors);
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'Authentication Required') {
    super(message, 401);
  }
}

export class AuthorizationError extends AppError {
  constructor(message = 'Access Denied: Insufficient Permissions') {
    super(message, 403);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden Access') {
    super(message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource Not Found') {
    super(message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Resource Conflict') {
    super(message, 409);
  }
}

export class DatabaseError extends AppError {
  constructor(message = 'Database Query Failure', rawError?: unknown) {
    const errorPayload: StructuredErrorPayload[] = [];
    if (rawError instanceof Error) {
      errorPayload.push({ field: 'database', message: rawError.message });
    } else if (rawError && typeof rawError === 'object') {
      errorPayload.push(rawError as Record<string, unknown>);
    } else if (rawError) {
      errorPayload.push(String(rawError));
    }
    super(message, 500, errorPayload);
  }
}
