export type Permission = 'read:dashboard' | 'manage:pawns' | 'manage:customers' | 'manage:payments' | 'manage:employees' | 'manage:roles' | 'manage:reports' | 'manage:settings';

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  createdAt: string;
  updatedAt: string;
}