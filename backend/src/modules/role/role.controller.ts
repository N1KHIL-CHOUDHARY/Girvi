import { Request, Response, NextFunction } from 'express';
import { roleService } from './role.service';
import { sendResponse } from '../../common/utils/apiResponse';

export class RoleController {
  async getRoles(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const list = await roleService.getAllRoles();
      sendResponse(res, {
        message: 'Roles retrieved successfully',
        data: list
      });
    } catch (error) {
      next(error);
    }
  }

  async createRole(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const role = await roleService.createRole(req.body);
      sendResponse(res, {
        statusCode: 201,
        message: 'Role created successfully',
        data: role
      });
    } catch (error) {
      next(error);
    }
  }

  async updateRole(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const role = await roleService.updateRole(id, req.body);
      sendResponse(res, {
        message: 'Role updated successfully',
        data: role
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteRole(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await roleService.deleteRole(id);
      sendResponse(res, {
        message: 'Role deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }
}

export const roleController = new RoleController();
export default roleController;
