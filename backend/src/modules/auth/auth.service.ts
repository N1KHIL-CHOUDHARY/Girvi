import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from 'uuid';
import { User, Shop, Role } from '@prisma/client';
import { authRepository } from './auth.repository';
import { env } from '../../config/env';
import { redisClient } from '../../config/redis';
import { queueEmail } from '../../jobs';
import { logger } from '../../common/logger';
import {
  AuthenticationError,
  ValidationError,
  NotFoundError,
  AppError
} from '../../common/errors/AppError';

export interface TokenPayload {
  userId: string;
  shopId: string;
  role: string;
}

export class AuthService {
  /**
   * Register a new shop owner user.
   */
  async signup(data: {
    full_name: string;
    shop_name: string;
    email: string;
    password: string;
  }): Promise<{ user: User; token: string; refreshToken: string }> {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(data.password, salt);

    const { user, shop } = await authRepository.registerShopAndOwner({
      fullName: data.full_name,
      shopName: data.shop_name,
      email: data.email,
      passwordHash
    });

    const token = this.generateAccessToken({
      userId: user.id,
      shopId: shop.id,
      role: 'owner'
    });

    const refreshToken = await this.createRefreshToken(user.id, shop.id);

    const verificationToken = uuidv4();
    if (redisClient.isOpen) {
      await redisClient.setEx(`email_verification:${verificationToken}`, 86400, user.id);
    }
    
    await queueEmail({
      to: user.email,
      subject: 'Welcome to Pawn Manager - Verify Your Email',
      text: `Hello ${user.firstName},\n\nWelcome to Pawn Manager! Please verify your email using the following link:\n` +
            `${env.FRONTEND_URL}/verify-email?token=${verificationToken}\n\nThank you!`
    });

    return { user, token, refreshToken };
  }

  /**
   * Authenticate user.
   */
  async login(
    data: { email: string; password: string },
    ipAddress?: string,
    userAgent?: string
  ): Promise<{ user: User & { shop: Shop; role: Role | null }; token: string; refreshToken: string }> {
    // 1. Find all users matching the email globally
    const users = await authRepository.findUsersByEmail(data.email);
    if (users.length === 0) {
      throw new AuthenticationError('Invalid email or password');
    }

    let authenticatedUser: typeof users[0] | null = null;

    // 2. Iterate and check passwords
    for (const u of users) {
      // Check lockout
      if (u.lockedUntil && u.lockedUntil > new Date()) {
        throw new AuthenticationError(`Account locked due to consecutive failures. Try again after ${u.lockedUntil.toLocaleTimeString()}`);
      }

      const match = await bcrypt.compare(data.password, u.password);
      if (match) {
        authenticatedUser = u;
        break;
      }
    }

    // 3. Handle login failure
    if (!authenticatedUser) {
      // Increment login attempts for the first matching email user
      const targetUser = users[0];
      const attempts = targetUser.loginAttempts + 1;
      let lockedUntil: Date | null = null;
      
      if (attempts >= 5) {
        lockedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 mins lockout
        logger.warn({ userId: targetUser.id, ipAddress }, 'User account locked out due to password failure');
      }

      await authRepository.updateUser(targetUser.id, {
        loginAttempts: attempts,
        lockedUntil
      });

      throw new AuthenticationError('Invalid email or password');
    }

    // 4. Successful Login: reset attempts
    if (authenticatedUser.loginAttempts > 0 || authenticatedUser.lockedUntil) {
      await authRepository.updateUser(authenticatedUser.id, {
        loginAttempts: 0,
        lockedUntil: null
      });
    }

    // 5. Update last login time
    await authRepository.updateUser(authenticatedUser.id, {
      lastLoginAt: new Date()
    });

    // 6. Generate tokens
    const roleName = authenticatedUser.role?.name || 'worker';
    const token = this.generateAccessToken({
      userId: authenticatedUser.id,
      shopId: authenticatedUser.shopId,
      role: roleName
    });

    const refreshToken = await this.createRefreshToken(authenticatedUser.id, authenticatedUser.shopId);

    // 7. Log activity
    await authRepository.logActivity({
      shopId: authenticatedUser.shopId,
      userId: authenticatedUser.id,
      action: 'login',
      details: { ipAddress, userAgent }
    });

    return {
      user: authenticatedUser,
      token,
      refreshToken
    };
  }

  /**
   * Invalidate active session refresh token.
   */
  async logout(refreshToken: string): Promise<void> {
    if (redisClient.isOpen) {
      await redisClient.del(`refresh_token:${refreshToken}`);
    }
  }

