const User = require('../models/user.js');

exports.getMe = async (req, res) => {
  if (!req.user) {
    return res.status(404).json({ message: 'User not found' });
  }
  
  res.status(200).json({
    message: "User profile fetched successfully",
    user: req.user 
  });
};