import { Request, Response, NextFunction } from 'express';

// Recursive sanitizer to strip HTML tags and scripts
const cleanInput = (input: any): any => {
  if (typeof input === 'string') {
    // Strip HTML tags and script elements to prevent XSS injection
    return input.replace(/<[^>]*>?/gm, '').trim();
  }

  if (Array.isArray(input)) {
    return input.map(cleanInput);
  }

  if (input !== null && typeof input === 'object') {
    const cleaned: Record<string, any> = {};
    for (const key in input) {
      if (Object.prototype.hasOwnProperty.call(input, key)) {
        // Skip passwords from being HTML-stripped to avoid altering special characters in user keys
        if (key.toLowerCase().includes('password')) {
          cleaned[key] = input[key];
        } else {
          cleaned[key] = cleanInput(input[key]);
        }
      }
    }
    return cleaned;
  }

  return input;
};

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
