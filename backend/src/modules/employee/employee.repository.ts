import { User, Role, Prisma } from '@prisma/client';
import { prisma } from '../../config/database';
import { getTenantShopId } from '../../common/context/tenant.context';

export class EmployeeRepository {
  async findAll(shopId?: string): Promise<(User & { role: Role | null })[]> {
    const effectiveShopId = shopId || getTenantShopId();
    return prisma.user.findMany({
      where: {
        ...(effectiveShopId ? { shopId: effectiveShopId } : {}),
        deletedAt: null
      },
      include: { role: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findById(id: string, shopId?: string): Promise<(User & { role: Role | null }) | null> {
    const effectiveShopId = shopId || getTenantShopId();
    return prisma.user.findFirst({
      where: {
        id,
        ...(effectiveShopId ? { shopId: effectiveShopId } : {}),
        deletedAt: null
      },
      include: { role: true }
    });
  }

  async create(data: Prisma.UserCreateInput): Promise<User> {
    return prisma.user.create({
      data
    });
  }

  async update(id: string, data: Prisma.UserUpdateInput, shopId?: string): Promise<User> {
    const effectiveShopId = shopId || getTenantShopId();
    if (effectiveShopId) {
      const existing = await prisma.user.findFirst({
        where: { id, shopId: effectiveShopId, deletedAt: null }
      });
      if (!existing) {
        throw new Error('Employee not found or access denied');
      }
    }

    return prisma.user.update({
      where: { id },
      data
    });
  }

  async delete(id: string, shopId?: string): Promise<User> {
    const effectiveShopId = shopId || getTenantShopId();
    if (effectiveShopId) {
      const existing = await prisma.user.findFirst({
        where: { id, shopId: effectiveShopId, deletedAt: null }
      });
      if (!existing) {
        throw new Error('Employee not found or access denied');
      }
    }

    return prisma.user.update({
      where: { id },
      data: {
        deletedAt: new Date()
      }
    });
  }

  async checkDuplicate(
    email: string,
    username: string,
    shopId?: string,
    excludeId?: string
  ): Promise<User | null> {
    const effectiveShopId = shopId || getTenantShopId();
    return prisma.user.findFirst({
      where: {
        ...(effectiveShopId ? { shopId: effectiveShopId } : {}),
        deletedAt: null,
        OR: [
          { email },
          { username }
        ],
        NOT: excludeId ? { id: excludeId } : undefined
      }
    });
  }
}

export const employeeRepository = new EmployeeRepository();
