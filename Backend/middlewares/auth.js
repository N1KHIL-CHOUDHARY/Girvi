const jwt = require('jsonwebtoken');
require('dotenv').config();

const Role = require('../models/role');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const authenticate = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new ApiError(401, 'Not authorized. Token missing.');
  }
  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    let permissions = decoded.permissions;

    if (!permissions) {
      const role = await Role.findOne({
        _id: decoded.roleId,
        shop_id: decoded.shopId,
      });
      permissions = role ? role.permissions : undefined;
    }

    req.user = {
      userId: decoded.userId,
      shopId: decoded.shopId,
      role: decoded.role,
      roleId: decoded.roleId,
      permissions: permissions || {},
    };

    return next();
  } catch (error) {
    throw new ApiError(401, 'Not authorized. Token invalid.');
  }
});

const checkPermission = (permissionName) => {
  return (req, res, next) => {
    if (
      !req.user ||
      !req.user.permissions ||
      req.user.permissions[permissionName] !== true
    ) {
      return next(new ApiError(403, 'Forbidden. Insufficient permissions.'));
    }

    return next();
  };
};

module.exports = {
  authenticate,
  checkPermission,
};
