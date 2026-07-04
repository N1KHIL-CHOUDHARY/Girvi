export type UserRole = 'owner' | 'worker';

export interface PermissionSet {
  can_view_dashboard: boolean;
  can_view_customers: boolean;
  can_create_customers: boolean;
  can_edit_customers: boolean;
  can_delete_customers: boolean;
  can_view_tickets: boolean;
  can_create_tickets: boolean;
  can_settle_tickets: boolean;
  can_delete_tickets: boolean;
  can_manage_employees: boolean;
  can_manage_roles: boolean;
  can_view_reports: boolean;
}

export const DEFAULT_ROLE_PERMISSIONS: Record<UserRole, PermissionSet> = {
  owner: {
    can_view_dashboard: true,
    can_view_customers: true,
    can_create_customers: true,
    can_edit_customers: true,
    can_delete_customers: true,
    can_view_tickets: true,
    can_create_tickets: true,
    can_settle_tickets: true,
    can_delete_tickets: true,
    can_manage_employees: true,
    can_manage_roles: true,
    can_view_reports: true,
  },
  worker: {
    can_view_dashboard: true,
    can_view_customers: true,
    can_create_customers: false,
    can_edit_customers: false,
    can_delete_customers: false,
    can_view_tickets: true,
    can_create_tickets: false,
    can_settle_tickets: false,
    can_delete_tickets: false,
    can_manage_employees: false,
    can_manage_roles: false,
    can_view_reports: false,
  },
};

export const normalizeRoleName = (role: string): string => {
  const trimmed = role.trim();
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
};
