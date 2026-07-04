import type { AuthSession } from '../auth/auth.types';
import { getProfile, updatePreferences as updateAuthPreferences } from '../auth/auth.service';

export const getMe = async (session: AuthSession) => {
  return getProfile(session);
};

export const updatePreferences = async (session: AuthSession, language: 'en' | 'hi' | 'ta') => {
  return updateAuthPreferences(session, language);
};
