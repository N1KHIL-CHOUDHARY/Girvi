import { Role, Permission } from '@prisma/client';
import { prisma } from '../../config/database';

export class RoleRepository {
  async findAll(): Promise<(Role & { permissions: { permission: Permission }[] })[]> {
    return prisma.role.findMany({
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

  async findById(id: string): Promise<(Role & { permissions: { permission: Permission }[] }) | null> {
    return prisma.role.findFirst({
      where: { id },
      include: {
        permissions: {
          include: {
            permission: true
          }
        }
      }
    });
  }

  async findByName(name: string): Promise<Role | null> {
    return prisma.role.findFirst({
      where: { name }
    });
  }

  async create(data: { shopId: string; name: string; description: string }): Promise<Role> {
    return prisma.role.create({
      data
    });
  }

  async update(id: string, data: { name?: string; description?: string }): Promise<Role> {
    return prisma.role.update({
      where: { id },
      data
    });
  }

  async delete(id: string): Promise<Role> {
    return prisma.role.delete({
      where: { id }
    });
  }
}

export const roleRepository = new RoleRepository();
export default roleRepository;
