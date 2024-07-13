const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET); // Ensure process.env.JWT_SECRET is used here
      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) {
        throw new Error('User not found');
      }
      next();
    } catch (error) {
      console.error('Authorization error:', error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};


const protectRoute = (roles) => (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1]; // Assumes Bearer token
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const userRole = decodedToken.role;

    if (!roles.includes(userRole)) {
      return res.status(403).json({ message: "You don't have permission to perform this action" });
    }

    req.user = decodedToken;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid or missing token' });
  }
};

module.exports = { protect, protectRoute };
