import jwt, { type JwtPayload } from 'jsonwebtoken';
import { ApiError } from './errors';
import type { AuthSession, OAuthStatePayload } from '../features/auth/auth.types';

const resolveSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is required.');
  }
  return secret;
};

interface AccessTokenPayload extends JwtPayload, AuthSession {}

interface OAuthStateClaims extends JwtPayload, OAuthStatePayload {
  purpose: 'google-oauth';
}

const isObject = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;

const isAccessTokenPayload = (value: unknown): value is AccessTokenPayload => {
  return isObject(value) && typeof value.userId === 'string' && typeof value.shopId === 'string' && typeof value.role === 'string' && (typeof value.roleId === 'string' || value.roleId === null) && isObject(value.permissions);
};

const isOAuthStateClaims = (value: unknown): value is OAuthStateClaims => {
  return isObject(value) && value.purpose === 'google-oauth' && typeof value.nonce === 'string';
};

export const issueAccessToken = (session: AuthSession): string => {
  return jwt.sign(session, resolveSecret(), { expiresIn: '7d' });
};

export const verifyAccessToken = (token: string): AuthSession => {
  const decoded = jwt.verify(token, resolveSecret());
  if (!isAccessTokenPayload(decoded)) {
    throw new ApiError(401, 'Not authorized. Token invalid.');
  }

  return {
    userId: decoded.userId,
    shopId: decoded.shopId,
    role: decoded.role,
    roleId: decoded.roleId,
    permissions: decoded.permissions,
  };
};

export const issueOAuthState = (payload: OAuthStatePayload): string => {
  return jwt.sign({ purpose: 'google-oauth', ...payload }, resolveSecret(), { expiresIn: '10m' });
};

export const verifyOAuthState = (state: string): OAuthStatePayload => {
  const decoded = jwt.verify(state, resolveSecret());
  if (!isOAuthStateClaims(decoded)) {
    throw new ApiError(401, 'OAuth state is invalid.');
  }

  return {
    nonce: decoded.nonce,
    redirectUri: typeof decoded.redirectUri === 'string' ? decoded.redirectUri : undefined,
  };
};
