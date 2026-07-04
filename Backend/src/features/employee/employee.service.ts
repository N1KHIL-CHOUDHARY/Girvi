import bcrypt from 'bcryptjs';
import { prisma } from '../../config/prisma';
import { ApiError } from '../../lib/errors';
import { DEFAULT_ROLE_PERMISSIONS, normalizeRoleName } from '../../lib/permissions';
import type { AuthSession } from '../auth/auth.types';
import type { EmployeeBody, EmployeeRecord, EmployeeUpdateBody } from './employee.types';

const mapEmployee = (user: {
  id: string;
  fullName: string;
  email: string;
  role: 'OWNER' | 'WORKER';
  roleId: string | null;
}): EmployeeRecord => ({
  id: user.id,
  full_name: user.fullName,
  email: user.email,
  role: user.role === 'OWNER' ? 'owner' : 'worker',
  role_id: user.roleId,
});

const getShopId = (session: AuthSession): string => session.shopId;

const getOrCreateWorkerRole = async (shopId: string) => {
  const existing = await prisma.role.findFirst({
    where: { shopId, name: normalizeRoleName('worker') },
    select: { id: true, isOwnerRole: true },
  });

  if (existing) {
    return existing;
  }

  return prisma.role.create({
    data: {
      shopId,
      name: normalizeRoleName('worker'),
      isOwnerRole: false,
      permissions: DEFAULT_ROLE_PERMISSIONS.worker,
    },
    select: { id: true, isOwnerRole: true },
  });
};

export const listEmployees = async (session: AuthSession): Promise<EmployeeRecord[]> => {
  const users = await prisma.user.findMany({
    where: {
      shopId: getShopId(session),
      role: 'WORKER',
    },
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
      roleId: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return users.map(mapEmployee);
};

export const createEmployee = async (session: AuthSession, body: EmployeeBody): Promise<EmployeeRecord> => {
  const shopId = getShopId(session);
  const email = body.email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    throw new ApiError(409, 'Unable to create employee. Email already in use.');
  }

  const role = body.roleId
    ? await prisma.role.findFirst({
        where: {
          id: body.roleId,
          shopId,
        },
        select: { id: true, isOwnerRole: true },
      })
    : await getOrCreateWorkerRole(shopId);

  if (!role) {
    throw new ApiError(400, 'Invalid role for this shop.');
  }

  if (role.isOwnerRole) {
    throw new ApiError(400, 'Owner role cannot be assigned as an employee role.');
  }

  const passwordHash = await bcrypt.hash(body.password, 10);
  const user = await prisma.user.create({
    data: {
      shopId,
      fullName: body.full_name,
      email,
      passwordHash,
      role: 'WORKER',
      roleId: role.id,
    },
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
      roleId: true,
    },
  });

  return mapEmployee(user);
};

export const updateEmployee = async (session: AuthSession, employeeId: string, body: EmployeeUpdateBody): Promise<EmployeeRecord> => {
  const shopId = getShopId(session);
  const employee = await prisma.user.findFirst({
    where: { id: employeeId, shopId },
    select: { id: true, role: true },
  });

  if (!employee) {
    throw new ApiError(404, 'Employee not found.');
  }

  if (employee.role === 'OWNER') {
    throw new ApiError(400, 'Owner cannot be modified via employee APIs.');
  }

  const updateData: {
    fullName?: string;
    email?: string;
    passwordHash?: string;
    roleId?: string | null;
  } = {};

  if (body.full_name) {
    updateData.fullName = body.full_name;
  }

  if (body.email) {
    updateData.email = body.email.toLowerCase();
  }

  if (body.password) {
    updateData.passwordHash = await bcrypt.hash(body.password, 10);
  }

  if (body.roleId) {
    const role = await prisma.role.findFirst({
      where: {
        id: body.roleId,
        shopId,
      },
      select: { id: true, isOwnerRole: true },
    });

    if (!role) {
      throw new ApiError(400, 'Invalid role for this shop.');
    }

    if (role.isOwnerRole) {
      throw new ApiError(400, 'Owner role cannot be assigned as an employee role.');
    }

    updateData.roleId = role.id;
  }

  const user = await prisma.user.update({
    where: { id: employeeId },
    data: updateData,
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
      roleId: true,
    },
  });

  return mapEmployee(user);
};

export const deleteEmployee = async (session: AuthSession, employeeId: string): Promise<{ employeeId: string }> => {
  const shopId = getShopId(session);
  const employee = await prisma.user.findFirst({
    where: { id: employeeId, shopId },
    select: { id: true, role: true },
  });

  if (!employee) {
    throw new ApiError(404, 'Employee not found.');
  }

  if (employee.role === 'OWNER') {
    throw new ApiError(400, 'Owner cannot be deleted.');
  }

  await prisma.user.delete({ where: { id: employeeId } });
  return { employeeId };
};
