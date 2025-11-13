const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const dotenv = require('dotenv');

const Shop = require('../models/shop');
const User = require('../models/user');
const Role = require('../models/role');
const {
  DEFAULT_ROLE_PERMISSIONS,
  normalizeRoleName,
  ensureRoleForUser,
} = require('../utils/roleHelpers');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/response');
const ApiError = require('../utils/ApiError');

dotenv.config();

const generateToken = (user) =>
  jwt.sign(
    {
      userId: user._id,
      shopId: user.shop_id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

exports.signup = asyncHandler(async (req, res) => {
  const { shop_name, email, password, full_name } = req.body;

  const userExists = await User.findOne({ email: email.toLowerCase() });
  if (userExists) {
    throw new ApiError(409, 'Unable to create user. Email already exists.');
  }

  const newShop = new Shop({ shop_name });

  const ownerRole = new Role({
    shop_id: newShop._id,
    name: normalizeRoleName('owner'),
    is_owner_role: true,
    permissions: DEFAULT_ROLE_PERMISSIONS.owner,
  });

  const newUser = new User({
    shop_id: newShop._id,
    email: email.toLowerCase(),
    password,
    full_name,
    role: 'owner',
    role_id: ownerRole._id,
  });

  newShop.owner_id = newUser._id;

  await newShop.save();
  await ownerRole.save();
  await newUser.save();

  const token = generateToken(newUser);

  return sendSuccess(res, {
    status: 201,
    message: 'Signup successful.',
    data: {
      token,
      user: {
        id: newUser._id,
        shopId: newUser.shop_id,
        role: newUser.role,
        full_name: newUser.full_name,
        email: newUser.email,
        permissions: ownerRole.permissions,
      },
    },
  });
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() });

  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, 'Invalid credentials.');
  }

  const role = await ensureRoleForUser(user);
  if (!role) {
    throw new ApiError(403, 'User role not found.');
  }

  const token = generateToken(user);

  return sendSuccess(res, {
    message: 'Login successful.',
    data: {
      token,
      user: {
        id: user._id,
        shopId: user.shop_id,
        role: user.role,
        full_name: user.full_name,
        email: user.email,
        permissions: role.permissions,
      },
    },
  });
});

exports.googleAuth = asyncHandler(async (req, res) => {
  const { idToken } = req.body || {};

  if (!process.env.GOOGLE_CLIENT_ID) {
    throw new ApiError(500, 'Google authentication not configured.');
  }

  if (!idToken) {
    throw new ApiError(400, 'Missing Google ID token.');
  }

  const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  const email = payload?.email?.toLowerCase();
  const fullName = payload?.name || payload?.given_name || '';

  if (!email) {
    throw new ApiError(400, 'Google token missing email address.');
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(404, 'No account linked to this Google email.');
  }

  const role = await ensureRoleForUser(user);
  if (!role) {
    throw new ApiError(403, 'User role not found.');
  }

  const token = generateToken(user);

  return sendSuccess(res, {
    message: 'Google login successful.',
    data: {
      token,
      user: {
        id: user._id,
        shopId: user.shop_id,
        role: user.role,
        full_name: user.full_name || fullName,
        email: user.email,
        permissions: role.permissions,
      },
    },
  });
});

exports.changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const { userId } = req.user;

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found.');
  }

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw new ApiError(401, 'Incorrect current password.');
  }

  user.password = newPassword;
  await user.save();

  return sendSuccess(res, {
    message: 'Password changed successfully.',
  });
});
