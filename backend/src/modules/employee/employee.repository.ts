
import { User, Role } from '@prisma/client';
import { prisma } from '../../config/database';

export class EmployeeRepository {
  async findAll(): Promise<(User & { role: Role | null })[]> {
    return prisma.user.findMany({
      include: { role: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findById(id: string): Promise<(User & { role: Role | null }) | null> {
    return prisma.user.findFirst({
      where: { id },
      include: { role: true }
    });
  }

  async create(data: any): Promise<User> {
    // Note: shopId is automatically injected by the Prisma Tenant Extension
    // during write operations if it's available in AsyncLocalStorage
    return prisma.user.create({
      data
    });
  }

  async update(id: string, data: any): Promise<User> {
    return prisma.user.update({
      where: { id },
      data
    });
  }

  async delete(id: string): Promise<User> {
    // Soft delete is handled automatically by the Prisma Extension interceptor
    return prisma.user.delete({
      where: { id }
    });
  }

  async checkDuplicate(email: string, username: string, excludeId?: string): Promise<User | null> {
    // Checks duplicates within the same shop
    return prisma.user.findFirst({
      where: {
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
