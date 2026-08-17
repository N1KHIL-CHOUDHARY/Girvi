export type StructuredErrorPayload =
  | { field: string; message: string }
  | Record<string, unknown>
  | string;

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly success: boolean;
  public readonly errors: StructuredErrorPayload[];

  constructor(message: string, statusCode = 500, errors: StructuredErrorPayload[] = []) {
    super(message);
    this.statusCode = statusCode;
    this.success = false;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Validation Failed', errors: { field: string; message: string }[] = []) {
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
    let errorPayload: StructuredErrorPayload[] = [];
    if (rawError instanceof Error) {
      errorPayload = [{ field: 'database', message: rawError.message }];
    } else if (typeof rawError === 'object' && rawError !== null) {
      errorPayload = [rawError as Record<string, unknown>];
    } else if (rawError) {
      errorPayload = [String(rawError)];
    }
    super(message, 500, errorPayload);
  }
}

