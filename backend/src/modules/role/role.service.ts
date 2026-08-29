import { Role, Prisma } from '@prisma/client';
import { roleRepository } from './role.repository';
import { prisma } from '../../config/database';
import { redisClient } from '../../config/redis';
import { getTenantShopId, getTenantUserId } from '../../common/context/tenant.context';
import {
  ConflictError,
  NotFoundError,
  ValidationError,
  AppError
} from '../../common/errors/AppError';

export class RoleService {
  async getAllRoles(): Promise<(Role & { permissions: string[] })[]> {
    const shopId = getTenantShopId();
    const roles = await roleRepository.findAll(shopId);
    return roles.map((role) => ({
      ...role,
      permissions: role.permissions.map((rp) => rp.permission.code)
    }));
  }

  async getRoleById(id: string): Promise<Role & { permissions: string[] }> {
    const shopId = getTenantShopId();
    const role = await roleRepository.findById(id, shopId);
    if (!role) {
      throw new NotFoundError('Role not found');
    }
    return {
      ...role,
      permissions: role.permissions.map((rp) => rp.permission.code)
    };
  }

  async createRole(data: { name: string; description: string; permissions: string[] }): Promise<Role> {
    const shopId = getTenantShopId();
    if (!shopId) throw new AppError('Tenant context required', 400);

    // 1. Block duplicate name within shop
    const existing = await roleRepository.findByName(data.name, shopId);
    if (existing) {
      throw new ConflictError('A role with this name already exists in your shop');
    }

    // 2. Validate all permissions exist in database
    const dbPermissions = await prisma.permission.findMany({
      where: { code: { in: data.permissions } }
    });
    if (dbPermissions.length !== data.permissions.length) {
      throw new ValidationError('One or more selected permissions are invalid');
    }

    // 3. Atomically create role and role-permissions
    const role = await prisma.$transaction(async (tx) => {
      const roleData: Prisma.RoleCreateInput = {
        name: data.name.toLowerCase().trim(),
        description: data.description,
        shop: {
          connect: { id: shopId }
        }
      };

      const createdRole = await tx.role.create({
        data: roleData
      });

      await tx.rolePermission.createMany({
        data: dbPermissions.map((perm) => ({
          roleId: createdRole.id,
          permissionId: perm.id
        }))
      });

      return createdRole;
    });

    // 4. Audit
    const actorId = getTenantUserId();
    const createAuditData: Prisma.AuditLogCreateInput = {
      entityName: 'Role',
      entityId: role.id,
      action: 'create',
      newValue: { name: role.name, permissions: data.permissions },
      shop: {
        connect: { id: shopId }
      },
      ...(actorId
        ? {
            user: {
              connect: { id: actorId }
            }
          }
        : {})
    };
    await prisma.auditLog.create({
      data: createAuditData
    });

    return role;
  }

  async updateRole(id: string, data: { name?: string; description?: string; permissions?: string[] }): Promise<Role> {
    const shopId = getTenantShopId();
    const actorId = getTenantUserId();
    if (!shopId) throw new AppError('Tenant context required', 400);

    const role = await roleRepository.findById(id, shopId);
    if (!role) {
      throw new NotFoundError('Role not found');
    }

    // 1. Protect the owner role
    if (role.name === 'owner') {
      throw new ValidationError('The owner role is protected and cannot be modified');
    }

    // 2. Check duplicates within shop
    if (data.name && data.name.toLowerCase().trim() !== role.name) {
      const existing = await roleRepository.findByName(data.name, shopId);
      if (existing) {
        throw new ConflictError('A role with this name already exists in your shop');
      }
    }

    // 3. Update database
    const updatedRole = await prisma.$transaction(async (tx) => {
      const updated = await tx.role.update({
        where: { id },
        data: {
          name: data.name ? data.name.toLowerCase().trim() : undefined,
          description: data.description || undefined
        }
      });

      if (data.permissions) {
        // Validate all permissions
        const dbPermissions = await tx.permission.findMany({
          where: { code: { in: data.permissions } }
        });
        if (dbPermissions.length !== data.permissions.length) {
          throw new ValidationError('One or more selected permissions are invalid');
        }

        // Delete old permissions and link new ones
        await tx.rolePermission.deleteMany({
          where: { roleId: id }
        });

        await tx.rolePermission.createMany({
          data: dbPermissions.map((perm) => ({
            roleId: id,
            permissionId: perm.id
          }))
        });
      }

      return updated;
    });

    // 4. Invalidate Redis permission cache for all users of this role
    if (data.permissions && redisClient.isOpen) {
      const users = await prisma.user.findMany({
        where: { roleId: id, shopId }
      });
      for (const u of users) {
        await redisClient.del(`user:permissions:${u.id}`);
      }
    }

    // 5. Audit
    const updateAuditData: Prisma.AuditLogCreateInput = {
      entityName: 'Role',
      entityId: id,
      action: 'update',
      newValue: data,
      shop: {
        connect: { id: shopId }
      },
      ...(actorId
        ? {
            user: {
              connect: { id: actorId }
            }
          }
        : {})
    };
    await prisma.auditLog.create({
      data: updateAuditData
    });

    return updatedRole;
  }

  async deleteRole(id: string): Promise<void> {
    const shopId = getTenantShopId();
    const actorId = getTenantUserId();
    if (!shopId) throw new AppError('Tenant context required', 400);

    const role = await roleRepository.findById(id, shopId);
    if (!role) {
      throw new NotFoundError('Role not found');
    }

    // 1. Cannot delete owner
    if (role.name === 'owner') {
      throw new ValidationError('The owner role is protected and cannot be deleted');
    }

    // 2. Cannot delete role if in use by active users
    const usersCount = await prisma.user.count({
      where: { roleId: id, shopId, deletedAt: null }
    });
    if (usersCount > 0) {
      throw new ConflictError(`Cannot delete role. It is currently assigned to ${usersCount} employee(s)`);
    }

    // 3. Delete
    await roleRepository.delete(id, shopId);

    // 4. Audit
    const deleteAuditData: Prisma.AuditLogCreateInput = {
      entityName: 'Role',
      entityId: id,
      action: 'delete',
      oldValue: { name: role.name },
      shop: {
        connect: { id: shopId }
      },
      ...(actorId
        ? {
            user: {
              connect: { id: actorId }
            }
          }
        : {})
    };
    await prisma.auditLog.create({
      data: deleteAuditData
    });
  }
}

export const roleService = new RoleService();
export default roleService;
