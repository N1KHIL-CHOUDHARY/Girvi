import { Shop, User, Role, RolePermission, Permission, Prisma } from '@prisma/client';
import { prisma } from '../../config/database';
import { ALL_PERMISSIONS } from '../../common/constants/permissions';

export type UserWithRoleAndPermissions = User & {
  shop: Shop;
  role: (Role & {
    permissions: (RolePermission & {
      permission: Permission;
    })[];
  }) | null;
};

export class AuthRepository {
  /**
   * Look up a user by email, searching globally across all shops.
   * This is used during authentication (login, reset password).
   */
  async findUsersByEmail(email: string): Promise<UserWithRoleAndPermissions[]> {
    return prisma.user.findMany({
      where: { email },
      include: {
        shop: true,
        role: {
          include: {
            permissions: {
              include: {
                permission: true
              }
            }
          }
        }
      }
    });
  }

  async findUserById(id: string): Promise<UserWithRoleAndPermissions | null> {
    return prisma.user.findUnique({
      where: { id },
      include: {
        shop: true,
        role: {
          include: {
            permissions: {
              include: {
                permission: true
              }
            }
          }
        }
      }
    });
  }

  /**
   * Atomic transaction to register a new shop and its owner.
   */
  async registerShopAndOwner(data: {
    fullName: string;
    shopName: string;
    email: string;
    passwordHash: string;
  }): Promise<{ user: User; shop: Shop }> {
    return prisma.$transaction(async (tx) => {
      // 1. Create the Shop
      const shop = await tx.shop.create({
        data: {
          name: data.shopName,
          email: data.email,
        },
      });

      // 2. Fetch or fallback to all permissions from permissions constants if table is empty
      let systemPermissions = await tx.permission.findMany();

      if (systemPermissions.length === 0) {
        // Seed permissions on-the-fly if system permissions haven't been migrated/seeded
        const defaultPermissions = Object.values(ALL_PERMISSIONS);

        await tx.permission.createMany({
          data: defaultPermissions.map((permissionName) => ({
            code: permissionName,
            name: permissionName,
            description: `Permission for ${permissionName}`,
          })),
          skipDuplicates: true,
        });

        systemPermissions = await tx.permission.findMany();
      }

      // 3. Create the 'owner' Role with nested RolePermission relations
      const ownerRole = await tx.role.create({
        data: {
          shopId: shop.id,
          name: 'owner',
          description: 'Shop owner with full access permissions',
          permissions: {
            create: systemPermissions.map((perm) => ({
              permissionId: perm.id,
            })),
          },
        },
      });

      // 4. Parse Name and Username
      const names = data.fullName.trim().split(' ');
      const firstName = names[0] || 'Owner';
      const lastName = names.slice(1).join(' ') || '';
      const username = data.email.split('@')[0] || `owner_${shop.id.slice(0, 5)}`;

      // 5. Create the Owner User connected to the owner role
      const user = await tx.user.create({
        data: {
          shopId: shop.id,
          roleId: ownerRole.id,
          firstName,
          lastName,
          email: data.email,
          username,
          password: data.passwordHash,
          isActive: true,
          isEmailVerified: false,
        },
      });

      // 6. Log Activity
      await tx.activityLog.create({
        data: {
          shopId: shop.id,
          userId: user.id,
          action: 'register',
          details: { message: 'Shop and owner registered successfully' },
        },
      });

      return { user, shop };
    });
  }

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    return prisma.user.update({
      where: { id },
      data
    });
  }

  async logActivity(data: { shopId: string; userId: string; action: string; details: Record<string, unknown> }): Promise<void> {
    await prisma.activityLog.create({
      data: {
        shopId: data.shopId,
        userId: data.userId,
        action: data.action,
        details: data.details as Prisma.InputJsonValue
      }
    });
  }
}

export const authRepository = new AuthRepository();
