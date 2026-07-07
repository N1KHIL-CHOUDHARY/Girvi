import { Shop, User, Role } from '@prisma/client';
import { prisma } from '../../config/database';

export class AuthRepository {
  /**
   * Look up a user by email, searching globally across all shops.
   * This is used during authentication (login, reset password).
   */
  async findUsersByEmail(email: string): Promise<(User & { shop: Shop; role: Role | null })[]> {
    return prisma.user.findMany({
      where: { email },
      include: {
        shop: true,
        role: true
      }
    }) as any; 
  }

  async findUserById(id: string): Promise<(User & { shop: Shop; role: Role | null }) | null> {
    return prisma.user.findFirst({
      where: { id },
      include: {
        shop: true,
        role: true
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
          email: data.email
        }
      });

      // 2. Fetch all system permissions to link them to the owner role
      const systemPermissions = await tx.permission.findMany();

      // 3. Create the 'owner' Role for the Shop
      const ownerRole = await tx.role.create({
        data: {
          shopId: shop.id,
          name: 'owner',
          description: 'Shop owner with full access permissions'
        }
      });

      // 4. Map all permissions to the owner role in RolePermission
      if (systemPermissions.length > 0) {
        await tx.rolePermission.createMany({
          data: systemPermissions.map((perm) => ({
            roleId: ownerRole.id,
            permissionId: perm.id
          }))
        });
      }

      // 5. Create the Owner User
      const names = data.fullName.split(' ');
      const firstName = names[0] || 'Owner';
      const lastName = names.slice(1).join(' ') || '';
      
      // Use email prefix as username default
      const username = data.email.split('@')[0] || `owner_${shop.id.slice(0, 5)}`;

      const user = await tx.user.create({
        data: {
          shopId: shop.id,
          roleId: ownerRole.id,
          firstName,
          lastName,
          email: data.email,
          username,
          password: data.passwordHash,
          isActive: true
        }
      });

      // 6. Log activity
      await tx.activityLog.create({
        data: {
          shopId: shop.id,
          userId: user.id,
          action: 'register',
          details: { message: 'Shop and owner registered successfully' }
        }
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

  async logActivity(data: { shopId: string; userId: string; action: string; details: any }): Promise<void> {
    await prisma.activityLog.create({
      data: {
        shopId: data.shopId,
        userId: data.userId,
        action: data.action,
        details: data.details
      }
    });
  }
}

export const authRepository = new AuthRepository();
