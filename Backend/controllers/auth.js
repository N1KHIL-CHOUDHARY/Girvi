const Shop = require('../models/shop');
const User = require('../models/user');
const Role = require('../models/role');
const {
  DEFAULT_ROLE_PERMISSIONS,
  normalizeRoleName,
  ensureRoleForUser,
} = require('../utils/roleHelpers');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const generateToken = (user) => {
  return jwt.sign(
    {
      userId: user._id,
      shopId: user.shop_id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

exports.signup = async (req, res) => {
  const { shop_name, email, password, full_name } = req.body;
  try {
    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ message: 'Email is already in use' });
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

    const token = generateToken(newUser, ownerRole);

    res.status(201).json({
      success: true, // <-- Make sure your frontend checks for this
      token,
      // --- THIS IS THE FIX ---
      // Send back the full user object with permissions
      user: {
        id: newUser._id,
        shopId: newUser.shop_id,
        role: newUser.role,
        full_name: newUser.full_name,
        email: newUser.email,
        permissions: ownerRole.permissions // <-- ADDED THIS
      }
      // ----------------------
    });
  } catch (error) {
    console.error('SIGNUP ERROR:', error);
    res.status(500).json({ message: 'Server error during signup' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email: email.toLowerCase() });

    if (user && (await user.comparePassword(password))) {
      const role = await ensureRoleForUser(user);
      if (!role) {
        return res.status(403).json({ success: false, message: 'User role not found.' });
      }

      const token = generateToken(user, role);

      res.status(200).json({
        success: true, // <-- Make sure your frontend checks for this
        token,
        
        user: {
          id: user._id,
          shopId: user.shop_id,
          role: user.role,
          full_name: user.full_name,
          email: user.email,
          permissions: role.permissions // <-- ADDED THIS
        }
        // ----------------------
      });
    } else {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('LOGIN ERROR:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const { userId } = req.user;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: 'Incorrect current password' });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('CHANGE PASSWORD ERROR:', error);
    res.status(500).json({ message: 'Server error' });
  }
};