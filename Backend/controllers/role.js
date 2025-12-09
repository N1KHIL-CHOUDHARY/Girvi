const Role = require('../models/role');
const User = require('../models/user');
const {
  DEFAULT_ROLE_PERMISSIONS,
  normalizeRoleName,
} = require('../utils/roleHelpers');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/response');
const ApiError = require('../utils/ApiError');

const getShopId = (req) => {
  if (!req.user || !req.user.shopId) {
    throw new ApiError(400, 'Shop context missing.');
  }
  return req.user.shopId;
};

exports.getRoles = asyncHandler(async (req, res) => {
  const shopId = getShopId(req);

  const roles = await Role.find({ shop_id: shopId }).sort({
    is_owner_role: -1,
    createdAt: 1,
  });

  return sendSuccess(res, {
    message: 'Roles fetched successfully.',
    data: roles,
  });
});

exports.createRole = asyncHandler(async (req, res) => {
  const shopId = getShopId(req);
  const { name, permissions = {} } = req.body || {};

  const issues = [];
  if (!name) {
    issues.push('Role name is required.');
  }

  const normalizedName = name ? normalizeRoleName(name.trim()) : null;

  if (name && !normalizedName) {
    issues.push('Role name is invalid.');
  }

  if (issues.length) {
    throw new ApiError(400, 'Validation failed.', issues);
  }

  if (normalizedName.toLowerCase() === 'owner') {
    throw new ApiError(400, 'Owner role already exists.');
  }

  const existingRole = await Role.findOne({
    shop_id: shopId,
    name: normalizedName,
  });

  if (existingRole) {
    throw new ApiError(409, 'Role name already in use.');
  }

  const role = await Role.create({
    shop_id: shopId,
    name: normalizedName,
    is_owner_role: false,
    permissions: {
      ...DEFAULT_ROLE_PERMISSIONS.worker,
      ...permissions,
    },
  });

  return sendSuccess(res, {
    status: 201,
    message: 'Role created successfully.',
    data: role,
  });
});

exports.updateRole = asyncHandler(async (req, res) => {
  const shopId = getShopId(req);
  const { roleId } = req.params;
  const { name, permissions } = req.body || {};

  if (!roleId) {
    throw new ApiError(400, 'Role identifier is required.');
  }

  const role = await Role.findOne({ _id: roleId, shop_id: shopId });

  if (!role) {
    throw new ApiError(404, 'Role not found.');
  }

  if (role.is_owner_role) {
    throw new ApiError(400, 'Owner role cannot be updated.');
  }

  if (name) {
    const normalizedName = normalizeRoleName(name.trim());
    if (!normalizedName) {
      throw new ApiError(400, 'Role name is invalid.');
    }

    const duplicate = await Role.findOne({
      _id: { $ne: roleId },
      shop_id: shopId,
      name: normalizedName,
    });

    if (duplicate) {
      throw new ApiError(409, 'Role name already in use.');
    }

    role.name = normalizedName;
  }

  if (permissions && typeof permissions === 'object') {
    role.permissions = {
      ...DEFAULT_ROLE_PERMISSIONS.worker,
      ...permissions,
    };
  }

  await role.save();

  return sendSuccess(res, {
    message: 'Role updated successfully.',
    data: role,
  });
});

exports.deleteRole = asyncHandler(async (req, res) => {
  const shopId = getShopId(req);
  const { roleId } = req.params;

  if (!roleId) {
    throw new ApiError(400, 'Role identifier is required.');
  }

  const role = await Role.findOne({ _id: roleId, shop_id: shopId });

  if (!role) {
    throw new ApiError(404, 'Role not found.');
  }

  if (role.is_owner_role) {
    throw new ApiError(400, 'Owner role cannot be deleted.');
  }

  const usersUsingRole = await User.countDocuments({ role_id: roleId });

  if (usersUsingRole > 0) {
    throw new ApiError(409, 'Role is assigned to users and cannot be deleted.');
  }

  await role.deleteOne();

  return sendSuccess(res, {
    message: 'Role deleted successfully.',
    data: {
      roleId,
    },
  });
});
