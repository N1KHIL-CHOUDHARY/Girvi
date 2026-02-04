const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/response');
const ApiError = require('../utils/ApiError');
const User = require('../models/user');
const Role = require('../models/role');

exports.getMe = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(404, 'User not found.');
  }
  const dbUser = await User.findById(req.user.userId).select('full_name email role shop_id').lean();
  const role = await Role.findOne({ _id: req.user.roleId, shop_id: req.user.shopId }).select('permissions').lean();
  if (!dbUser) {
    throw new ApiError(404, 'User not found.');
  }
  const user = {
    id: dbUser._id,
    shopId: dbUser.shop_id,
    role: dbUser.role,
    full_name: dbUser.full_name,
    email: dbUser.email,
    permissions: role?.permissions ?? req.user.permissions ?? {},
  };

  return sendSuccess(res, {
    message: 'User profile fetched successfully.',
    data: { user },
  });
});
