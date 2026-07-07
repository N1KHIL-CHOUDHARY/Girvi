import { Request, Response, NextFunction } from 'express';
import { employeeService } from './employee.service';
import { sendResponse } from '../../common/utils/apiResponse';

export class EmployeeController {
  async getEmployees(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const list = await employeeService.getAllEmployees();

      // Filter out passwords before returning to client
      const sanitized = list.map((emp) => ({
        id: emp.id,
        firstName: emp.firstName,
        lastName: emp.lastName,
        email: emp.email,
        username: emp.username,
        phone: emp.phone,
        role: emp.role,
        isActive: emp.isActive,
        shopId: emp.shopId,
        lastLoginAt: emp.lastLoginAt,
        createdAt: emp.createdAt,
        updatedAt: emp.updatedAt
      }));

      sendResponse(res, {
        message: 'Employees retrieved successfully',
        data: sanitized
      });
    } catch (error) {
      next(error);
    }
  }

  async createEmployee(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const emp = await employeeService.createEmployee(req.body);

      sendResponse(res, {
        statusCode: 201,
        message: 'Employee created successfully',
        data: {
          id: emp.id,
          firstName: emp.firstName,
          lastName: emp.lastName,
          email: emp.email,
          username: emp.username,
          phone: emp.phone,
          isActive: emp.isActive,
          roleId: emp.roleId
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async updateEmployee(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const emp = await employeeService.updateEmployee(id, req.body);

      sendResponse(res, {
        message: 'Employee details updated successfully',
        data: {
          id: emp.id,
          firstName: emp.firstName,
          lastName: emp.lastName,
          email: emp.email,
          username: emp.username,
          phone: emp.phone,
          isActive: emp.isActive,
          roleId: emp.roleId
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteEmployee(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await employeeService.deleteEmployee(id);

      sendResponse(res, {
        message: 'Employee removed successfully'
      });
    } catch (error) {
      next(error);
    }
  }
}

export const employeeController = new EmployeeController();
export default employeeController;
