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
    // 1. Check if user (email) already exists
    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ message: 'Email is already in use' });
    }

    // 2. Create the Shop first
    const newShop = new Shop({
      shop_name,
    });

    // 3. Create the new User (Owner)
    const newUser = new User({
      shop_id: newShop._id,
      email: email.toLowerCase(),
      password, // Password will be hashed by the Mongoose hook
      full_name,
      role: 'owner',
    });

    // 4. Link the Shop back to the User
    newShop.owner_id = newUser._id;

    // 5. Save both to the database
    await newShop.save();
    await newUser.save();

    // 6. Generate a token
    const token = generateToken(newUser);

    // 7. Send the successful response
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

/**
 * @desc    Authenticate a User (Owner or Worker)
 * @route   POST /api/v1/auth/login
 */
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Find the user by email
    const user = await User.findOne({ email: email.toLowerCase() });

    // 2. Check if user exists AND if password matches
    if (user && (await user.comparePassword(password))) {
      
      // 3. Generate a token
      const token = generateToken(user);

      // 4. Send the successful response
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

module.exports = { signup, login };