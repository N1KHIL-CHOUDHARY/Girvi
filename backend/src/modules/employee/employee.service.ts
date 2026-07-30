import bcrypt from "bcryptjs";
import { User, Role } from "@prisma/client";
import { employeeRepository } from './employee.repository';
import { getTenantUserId, getTenantShopId } from '../../common/context/tenant.context';
import { prisma } from '../../config/database';
import {
  ConflictError,
  NotFoundError,
  ValidationError,
  AppError
} from '../../common/errors/AppError';

export class EmployeeService {
  async getAllEmployees(): Promise<(User & { role: Role | null })[]> {
    return employeeRepository.findAll();
  }

  async createEmployee(data: any): Promise<User> {
    const shopId = getTenantShopId();
    if (!shopId) throw new AppError('Tenant context required', 400);

    // 1. Check duplicate username or email within this shop
    const duplicate = await employeeRepository.checkDuplicate(data.email, data.username);
    if (duplicate) {
      throw new ConflictError('An employee with this email or username already exists');
    }

    // 2. Verify role exists in the shop
    const role = await prisma.role.findFirst({
      where: { id: data.roleId, shopId }
    });
    if (!role) {
      throw new NotFoundError('Selected role does not exist in your shop');
    }

    // 3. Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(data.password, salt);

    // 4. Create record
    const employee = await employeeRepository.create({
      shopId,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      username: data.username,
      password: passwordHash,
      phone: data.phone,
      roleId: data.roleId,
      isActive: true
    });

    // 5. Create audit log
    await prisma.auditLog.create({
      data: {
        shopId,
        userId: getTenantUserId() ?? null,
        entityName: 'Employee',
        entityId: employee.id,
        action: 'create',
        newValue: { email: employee.email, username: employee.username, role: role.name }
      }
    });

    return employee;
  }

  async updateEmployee(id: string, data: any): Promise<User> {
    const shopId = getTenantShopId();
    const actorId = getTenantUserId() ?? null;
    if (!shopId) throw new AppError('Tenant context required', 400);

    // 1. Check if employee exists
    const employee = await employeeRepository.findById(id);
    if (!employee) {
      throw new NotFoundError('Employee not found');
    }

    // 2. Block disabling yourself
    if (id === actorId && data.isActive === false) {
      throw new ValidationError('You cannot deactivate your own account');
    }

    const updatePayload: any = {};
    const oldValues: any = {};
    const newValues: any = {};

    // 3. Handle duplicates if email/username changed
    if (data.email || data.username) {
      const emailToCheck = data.email || employee.email;
      const userToCheck = data.username || employee.username;
      
      const duplicate = await employeeRepository.checkDuplicate(emailToCheck, userToCheck, id);
      if (duplicate) {
        throw new ConflictError('An employee with this email or username already exists');
      }
    }

    if (data.firstName !== undefined) {
      updatePayload.firstName = data.firstName;
      oldValues.firstName = employee.firstName;
      newValues.firstName = data.firstName;
    }
    if (data.lastName !== undefined) {
      updatePayload.lastName = data.lastName;
      oldValues.lastName = employee.lastName;
      newValues.lastName = data.lastName;
    }
    if (data.email !== undefined) {
      updatePayload.email = data.email;
      oldValues.email = employee.email;
      newValues.email = data.email;
    }
    if (data.username !== undefined) {
      updatePayload.username = data.username;
      oldValues.username = employee.username;
      newValues.username = data.username;
    }
    if (data.phone !== undefined) {
      updatePayload.phone = data.phone;
      oldValues.phone = employee.phone;
      newValues.phone = data.phone;
    }
    if (data.isActive !== undefined) {
      updatePayload.isActive = data.isActive;
      oldValues.isActive = employee.isActive;
      newValues.isActive = data.isActive;
    }

    // 4. Handle role modification
    if (data.roleId !== undefined && data.roleId !== employee.roleId) {
      // Owner cannot change their own role to prevent lockout
      if (id === actorId && employee.role?.name === 'owner') {
        throw new ValidationError('Owners cannot modify their own role');
      }

      const role = await prisma.role.findFirst({
        where: { id: data.roleId, shopId }
      });
      if (!role) {
        throw new NotFoundError('Selected role does not exist');
      }
      updatePayload.roleId = data.roleId;
      oldValues.roleId = employee.roleId;
      newValues.roleId = data.roleId;
    }

    // 5. Handle password update
    if (data.password) {
      const salt = await bcrypt.genSalt(10);
      updatePayload.password = await bcrypt.hash(data.password, salt);
    }

    // 6. Update user
    const updated = await employeeRepository.update(id, updatePayload);

    // 7. Write audit log
    await prisma.auditLog.create({
      data: {
        shopId,
        userId: actorId,
        entityName: 'Employee',
        entityId: id,
        action: 'update',
        oldValue: oldValues,
        newValue: newValues
      }
    });

    return updated;
  }

  async deleteEmployee(id: string): Promise<void> {
    const shopId = getTenantShopId();
    const actorId = getTenantUserId() ?? null;
    if (!shopId) throw new AppError('Tenant context required', 400);

    const employee = await employeeRepository.findById(id);
    if (!employee) {
      throw new NotFoundError('Employee not found');
    }

    // 1. Cannot delete oneself
    if (id === actorId) {
      throw new ValidationError('You cannot delete your own account');
    }

    // 2. Cannot delete the shop owner
    if (employee.role?.name === 'owner') {
      throw new ValidationError('The shop owner account cannot be deleted');
    }

    // 3. Delete
    await employeeRepository.delete(id);

    // 4. Audit
    await prisma.auditLog.create({
      data: {
        shopId,
        userId: actorId,
        entityName: 'Employee',
        entityId: id,
        action: 'delete',
        oldValue: { email: employee.email, username: employee.username }
      }
    });
  }
}

export const employeeService = new EmployeeService();
