export class ApiError extends Error {
  readonly statusCode: number;
  readonly details?: readonly string[];

  constructor(statusCode: number, message: string, details?: readonly string[]) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    if (details && details.length > 0) {
      this.details = details;
    }
  }
}
