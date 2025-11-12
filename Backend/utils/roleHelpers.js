const Role = require('../models/role');

const DEFAULT_ROLE_PERMISSIONS = {
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

const normalizeRoleName = (role) => {
  if (!role || typeof role !== 'string') {
    return role;
  }

  return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
};

const ensureRoleForUser = async (user) => {
  if (!user) {
    return null;
  }

  let roleDoc = null;

  if (user.role_id) {
    roleDoc = await Role.findById(user.role_id);
  }

  if (!roleDoc) {
    roleDoc = await Role.findOne({
      shop_id: user.shop_id,
      name: normalizeRoleName(user.role),
    });
  }

  if (!roleDoc && DEFAULT_ROLE_PERMISSIONS[user.role]) {
    roleDoc = new Role({
      shop_id: user.shop_id,
      name: normalizeRoleName(user.role),
      is_owner_role: user.role === 'owner',
      permissions: DEFAULT_ROLE_PERMISSIONS[user.role],
    });

    await roleDoc.save();
  }

  if (roleDoc && !user.role_id) {
    user.role_id = roleDoc._id;
    await user.save({ validateBeforeSave: false });
  }

  return roleDoc;
};

module.exports = {
  DEFAULT_ROLE_PERMISSIONS,
  normalizeRoleName,
  ensureRoleForUser,
};

