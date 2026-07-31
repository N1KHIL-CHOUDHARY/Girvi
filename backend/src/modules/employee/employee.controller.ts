import { Request, Response } from 'express';
import { employeeService } from './employee.service';
import { sendSuccess } from '../../common/utils/apiResponse';
import { asyncHandler } from '../../common/utils/asyncHandler';

export class EmployeeController {
  getEmployees = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    const list = await employeeService.getAllEmployees();

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

    sendSuccess(res, sanitized, 'Employees retrieved successfully');
  });

  createEmployee = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const emp = await employeeService.createEmployee(req.body);

    sendSuccess(
      res,
      {
        id: emp.id,
        firstName: emp.firstName,
        lastName: emp.lastName,
        email: emp.email,
        username: emp.username,
        phone: emp.phone,
        isActive: emp.isActive,
        roleId: emp.roleId
      },
      'Employee created successfully',
      201
    );
  });

  updateEmployee = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const emp = await employeeService.updateEmployee(id, req.body);

    sendSuccess(
      res,
      {
        id: emp.id,
        firstName: emp.firstName,
        lastName: emp.lastName,
        email: emp.email,
        username: emp.username,
        phone: emp.phone,
        isActive: emp.isActive,
        roleId: emp.roleId
      },
      'Employee details updated successfully'
    );
  });

  deleteEmployee = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    await employeeService.deleteEmployee(id);
    sendSuccess(res, undefined, 'Employee removed successfully');
  });
}

export const employeeController = new EmployeeController();
export default employeeController;
