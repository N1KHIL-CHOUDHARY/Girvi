import type { Response } from 'express';
import { ApiError } from '../../lib/errors';
import { asyncHandler, sendSuccess } from '../../lib/http';
import type { PreferencesBody } from './app.types';
import { getMe, updatePreferences } from './app.service';

export const getMeController = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(401, 'Not authorized. Token missing.');
  }

  const data = await getMe(req.user);
  sendSuccess(res, {
    message: 'User profile fetched successfully.',
    data,
  });
});

export const updatePreferencesController = asyncHandler<unknown, unknown, PreferencesBody>(async (req, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, 'Not authorized. Token missing.');
  }

  const data = await updatePreferences(req.user, req.body.language);
  sendSuccess(res, {
    message: 'Preferences updated successfully.',
    data,
  });
});
