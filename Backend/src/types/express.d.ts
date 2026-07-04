import type { AuthSession } from '../features/auth/auth.types';

declare global {
  namespace Express {
    interface Request {
      user?: AuthSession;
    }
  }
}

export {};
