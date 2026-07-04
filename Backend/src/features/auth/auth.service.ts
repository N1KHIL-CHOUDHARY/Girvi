import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import type { Prisma } from '@prisma/client';
import { prisma } from '../../config/prisma.js';
import { ApiError } from '../../lib/errors.js';
import { DEFAULT_ROLE_PERMISSIONS, normalizeRoleName, toPermissionJson } from '../../lib/permissions.js';
import { issueAccessToken, issueOAuthState, verifyOAuthState } from '../../lib/tokens.js';
import { decryptText, encryptText } from '../../lib/encryption.js';
import { logActivity } from '../../lib/activity.js';
import type {
  AuthResponse,
  AuthSession,
  ChangePasswordBody,
  GoogleOAuthBody,
  LoginBody,
  OAuthStateResponse,
  ProfileResponse,
  SignupBody,
  UserSummary,
} from './auth.types.js';

const googleAuth = new OAuth2Client();

const resolveLanguage = (language?: string): 'en' | 'hi' | 'ta' => {
  if (language === 'hi' || language === 'ta') {
    return language;
  }
  return 'en';
};

const mapUserSummary = (
  user: {
    id: string;
    shopId: string;
    role: 'OWNER' | 'WORKER';
    fullName: string;
    email: string;
    language: string;
    roleRef: {
      permissions: unknown;
    } | null;
  }
): UserSummary => {
  const permissions = user.roleRef && typeof user.roleRef.permissions === 'object' && user.roleRef.permissions !== null ? (user.roleRef.permissions as AuthSession['permissions']) : DEFAULT_ROLE_PERMISSIONS[user.role === 'OWNER' ? 'owner' : 'worker'];

  return {
    id: user.id,
    shopId: user.shopId,
    role: user.role === 'OWNER' ? 'owner' : 'worker',
    full_name: user.fullName,
    email: user.email,
    language: resolveLanguage(user.language),
    permissions,
  };
};

const resolveRole = async (shopId: string, roleName: 'owner' | 'worker') => {
  const normalizedName = normalizeRoleName(roleName);
  let role = await prisma.role.findFirst({
    where: { shopId, name: normalizedName },
    select: { id: true, permissions: true, isOwnerRole: true },
  });

  if (!role) {
    role = await prisma.role.create({
      data: {
        shopId,
        name: normalizedName,
        isOwnerRole: roleName === 'owner',
        permissions: toPermissionJson(DEFAULT_ROLE_PERMISSIONS[roleName]),
      },
      select: { id: true, permissions: true, isOwnerRole: true },
    });
  }

  return role;
};

const resolveRoleInTransaction = async (
  tx: Prisma.TransactionClient,
  shopId: string,
  roleName: 'owner' | 'worker'
) => {
  const normalizedName = normalizeRoleName(roleName);
  let role = await tx.role.findFirst({
    where: { shopId, name: normalizedName },
    select: { id: true, permissions: true, isOwnerRole: true },
  });

  if (!role) {
    role = await tx.role.create({
      data: {
        shopId,
        name: normalizedName,
        isOwnerRole: roleName === 'owner',
        permissions: toPermissionJson(DEFAULT_ROLE_PERMISSIONS[roleName]),
      },
      select: { id: true, permissions: true, isOwnerRole: true },
    });
  }

  return role;
};

const buildSession = (
  user: {
    id: string;
    shopId: string;
    role: 'OWNER' | 'WORKER';
    roleId: string | null;
    roleRef: { permissions: unknown } | null;
  }
): AuthSession => ({
  userId: user.id,
  shopId: user.shopId,
  role: user.role === 'OWNER' ? 'owner' : 'worker',
  roleId: user.roleId,
  permissions:
    user.roleRef && typeof user.roleRef.permissions === 'object' && user.roleRef.permissions !== null
      ? (user.roleRef.permissions as AuthSession['permissions'])
      : DEFAULT_ROLE_PERMISSIONS[user.role === 'OWNER' ? 'owner' : 'worker'],
});

export const createOAuthState = async (): Promise<OAuthStateResponse> => {
  const nonce = bcrypt.genSaltSync(6).replace(/[^a-zA-Z0-9]/g, '');
  return { state: issueOAuthState({ nonce }) };
};

export const signup = async (body: SignupBody): Promise<AuthResponse> => {
  const email = body.email.toLowerCase();
  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    throw new ApiError(409, 'Unable to create user. Email already exists.');
  }

  const passwordHash = await bcrypt.hash(body.password, 10);

  const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const shop = await tx.shop.create({
      data: {
        shopName: body.shop_name,
      },
    });

    const role = await tx.role.create({
      data: {
        shopId: shop.id,
        name: normalizeRoleName('owner'),
        isOwnerRole: true,
        permissions: toPermissionJson(DEFAULT_ROLE_PERMISSIONS.owner),
      },
      select: { id: true, permissions: true },
    });

    const user = await tx.user.create({
      data: {
        shopId: shop.id,
        roleId: role.id,
        email,
        passwordHash,
        fullName: body.full_name,
        role: 'OWNER',
        language: resolveLanguage(body.language),
      },
      select: {
        id: true,
        shopId: true,
        role: true,
        roleId: true,
        fullName: true,
        email: true,
        language: true,
        roleRef: { select: { permissions: true } },
      },
    });

    await tx.shop.update({
      where: { id: shop.id },
      data: { ownerId: user.id },
    });

    return user;
  });

  const token = issueAccessToken(buildSession(result));

  return {
    token,
    user: mapUserSummary(result),
  };
};

