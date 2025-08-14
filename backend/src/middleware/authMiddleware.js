const jwt = require('jsonwebtoken');
const Admin = require('../models/adminModel');
const User = require('../models/userModel');
const logger = require('../utils/logger');
const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many authentication attempts, please try again later'
});

const authenticateToken = async (req, res, next) => {
  
  // Get Authorization header (case-insensitive)
  const authHeader = req.headers.authorization || req.headers.Authorization;
  logger.info(`Authorization header: ${authHeader || 'none'}`);

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    logger.error('Invalid or missing Authorization header');
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.replace('Bearer ', '').trim();
  logger.info(`Token: ${token.slice(0, 10)}... (length: ${token.length})`);

  // Check for placeholder tokens
  if (token.includes('{{') || token.includes('}}')) {
    logger.error(`Invalid token: Placeholder detected (${token})`);
    return res.status(401).json({ error: 'Invalid token: Placeholder detected' });
  }

  // Basic token format validation
  if (!token || token.split('.').length !== 3) {
    logger.error(`Token is malformed or not a valid JWT: ${token.slice(0, 20)}...`);
    return res.status(401).json({ error: 'Malformed token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.userId || !decoded.email) {
      logger.error('Decoded token missing required fields');
      return res.status(401).json({ error: 'Invalid token structure' });
    }

    // Check if user still exists and is active
    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      logger.error(`User not found or inactive: ${decoded.email}`);
      return res.status(401).json({ error: 'User account not found or inactive' });
    }

    // Update last login time
    user.lastLoginAt = new Date();
    await user.save();

    req.user = decoded; // { userId, email }
    req.userInfo = user; // Full user object
    logger.info(`Token verified for user: ${decoded.email}`);
    next();
  } catch (error) {
    logger.error(`Auth middleware error: ${error.name} - ${error.message}`);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Malformed or invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(401).json({ error: 'Token verification failed' });
  }
};

const authenticateAdmin = async (req, res, next) => {
  try {
    // Get Authorization header (case-insensitive)
    const authHeader = req.headers.authorization || req.headers.Authorization;
    logger.info(`Admin Authorization header: ${authHeader || 'none'}`);

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logger.error('Invalid or missing Authorization header for admin');
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.replace('Bearer ', '').trim();
    logger.info(`Admin Token: ${token.slice(0, 10)}... (length: ${token.length})`);

    // Check for placeholder tokens
    if (token.includes('{{') || token.includes('}}')) {
      logger.error(`Invalid admin token: Placeholder detected (${token})`);
      return res.status(401).json({ error: 'Invalid token: Placeholder detected' });
    }

    // Basic token format validation
    if (!token || token.split('.').length !== 3) {
      logger.error(`Admin token is malformed or not a valid JWT: ${token.slice(0, 20)}...`);
      return res.status(401).json({ error: 'Malformed token' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.userId || !decoded.email) {
      logger.error('Decoded admin token missing required fields');
      return res.status(401).json({ error: 'Invalid token structure' });
    }

    // Check if admin exists and is active
    const admin = await Admin.findById(decoded.userId);
    if (!admin || !admin.isActive) {
      logger.error(`Admin not found or inactive: ${decoded.email}`);
      return res.status(403).json({ error: 'Admin account not found or inactive' });
    }

    // Update last login time
    admin.lastLoginAt = new Date();
    await admin.save();

    req.admin = {
      adminId: admin._id,
      username: admin.username,
      email: admin.email,
      role: admin.role
    };
    req.user = decoded; // Keep user info for compatibility
    logger.info(`Admin token verified for: ${decoded.email}`);
    next();
  } catch (error) {
    logger.error(`Admin middleware error: ${error.name} - ${error.message}`);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Malformed or invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(401).json({ error: 'Token verification failed' });
  }
};

// Existing authenticate middleware
const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid token. User not found.' });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({ 
        error: 'Account deactivated',
        message: 'Your account has been deactivated. Please contact your administrator for further assistance.',
        code: 'ACCOUNT_DEACTIVATED'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    logger.error(`Authentication error: ${error.message}`);
    res.status(401).json({ error: 'Invalid token.' });
  }
};

// New middleware to check user activation status
const checkUserActive = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid token. User not found.' });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({ 
        error: 'Account deactivated',
        message: 'Your account has been deactivated. Please contact your administrator for further assistance.',
        code: 'ACCOUNT_DEACTIVATED',
        contactEmail: process.env.ADMIN_EMAIL || 'admin@cardly.com'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    logger.error(`User activation check error: ${error.message}`);
    res.status(401).json({ error: 'Invalid token.' });
  }
};

// Middleware to check user activation without requiring token (for public routes)
const checkUserActiveOptional = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return next(); // Continue without user info
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return next(); // Continue without user info
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({ 
        error: 'Account deactivated',
        message: 'Your account has been deactivated. Please contact your administrator for further assistance.',
        code: 'ACCOUNT_DEACTIVATED',
        contactEmail: process.env.ADMIN_EMAIL || 'admin@cardly.com'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    // If token is invalid, continue without user info
    next();
  }
};

module.exports = {
  authenticateToken,
  authenticateAdmin,
  authenticate,
  checkUserActive,
  checkUserActiveOptional
};  