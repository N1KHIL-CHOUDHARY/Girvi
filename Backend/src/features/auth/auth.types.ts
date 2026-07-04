import type { PermissionSet, UserRole } from '../../lib/permissions';

export type LanguageCode = 'en' | 'hi' | 'ta';
export type AuthProvider = 'LOCAL' | 'GOOGLE';

export interface SignupBody {
  shop_name: string;
  full_name: string;
  email: string;
  password: string;
  language?: LanguageCode;
}

export interface LoginBody {
  email: string;
  password: string;
}

export interface ChangePasswordBody {
  currentPassword: string;
  newPassword: string;
}

export interface GoogleOAuthBody {
  idToken: string;
  state: string;
}

export interface OAuthStatePayload {
  nonce: string;
  redirectUri?: string;
}

export interface AuthSession {
  userId: string;
  shopId: string;
  role: UserRole;
  roleId: string | null;
  permissions: PermissionSet;
}

export interface UserSummary {
  id: string;
  shopId: string;
  role: UserRole;
  full_name: string;
  email: string;
  language: LanguageCode;
  permissions: PermissionSet;
}

export interface AuthResponse {
  token: string;
  user: UserSummary;
}

export interface ProfileResponse {
  user: UserSummary;
}

export interface OAuthStateResponse {
  state: string;
}
