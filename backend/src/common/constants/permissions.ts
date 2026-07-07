export const PERMISSIONS = {
  READ_DASHBOARD: 'read:dashboard',
  MANAGE_PAWNS: 'manage:pawns',
  MANAGE_CUSTOMERS: 'manage:customers',
  MANAGE_PAYMENTS: 'manage:payments',
  MANAGE_EMPLOYEES: 'manage:employees',
  MANAGE_ROLES: 'manage:roles',
  MANAGE_REPORTS: 'manage:reports',
  MANAGE_SETTINGS: 'manage:settings',
} as const;

export type PermissionCode = typeof PERMISSIONS[keyof typeof PERMISSIONS];

export const ALL_PERMISSIONS = Object.values(PERMISSIONS);
