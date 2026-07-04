import type { Request, Response } from 'express';
import { asyncHandler, sendSuccess } from '../../lib/http';
import { ApiError } from '../../lib/errors';
import { issueOAuthState } from '../../lib/tokens';
import {
  changePassword,
  createOAuthState,
  getProfile,
  googleLogin,
  login,
  logout,
  signup,
  updatePreferences,
} from './auth.service';
import type {
  AuthResponse,
  ChangePasswordBody,
  GoogleOAuthBody,
  LoginBody,
  OAuthStateResponse,
  ProfileResponse,
  SignupBody,
} from './auth.types';

export const signupController = asyncHandler<unknown, AuthResponse, SignupBody>(async (_req, res: Response<AuthResponse>) => {
  const result = await signup(_req.body);
  sendSuccess(res, {
    status: 201,
    message: 'Signup successful.',
    data: result,
  });
});

export const loginController = asyncHandler<unknown, AuthResponse, LoginBody>(async (req, res: Response<AuthResponse>) => {
  const result = await login(req.body);
  sendSuccess(res, {
    message: 'Login successful.',
    data: result,
  });
});

export const logoutController = asyncHandler(async (_req, res) => {
  await logout();
  sendSuccess(res, {
    message: 'Logout successful.',
  });
});

export const changePasswordController = asyncHandler<unknown, { message: string }, ChangePasswordBody>(async (req, res) => {
  if (!req.user) {
    throw new ApiError(401, 'Not authorized. Token missing.');
  }

  await changePassword(req.user, req.body);
  sendSuccess(res, {
    message: 'Password changed successfully.',
  });
});

export const getOAuthStateController = asyncHandler(async (_req, res: Response<OAuthStateResponse>) => {
  const result = await createOAuthState();
  sendSuccess(res, {
    message: 'OAuth state generated successfully.',
    data: result,
  });
});

export const googleLoginController = asyncHandler<unknown, AuthResponse, GoogleOAuthBody>(async (req, res: Response<AuthResponse>) => {
  const result = await googleLogin(req.body);
  sendSuccess(res, {
    message: 'Google login successful.',
    data: result,
  });
});

export const getMeController = asyncHandler(async (req, res: Response<ProfileResponse>) => {
  if (!req.user) {
    throw new ApiError(401, 'Not authorized. Token missing.');
  }

  const result = await getProfile(req.user);
  sendSuccess(res, {
    message: 'User profile fetched successfully.',
    data: result,
  });
});

export const updatePreferencesController = asyncHandler(async (req, res: Response<ProfileResponse>) => {
  if (!req.user) {
    throw new ApiError(401, 'Not authorized. Token missing.');
  }

  const { language } = req.body as { language?: 'en' | 'hi' | 'ta' };
  if (language !== 'en' && language !== 'hi' && language !== 'ta') {
    throw new ApiError(400, 'Invalid language. Use one of: en, hi, ta.');
  }

  const result = await updatePreferences(req.user, language);
  sendSuccess(res, {
    message: 'Preferences updated successfully.',
    data: result,
  });
});
