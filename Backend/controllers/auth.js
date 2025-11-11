const Shop = require('../models/shop');
const User = require('../models/user');
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

const signup = async (req, res) => {
  const { shop_name, email, password, full_name } = req.body;

  try {
    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ message: 'Email is already in use' });
    }

    const newShop = new Shop({
      shop_name,
    });

    const newUser = new User({
      shop_id: newShop._id,
      email: email.toLowerCase(),
      password,
      full_name,
      role: 'owner',
    });

    newShop.owner_id = newUser._id;

    await newShop.save();
    await newUser.save();

    const token = generateToken(newUser);

    res.status(201).json({
      message: 'Shop created successfully',
      token,
      user: {
        id: newUser._id,
        email: newUser.email,
        full_name: newUser.full_name,
        role: newUser.role,
        shopId: newShop._id,
      },
    });

  } catch (error) {
    console.error('SIGNUP ERROR:', error);
    res.status(500).json({ message: 'Server error during signup' });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email: email.toLowerCase() });

    if (user && (await user.comparePassword(password))) {
      
      const token = generateToken(user);

      res.status(200).json({
        message: 'Login successful',
        token,
        user: {
          id: user._id,
          email: user.email,
          full_name: user.full_name,
          role: user.role,
          shopId: user.shop_id,
        },
      });
    } else {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('LOGIN ERROR:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

const changePassword = async (req, res) => {
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

module.exports = { signup, login, changePassword };