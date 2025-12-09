const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/response');

exports.getMe = asyncHandler(async (req, res) => {
  return sendSuccess(res, {
    message: 'User profile fetched successfully.',
    data: {
      user: { role: 'owner' }, // Default user without auth
    },
  });
});