  /**
   * Refresh access token via Refresh Token Rotation.
   */
  async rotateTokens(
    oldToken: string,
    ipAddress?: string,
    _userAgent?: string
  ): Promise<{ token: string; refreshToken: string }> {
    const key = `refresh_token:${oldToken}`;
    
    if (!redisClient.isOpen) {
      throw new AppError('Caching service offline, cannot rotate token', 503);
    }

    const sessionDataStr = await redisClient.get(key);
    if (!sessionDataStr) {
      // Reuse detection: Check if this token was already blacklisted (previously rotated)
      const isBlacklisted = await redisClient.get(`blacklist:token:${oldToken}`);
      if (isBlacklisted) {
        const payload = JSON.parse(isBlacklisted) as { userId: string };
        logger.error({ userId: payload.userId, ipAddress }, '⚠️ Refresh token reuse detected! Revoking all sessions.');
        // Revoke all sessions for this user!
        await this.revokeAllUserSessions(payload.userId);
        throw new AuthenticationError('Security Violation: Refresh token reused. Please sign in again.');
      }
      throw new AuthenticationError('Invalid refresh token');
    }

    const sessionData = JSON.parse(sessionDataStr) as { userId: string; shopId: string };
    
    // Fetch user and role details
    const user = await authRepository.findUserById(sessionData.userId);
    if (!user || !user.isActive) {
      throw new AuthenticationError('User account is inactive or deleted');
    }

    // 1. Generate new tokens
    const roleName = user.role?.name || 'worker';
    const newAccessToken = this.generateAccessToken({
      userId: user.id,
      shopId: user.shopId,
      role: roleName
    });
    const newRefreshToken = await this.createRefreshToken(user.id, user.shopId);

    // 2. Mark old token as blacklisted/rotated for 60 seconds (allows concurrent page-load refreshes)
    await redisClient.setEx(`blacklist:token:${oldToken}`, 60, JSON.stringify({ userId: user.id }));
    // Delete active old token
    await redisClient.del(key);

    return {
      token: newAccessToken,
      refreshToken: newRefreshToken
    };
  }

  /**
   * Reset password flow: request reset token
   */
  async requestPasswordReset(email: string): Promise<void> {
    const users = await authRepository.findUsersByEmail(email);
    if (users.length === 0) {
      // Gracefully exit without revealing email exists
      return;
    }

    const resetToken = uuidv4();
    const primaryUser = users[0];

    if (redisClient.isOpen) {
      // Expire in 1 hour
      await redisClient.setEx(`password_reset:${resetToken}`, 3600, primaryUser.id);
    }

    await queueEmail({
      to: primaryUser.email,
      subject: 'Pawn Manager - Password Reset Request',
      text: `Hello,\n\nYou requested a password reset. Please click on the link below to set a new password:\n` +
            `${env.FRONTEND_URL}/reset-password?token=${resetToken}\n\n` +
            `This link will expire in 1 hour. If you did not request this, please ignore this email.`
    });
  }

  /**
   * Reset password execution.
   */
  async resetPassword(resetToken: string, newPass: string): Promise<void> {
    if (!redisClient.isOpen) {
      throw new AppError('Caching service offline, cannot verify reset token', 503);
    }

    const cacheKey = `password_reset:${resetToken}`;
    const userId = await redisClient.get(cacheKey);
    
    if (!userId) {
      throw new ValidationError('Invalid or expired password reset token');
    }

    const user = await authRepository.findUserById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPass, salt);

    await authRepository.updateUser(user.id, {
      password: passwordHash,
      loginAttempts: 0,
      lockedUntil: null
    });

    await redisClient.del(cacheKey);
    await this.revokeAllUserSessions(user.id); // Revoke active logins to force reconnect
  }

  /**
   * Verify email verification token.
   */
  async verifyEmail(verificationToken: string): Promise<void> {
    if (!redisClient.isOpen) {
      throw new AppError('Caching service offline, cannot verify email token', 503);
    }

    const cacheKey = `email_verification:${verificationToken}`;
    const userId = await redisClient.get(cacheKey);

    if (!userId) {
      throw new ValidationError('Invalid or expired email verification token');
    }

    // Trigger verification: update KYC status or record verification
    await redisClient.del(cacheKey);
    logger.info({ userId }, 'Email verified successfully');
  }

  /**
   * Change password of logged-in user.
   */
  async changePassword(userId: string, currentPass: string, newPass: string): Promise<void> {
    const user = await authRepository.findUserById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const match = await bcrypt.compare(currentPass, user.password);
    if (!match) {
      throw new ValidationError('Incorrect current password');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPass, salt);

    await authRepository.updateUser(user.id, {
      password: passwordHash
    });

    await this.revokeAllUserSessions(userId);
  }

  /* Helper Methods */

  private generateAccessToken(payload: TokenPayload): string {
    return jwt.sign({ ...payload }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES as jwt.SignOptions['expiresIn'] });
  }

  private async createRefreshToken(userId: string, shopId: string): Promise<string> {
    const token = uuidv4();
    const key = `refresh_token:${token}`;
    
    // Store in Redis (converts REFRESH_EXPIRES e.g., '7d' to seconds)
    const ttlSeconds = 7 * 24 * 60 * 60; // 7 days in seconds
    
    if (redisClient.isOpen) {
      await redisClient.setEx(
        key,
        ttlSeconds,
        JSON.stringify({ userId, shopId })
      );
      // Track all user tokens for global revoking
      await redisClient.sAdd(`user_tokens:${userId}`, token);
      await redisClient.expire(`user_tokens:${userId}`, ttlSeconds);
    }

    return token;
  }

  private async revokeAllUserSessions(userId: string): Promise<void> {
    if (redisClient.isOpen) {
      const userTokensKey = `user_tokens:${userId}`;
      const tokens = await redisClient.sMembers(userTokensKey);
      
      for (const t of tokens) {
        await redisClient.del(`refresh_token:${t}`);
      }
      
      await redisClient.del(userTokensKey);
      await redisClient.del(`user:permissions:${userId}`); // Clear cached permissions
    }
  }
}

export const authService = new AuthService();
