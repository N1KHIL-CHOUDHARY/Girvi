import { prisma } from '../../config/prisma.js';
import { ApiError } from '../../lib/errors.js';
import { DEFAULT_ROLE_PERMISSIONS, normalizeRoleName, toPermissionJson } from '../../lib/permissions.js';
import type { AuthSession } from '../auth/auth.types.js';
import type { RoleBody, RoleRecord } from './role.types.js';

const mapRole = (role: {
  id: string;
  shopId: string;
  name: string;
  isOwnerRole: boolean;
  permissions: unknown;
  createdAt: Date;
  updatedAt: Date;
}): RoleRecord => ({
  id: role.id,
  shopId: role.shopId,
  name: role.name,
  isOwnerRole: role.isOwnerRole,
  permissions: role.permissions as RoleRecord['permissions'],
  createdAt: role.createdAt.toISOString(),
  updatedAt: role.updatedAt.toISOString(),
});

const validateShopContext = (session: AuthSession): string => {
  if (!session.shopId) {
    throw new ApiError(400, 'Shop context missing.');
  }
  return session.shopId;
};

export const getRoles = async (session: AuthSession): Promise<RoleRecord[]> => {
  const roles = await prisma.role.findMany({
    where: { shopId: validateShopContext(session) },
    orderBy: [{ isOwnerRole: 'desc' }, { createdAt: 'asc' }],
  });

  return roles.map(mapRole);
};

export const createRole = async (session: AuthSession, body: RoleBody): Promise<RoleRecord> => {
  const shopId = validateShopContext(session);
  const normalizedName = normalizeRoleName(body.name);

  if (normalizedName.toLowerCase() === 'owner') {
    throw new ApiError(400, 'Owner role already exists.');
  }

  const existingRole = await prisma.role.findFirst({
    where: {
      shopId,
      name: normalizedName,
    },
    select: { id: true },
  });

  if (existingRole) {
    throw new ApiError(409, 'Role name already in use.');
  }

  const role = await prisma.role.create({
    data: {
      shopId,
      name: normalizedName,
      isOwnerRole: false,
      permissions: toPermissionJson({
        ...DEFAULT_ROLE_PERMISSIONS.worker,
        ...(body.permissions ?? {}),
      }),
    },
  });

  return mapRole(role);
};

export const updateRole = async (session: AuthSession, roleId: string, body: RoleBody): Promise<RoleRecord> => {
  const shopId = validateShopContext(session);
  const role = await prisma.role.findFirst({
    where: { id: roleId, shopId },
  });

  if (!role) {
    throw new ApiError(404, 'Role not found.');
  }

  if (role.isOwnerRole) {
    throw new ApiError(400, 'Owner role cannot be updated.');
  }

  const normalizedName = normalizeRoleName(body.name);
  if (normalizedName.toLowerCase() === 'owner') {
    throw new ApiError(400, 'Owner role cannot be renamed.');
  }

  const duplicate = await prisma.role.findFirst({
    where: {
      shopId,
      name: normalizedName,
      id: { not: roleId },
    },
    select: { id: true },
  });

  if (duplicate) {
    throw new ApiError(409, 'Role name already in use.');
  }

  const updated = await prisma.role.update({
    where: { id: roleId },
    data: {
      name: normalizedName,
      permissions: toPermissionJson({
        ...DEFAULT_ROLE_PERMISSIONS.worker,
        ...(body.permissions ?? {}),
      }),
    },
  });

  return mapRole(updated);
};

export const deleteRole = async (session: AuthSession, roleId: string): Promise<{ roleId: string }> => {
  const shopId = validateShopContext(session);
  const role = await prisma.role.findFirst({
    where: { id: roleId, shopId },
    select: { id: true, isOwnerRole: true },
  });

  if (!role) {
    throw new ApiError(404, 'Role not found.');
  }

  if (role.isOwnerRole) {
    throw new ApiError(400, 'Owner role cannot be deleted.');
  }

  const assignedUsers = await prisma.user.count({
    where: { roleId },
  });

  if (assignedUsers > 0) {
    throw new ApiError(409, 'Role is assigned to users and cannot be deleted.');
  }

  await prisma.role.delete({ where: { id: roleId } });
  return { roleId };
};
