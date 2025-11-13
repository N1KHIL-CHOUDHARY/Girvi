const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/response');
const ApiError = require('../utils/ApiError');

exports.getMe = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(404, 'User not found.');
  }

  return sendSuccess(res, {
    message: 'User profile fetched successfully.',
    data: req.user,
  });
});
