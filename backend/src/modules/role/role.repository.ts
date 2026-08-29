import { Role, Permission, Prisma } from '@prisma/client';
import { prisma } from '../../config/database';
import { getTenantShopId } from '../../common/context/tenant.context';

export class RoleRepository {
  async findAll(shopId?: string): Promise<(Role & { permissions: { permission: Permission }[] })[]> {
    const effectiveShopId = shopId || getTenantShopId();
    return prisma.role.findMany({
      where: effectiveShopId ? { shopId: effectiveShopId } : undefined,
      include: {
        permissions: {
          include: {
            permission: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });
  }

  async findById(id: string, shopId?: string): Promise<(Role & { permissions: { permission: Permission }[] }) | null> {
    const effectiveShopId = shopId || getTenantShopId();
    return prisma.role.findFirst({
      where: {
        id,
        ...(effectiveShopId ? { shopId: effectiveShopId } : {})
      },
      include: {
        permissions: {
          include: {
            permission: true
          }
        }
      }
    });
  }

  async findByName(name: string, shopId?: string): Promise<Role | null> {
    const effectiveShopId = shopId || getTenantShopId();
    return prisma.role.findFirst({
      where: {
        name: name.toLowerCase().trim(),
        ...(effectiveShopId ? { shopId: effectiveShopId } : {})
      }
    });
  }

  async create(data: Prisma.RoleCreateInput): Promise<Role> {
    return prisma.role.create({
      data
    });
  }

  async update(id: string, data: { name?: string; description?: string }, shopId?: string): Promise<Role> {
    const effectiveShopId = shopId || getTenantShopId();
    if (effectiveShopId) {
      const existing = await prisma.role.findFirst({
        where: { id, shopId: effectiveShopId }
      });
      if (!existing) {
        throw new Error('Role not found or access denied');
      }
    }

    return prisma.role.update({
      where: { id },
      data
    });
  }

  async delete(id: string, shopId?: string): Promise<Role> {
    const effectiveShopId = shopId || getTenantShopId();
    if (effectiveShopId) {
      const existing = await prisma.role.findFirst({
        where: { id, shopId: effectiveShopId }
      });
      if (!existing) {
        throw new Error('Role not found or access denied');
      }
    }

    return prisma.role.delete({
      where: { id }
    });
  }
}

export const roleRepository = new RoleRepository();
export default roleRepository;
