const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/response');
const ApiError = require('../utils/ApiError');
const User = require('../models/user');
const Role = require('../models/role');

exports.getMe = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(404, 'User not found.');
  }
  const dbUser = await User.findById(req.user.userId).select('full_name email role shop_id language').lean();
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
    language:dbUser.language,
    permissions: role?.permissions ?? req.user.permissions ?? {},
  };

  return sendSuccess(res, {
    message: 'User profile fetched successfully.',
    data: { user },
  });
});


exports.updatePreferences = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(404, 'User not found.');
  }
  const { language } = req.body;
  const allowed = ['en', 'hi', 'ta'];
  if (!language || !allowed.includes(language)) {
    throw new ApiError(400, 'Invalid language. Use one of: en, hi, ta.');
  }

  const dbUser = await User.findByIdAndUpdate(
    req.user.userId,
    { language },
    { new: true }
  )
    .select('full_name email role shop_id language')
    .lean();

  if (!dbUser) {
    throw new ApiError(404, 'User not found.');
  }

  const user = {
    id: dbUser._id,
    shopId: dbUser.shop_id,
    role: dbUser.role,
    full_name: dbUser.full_name,
    email: dbUser.email,
    language: dbUser.language,
  };

  return sendSuccess(res, {
    message: 'Preferences updated successfully.',
    data: { user },
  });
});
