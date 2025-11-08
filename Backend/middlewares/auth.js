const jwt = require('jsonwebtoken');
require('dotenv').config();


const authenticate = (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      // 1. Get token from header (e.g., "Bearer <token>")
      token = authHeader.split(' ')[1];

      // 2. Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 3. Attach core user info to the request object
      // This 'req.user' will be available in all following routes
      req.user = {
        userId: decoded.userId,
        shopId: decoded.shopId,
        role: decoded.role,
      };

      next();
    } catch (error) {
      console.error('Token verification failed', error.message);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};


const authorize = (...roles) => {
  return (req, res, next) => {
    // 'req.user' is attached by the 'authenticate' middleware
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Forbidden. User role '${req.user.role}' cannot access this. Requires: ${roles.join(' or ')}`
      });
    }
    next();
  };
};

module.exports = {
  authenticate,
  authorize,
};