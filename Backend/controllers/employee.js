const User = require('../models/user');
const Role = require('../models/role');
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

const getOrCreateWorkerRole = async (shopId) => {
  let role = await Role.findOne({ shop_id: shopId, name: normalizeRoleName('worker') });
  if (!role) {
    role = await Role.create({
      shop_id: shopId,
      name: normalizeRoleName('worker'),
      is_owner_role: false,
      permissions: DEFAULT_ROLE_PERMISSIONS.worker,
    });
  }
  return role;
};

exports.listEmployees = asyncHandler(async (req, res) => {
  const shopId = getShopId(req);

  const employees = await User.find({ shop_id: shopId, role: 'worker' }).select(
    '_id full_name email role role_id shop_id createdAt updatedAt'
  );

  return sendSuccess(res, {
    message: 'Employees fetched successfully.',
    data: employees,
  });
});

exports.createEmployee = asyncHandler(async (req, res) => {
  const shopId = getShopId(req);
  const { full_name, email, password, roleId } = req.body || {};

  const issues = [];
  if (!full_name) issues.push('full_name is required.');
  if (!email) issues.push('email is required.');
  if (!password) issues.push('password is required.');

  if (issues.length) {
    throw new ApiError(400, 'Validation failed.', issues);
  }

  const existing = await User.findOne({ shop_id: shopId, email: email.toLowerCase() });
  if (existing) {
    throw new ApiError(409, 'Unable to create employee. Email already in use.');
  }

  let roleDoc;
  if (roleId) {
    roleDoc = await Role.findOne({ _id: roleId, shop_id: shopId });
    if (!roleDoc) {
      throw new ApiError(400, 'Invalid role for this shop.');
    }
  } else {
    roleDoc = await getOrCreateWorkerRole(shopId);
  }

  const user = await User.create({
    shop_id: shopId,
    full_name,
    email: email.toLowerCase(),
    password,
    role: roleDoc && roleDoc.is_owner_role ? 'owner' : 'worker',
    role_id: roleDoc ? roleDoc._id : undefined,
  });

  return sendSuccess(res, {
    status: 201,
    message: 'Employee created successfully.',
    data: {
      id: user._id,
      full_name: user.full_name,
      email: user.email,
      role: user.role,
      role_id: user.role_id,
    },
  });
});

exports.updateEmployee = asyncHandler(async (req, res) => {
  const shopId = getShopId(req);
  const { employeeId } = req.params;
  const { full_name, email, password, roleId } = req.body || {};

  if (!employeeId) {
    throw new ApiError(400, 'Employee identifier is required.');
  }

  const user = await User.findOne({ _id: employeeId, shop_id: shopId });
  if (!user) {
    throw new ApiError(404, 'Employee not found.');
  }
  if (user.role === 'owner') {
    throw new ApiError(400, 'Owner cannot be modified via employee APIs.');
  }

  if (full_name) user.full_name = full_name;
  if (email) user.email = email.toLowerCase();
  if (password) user.password = password;

  if (roleId) {
    const roleDoc = await Role.findOne({ _id: roleId, shop_id: shopId });
    if (!roleDoc) {
      throw new ApiError(400, 'Invalid role for this shop.');
    }
    user.role_id = roleDoc._id;
    user.role = roleDoc.is_owner_role ? 'owner' : 'worker';
  }

  await user.save();

  return sendSuccess(res, {
    message: 'Employee updated successfully.',
    data: {
      id: user._id,
      full_name: user.full_name,
      email: user.email,
      role: user.role,
      role_id: user.role_id,
    },
  });
});

exports.deleteEmployee = asyncHandler(async (req, res) => {
  const shopId = getShopId(req);
  const { employeeId } = req.params;

  if (!employeeId) {
    throw new ApiError(400, 'Employee identifier is required.');
  }

  const user = await User.findOne({ _id: employeeId, shop_id: shopId });
  if (!user) {
    throw new ApiError(404, 'Employee not found.');
  }
  if (user.role === 'owner') {
    throw new ApiError(400, 'Owner cannot be deleted.');
  }

  await user.deleteOne();

  return sendSuccess(res, {
    message: 'Employee deleted successfully.',
  });
});
