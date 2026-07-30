import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';
import { sendResponse } from '../../common/utils/apiResponse';
import { getTenantUserId } from '../../common/context/tenant.context';

export class AuthController {
  async signup(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { full_name, shop_name, email, password } = req.body;
      const { user, token } = await authService.signup({
        full_name,
        shop_name,
        email,
        password
      });

      sendResponse(res, {
        statusCode: 201,
        message: 'Registration successful',
        data: {
          token,
          user: {
            id: user.id,
            shopId: user.shopId,
            role: 'owner',
            full_name: `${user.firstName} ${user.lastName}`.trim(),
            email: user.email,
            language: user.language,
            permissions: { '*': true } // Owner gets universal permissions shortcut
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;
      const ipAddress = req.ip || req.socket.remoteAddress;
      const userAgent = req.headers['user-agent'];

      const { user, token, refreshToken } = await authService.login(
        { email, password },
        ipAddress,
        userAgent
      );

      sendResponse(res, {
        message: 'Login successful',
        data: {
          token,
          refreshToken,
          user: {
            id: user.id,
            shopId: user.shopId,
            role: user.role?.name || 'worker',
            full_name: `${user.firstName} ${user.lastName}`.trim(),
            email: user.email,
            language: user.language,
            permissions: user.role?.name === 'owner' ? { '*': true } : {} // To be extended
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;
      if (refreshToken) {
        await authService.logout(refreshToken);
      }

      sendResponse(res, {
        message: 'Logout successful'
      });
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;
      const ipAddress = req.ip || req.socket.remoteAddress;
      const userAgent = req.headers['user-agent'];

      const tokens = await authService.rotateTokens(refreshToken, ipAddress, userAgent);

      sendResponse(res, {
        message: 'Tokens rotated successfully',
        data: tokens
      });
    } catch (error) {
      next(error);
    }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.body;
      await authService.requestPasswordReset(email);

      sendResponse(res, {
        message: 'If the email matches an active account, a password reset link has been dispatched.'
      });
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token, newPassword } = req.body;
      await authService.resetPassword(token, newPassword);

      sendResponse(res, {
        message: 'Password has been reset successfully.'
      });
    } catch (error) {
      next(error);
    }
  }

  async verifyEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token } = req.body;
      await authService.verifyEmail(token);

      sendResponse(res, {
        message: 'Email verified successfully.'
      });
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = getTenantUserId() || '';
      
      await authService.changePassword(userId, currentPassword, newPassword);

      sendResponse(res, {
        message: 'Password changed successfully. Please log in again.'
      });
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
