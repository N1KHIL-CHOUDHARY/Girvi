import { Request, Response, NextFunction } from 'express';

// Recursive sanitizer to strip HTML tags and scripts
export function cleanInput<T>(input: T): T {
  if (typeof input === 'string') {
    // Strip HTML tags and script elements to prevent XSS injection
    return input.replace(/<[^>]*>?/gm, '').trim() as unknown as T;
  }

  if (Array.isArray(input)) {
    return input.map((item) => cleanInput(item)) as unknown as T;
  }

  if (input !== null && typeof input === 'object') {
    const cleaned: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(input)) {
      // Skip passwords from being HTML-stripped to avoid altering special characters in user keys
      if (key.toLowerCase().includes('password')) {
        cleaned[key] = value;
      } else {
        cleaned[key] = cleanInput(value);
      }
    }
    return cleaned as T;
  }

  return input;
}

export const sanitizeMiddleware = (req: Request, _res: Response, next: NextFunction): void => {
  if (req.body) {
    req.body = cleanInput(req.body);
  }
  if (req.query) {
    req.query = cleanInput(req.query);
  }
  if (req.params) {
    req.params = cleanInput(req.params);
  }
  next();
};

export default sanitizeMiddleware;
