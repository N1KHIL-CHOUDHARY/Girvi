import type { Request, Response } from 'express';
import { ApiError } from '../../lib/errors';
import { asyncHandler, sendSuccess } from '../../lib/http';
import type { RoleBody, RoleRecord } from './role.types';
import { createRole, deleteRole, getRoles, updateRole } from './role.service';

export const getRolesController = asyncHandler(async (req, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, 'Not authorized. Token missing.');
  }

  const roles = await getRoles(req.user);
  sendSuccess(res, {
    message: 'Roles fetched successfully.',
    data: roles,
  });
});

export const createRoleController = asyncHandler<unknown, RoleRecord, RoleBody>(async (req, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, 'Not authorized. Token missing.');
  }

  const role = await createRole(req.user, req.body);
  sendSuccess(res, {
    status: 201,
    message: 'Role created successfully.',
    data: role,
  });
});

export const updateRoleController = asyncHandler<{ roleId: string }, RoleRecord, RoleBody>(async (req: Request<{ roleId: string }>, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, 'Not authorized. Token missing.');
  }

  const role = await updateRole(req.user, req.params.roleId, req.body);
  sendSuccess(res, {
    message: 'Role updated successfully.',
    data: role,
  });
});

export const deleteRoleController = asyncHandler<{ roleId: string }>(async (req: Request<{ roleId: string }>, res) => {
  if (!req.user) {
    throw new ApiError(401, 'Not authorized. Token missing.');
  }

  const result = await deleteRole(req.user, req.params.roleId);
  sendSuccess(res, {
    message: 'Role deleted successfully.',
    data: result,
  });
});
