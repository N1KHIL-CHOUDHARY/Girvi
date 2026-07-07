import { Router } from 'express';
import { authController } from './auth.controller';
import { validateRequest } from '../../common/middleware/validation.middleware';
import { authMiddleware } from '../../common/middleware/auth.middleware';
import { loginRateLimiter } from '../../common/middleware/rateLimiter.middleware';
import {
  signupSchema,
  loginSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema
} from './auth.validation';

const router = Router();

// Public routes with login rate limiting on critical endpoints
router.post(
  '/signup',
  loginRateLimiter,
  validateRequest({ body: signupSchema }),
  authController.signup
);

router.post(
  '/login',
  loginRateLimiter,
  validateRequest({ body: loginSchema }),
  authController.login
);

router.post('/logout', authController.logout);

router.post('/refresh-token', authController.refreshToken);

router.post(
  '/forgot-password',
  validateRequest({ body: forgotPasswordSchema }),
  authController.forgotPassword
);

router.post(
  '/reset-password',
  validateRequest({ body: resetPasswordSchema }),
  authController.resetPassword
);

router.post(
  '/verify-email',
  validateRequest({ body: verifyEmailSchema }),
  authController.verifyEmail
);

// Protected routes
router.post(
  '/change-password',
  authMiddleware,
  validateRequest({ body: changePasswordSchema }),
  authController.changePassword
);

export default router;
