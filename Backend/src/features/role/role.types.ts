import type { PermissionSet } from '../../lib/permissions';

export interface RoleBody {
  name: string;
  permissions?: Partial<PermissionSet>;
}

export interface RoleParams {
  roleId: string;
}

export interface RoleRecord {
  id: string;
  shopId: string;
  name: string;
  isOwnerRole: boolean;
  permissions: PermissionSet;
  createdAt: string;
  updatedAt: string;
}
