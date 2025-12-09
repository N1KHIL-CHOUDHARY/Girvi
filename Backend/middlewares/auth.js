const jwt = require('jsonwebtoken');
require('dotenv').config();

const ApiError = require('../utils/ApiError');

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new ApiError(401, 'Not authorized. Token missing.'));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      userId: decoded.userId,
      shopId: decoded.shopId,
      role: decoded.role,
    };

    return next();
  } catch (error) {
    return next(new ApiError(401, 'Not authorized. Token invalid.'));
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new ApiError(403, 'Forbidden. Insufficient permissions.'));
    }

    return next();
  };
};

module.exports = {
  authenticate,
  authorize,
};
