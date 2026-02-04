const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
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

const generateToken = (user, permissions) =>
  jwt.sign(
    {
      userId: user._id,
      shopId: user.shop_id,
      role: user.role,
      roleId: user.role_id,
      permissions,
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  
  

exports.signup = asyncHandler(async (req, res) => {
  const { shop_name, email, password, full_name } = req.body;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userExists = await User.findOne({ email: email.toLowerCase() }).session(
      session
    );
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

    await newShop.save({ session });
    await ownerRole.save({ session });
    await newUser.save({ session });

    await session.commitTransaction();
    session.endSession();

    const token = generateToken(newUser, ownerRole.permissions);

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
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
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

  const token = generateToken(user, role.permissions);

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

exports.logout = asyncHandler(async (req, res) => {
  return sendSuccess(res, {
    message: 'Logout successful.',
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