export const login = async (body: LoginBody): Promise<AuthResponse> => {
  const user = await prisma.user.findUnique({
    where: { email: body.email.toLowerCase() },
    select: {
      id: true,
      shopId: true,
      role: true,
      roleId: true,
      fullName: true,
      email: true,
      language: true,
      passwordHash: true,
      roleRef: { select: { permissions: true } },
    },
  });

  if (!user) {
    throw new ApiError(401, 'Invalid credentials.');
  }

  const isValid = await bcrypt.compare(body.password, user.passwordHash);
  if (!isValid) {
    throw new ApiError(401, 'Invalid credentials.');
  }

  const session = buildSession(user);
  return {
    token: issueAccessToken(session),
    user: mapUserSummary(user),
  };
};

export const logout = async (): Promise<void> => {
  return;
};

export const changePassword = async (session: AuthSession, body: ChangePasswordBody): Promise<void> => {
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, passwordHash: true },
  });

  if (!user) {
    throw new ApiError(404, 'User not found.');
  }

  const isValid = await bcrypt.compare(body.currentPassword, user.passwordHash);
  if (!isValid) {
    throw new ApiError(401, 'Incorrect current password.');
  }

  const passwordHash = await bcrypt.hash(body.newPassword, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash },
  });
};

export const getProfile = async (session: AuthSession): Promise<ProfileResponse> => {
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      shopId: true,
      role: true,
      fullName: true,
      email: true,
      language: true,
      roleRef: { select: { permissions: true } },
    },
  });

  if (!user) {
    throw new ApiError(404, 'User not found.');
  }

  return { user: mapUserSummary(user) };
};

export const updatePreferences = async (session: AuthSession, language: 'en' | 'hi' | 'ta'): Promise<ProfileResponse> => {
  const user = await prisma.user.update({
    where: { id: session.userId },
    data: { language },
    select: {
      id: true,
      shopId: true,
      role: true,
      fullName: true,
      email: true,
      language: true,
      roleRef: { select: { permissions: true } },
    },
  });

  return { user: mapUserSummary(user) };
};

export const googleLogin = async (body: GoogleOAuthBody): Promise<AuthResponse> => {
  verifyOAuthState(body.state);

  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    throw new ApiError(500, 'Google OAuth is not configured.');
  }

  const ticket = await googleAuth.verifyIdToken({
    idToken: body.idToken,
    audience: clientId,
  });

  const payload = ticket.getPayload();
  if (!payload || !payload.email || !payload.email_verified) {
    throw new ApiError(401, 'Google account verification failed.');
  }

  const providerSubject = payload.sub;
  const email = payload.email.toLowerCase();
  const displayName = payload.name?.trim() || email.split('@')[0];
  const profile = {
    name: payload.name ?? null,
    picture: payload.picture ?? null,
    email: payload.email,
  };

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ providerSubject }, { email }],
    },
    select: {
      id: true,
      shopId: true,
      role: true,
      roleId: true,
      fullName: true,
      email: true,
      language: true,
      provider: true,
      providerSubject: true,
      roleRef: { select: { permissions: true } },
    },
  });

  if (existingUser) {
    const linkedUser = await prisma.user.update({
      where: { id: existingUser.id },
      data: {
        provider: 'GOOGLE',
        providerSubject,
        oauthProfile: profile,
      },
      select: {
        id: true,
        shopId: true,
        role: true,
        roleId: true,
        fullName: true,
        email: true,
        language: true,
        roleRef: { select: { permissions: true } },
      },
    });

    return {
      token: issueAccessToken(buildSession(linkedUser)),
      user: mapUserSummary(linkedUser),
    };
  }

  const passwordHash = await bcrypt.hash(cryptoRandomPassword(), 10);
  const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const shop = await tx.shop.create({
      data: {
        shopName: displayName,
      },
    });

    const role = await resolveRoleInTransaction(tx, shop.id, 'owner');

    const user = await tx.user.create({
      data: {
        shopId: shop.id,
        roleId: role.id,
        email,
        passwordHash,
        fullName: displayName,
        role: 'OWNER',
        provider: 'GOOGLE',
        providerSubject,
        oauthProfile: profile,
      },
      select: {
        id: true,
        shopId: true,
        role: true,
        roleId: true,
        fullName: true,
        email: true,
        language: true,
        roleRef: { select: { permissions: true } },
      },
    });

    await tx.shop.update({
      where: { id: shop.id },
      data: { ownerId: user.id },
    });

    return user;
  });

  return {
    token: issueAccessToken(buildSession(result)),
    user: mapUserSummary(result),
  };
};

const cryptoRandomPassword = (): string => {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
};
