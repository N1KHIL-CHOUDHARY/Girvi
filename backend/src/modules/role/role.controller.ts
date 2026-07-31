import { Request, Response } from 'express';
import { roleService } from './role.service';
import { sendSuccess } from '../../common/utils/apiResponse';
import { asyncHandler } from '../../common/utils/asyncHandler';

export class RoleController {
  getRoles = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    const list = await roleService.getAllRoles();
    sendSuccess(res, list, 'Roles retrieved successfully');
  });

  createRole = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const role = await roleService.createRole(req.body);
    sendSuccess(res, role, 'Role created successfully', 201);
  });

  updateRole = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const role = await roleService.updateRole(id, req.body);
    sendSuccess(res, role, 'Role updated successfully');
  });

  deleteRole = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    await roleService.deleteRole(id);
    sendSuccess(res, undefined, 'Role deleted successfully');
  });
}

export const roleController = new RoleController();
export default roleController;
