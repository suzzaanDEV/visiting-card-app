const jwt = require('jsonwebtoken');
const Admin = require('../models/adminModel');
const User = require('../models/userModel');
const logger = require('../utils/logger');
const rateLimit = require('express-rate-limit');

// Validate JWT_SECRET on module load
if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'your-super-secret-jwt-key-change-this-in-production') {
  if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging') {
    throw new Error('JWT_SECRET must be set in production/staging environment. Please set it in .env file.');
  }
  logger.warn('⚠️  JWT_SECRET not properly configured. Using default secret (not secure for production).');
}

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many authentication attempts, please try again later'
});

const authenticateToken = async (req, res, next) => {
  
  // Get Authorization header (case-insensitive)
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.replace('Bearer ', '').trim();

  // Check for placeholder tokens
  if (token.includes('{{') || token.includes('}}')) {
    return res.status(401).json({ error: 'Invalid token: Placeholder detected' });
  }

  // Basic token format validation
  if (!token || token.split('.').length !== 3) {
    return res.status(401).json({ error: 'Malformed token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.userId || !decoded.email) {
      return res.status(401).json({ error: 'Invalid token structure' });
    }

    // Check if user still exists and is active
    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'User account not found or inactive' });
    }

    req.user = decoded; // { userId, email }
    req.userInfo = user; // Full user object
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Malformed or invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(401).json({ error: 'Token verification failed' });
  }
};

// Soft auth — attaches req.user when a valid token is present but never fails the
// request. Used by public-but-personalizable endpoints (e.g. discovery).
const optionalAuthToken = async (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }
  const token = authHeader.replace('Bearer ', '').trim();
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded || !decoded.userId || !decoded.email) {
      return next();
    }
    const user = await User.findById(decoded.userId);
    if (user && user.isActive) {
      req.user = decoded;
      req.userInfo = user;
    }
  } catch {
    // Invalid/expired token on a public route — just continue anonymously
  }
  next();
};

const authenticateAdmin = async (req, res, next) => {
  try {
    // Get Authorization header (case-insensitive)
    const authHeader = req.headers.authorization || req.headers.Authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.replace('Bearer ', '').trim();

    // Check for placeholder tokens
    if (token.includes('{{') || token.includes('}}')) {
      return res.status(401).json({ error: 'Invalid token: Placeholder detected' });
    }

    // Basic token format validation
    if (!token || token.split('.').length !== 3) {
      return res.status(401).json({ error: 'Malformed token' });
    }

    const decoded = jwt.verify(token, process.env.ADMIN_JWT_SECRET || process.env.JWT_SECRET);
    if (!decoded.userId || !decoded.email) {
      return res.status(401).json({ error: 'Invalid token structure' });
    }

    // Check if admin exists and is active
    const admin = await Admin.findById(decoded.userId);
    if (!admin || !admin.isActive) {
      return res.status(403).json({ error: 'Admin account not found or inactive' });
    }

    // Token revocation: tokens signed before the current tokenVersion are rejected
    const tokenVersion = decoded.tv ?? 0;
    const currentVersion = admin.tokenVersion ?? 0;
    if (tokenVersion < currentVersion) {
      return res.status(401).json({ error: 'Token has been revoked. Please sign in again.' });
    }

    req.admin = {
      adminId: admin._id,
      username: admin.username,
      email: admin.email,
      role: admin.role
    };
    req.user = decoded; // Keep user info for compatibility
    next();
  } catch (error) {
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
  checkUserActiveOptional,
  optionalAuthToken,
  authLimiter
};  