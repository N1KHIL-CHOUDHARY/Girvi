import type { Request, Response } from 'express';
import { ApiError } from '../../lib/errors.js';
import { asyncHandler, sendSuccess } from '../../lib/http.js';
import type { EmployeeBody, EmployeeRecord, EmployeeUpdateBody } from './employee.types.js';
import { createEmployee, deleteEmployee, listEmployees, updateEmployee } from './employee.service.js';

export const listEmployeesController = asyncHandler(async (req, res: Response<EmployeeRecord[]>) => {
  if (!req.user) {
    throw new ApiError(401, 'Not authorized. Token missing.');
  }

  const employees = await listEmployees(req.user);
  sendSuccess(res, {
    message: 'Employees fetched successfully.',
    data: employees,
  });
});

export const createEmployeeController = asyncHandler<unknown, EmployeeRecord, EmployeeBody>(async (req, res: Response<EmployeeRecord>) => {
  if (!req.user) {
    throw new ApiError(401, 'Not authorized. Token missing.');
  }

  const employee = await createEmployee(req.user, req.body);
  sendSuccess(res, {
    status: 201,
    message: 'Employee created successfully.',
    data: employee,
  });
});

export const updateEmployeeController = asyncHandler<{ employeeId: string }, EmployeeRecord, EmployeeUpdateBody>(async (req: Request<{ employeeId: string }>, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, 'Not authorized. Token missing.');
  }

  const employee = await updateEmployee(req.user, req.params.employeeId, req.body);
  sendSuccess(res, {
    message: 'Employee updated successfully.',
    data: employee,
  });
});

export const deleteEmployeeController = asyncHandler<{ employeeId: string }>(async (req: Request<{ employeeId: string }>, res) => {
  if (!req.user) {
    throw new ApiError(401, 'Not authorized. Token missing.');
  }

  const result = await deleteEmployee(req.user, req.params.employeeId);
  sendSuccess(res, {
    message: 'Employee deleted successfully.',
    data: result,
  });
});
