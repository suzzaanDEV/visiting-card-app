const jwt = require('jsonwebtoken');
const Admin = require('../models/adminModel');
const logger = require('../utils/logger');

const authenticateAdmin = async (req, res, next) => {
  // Bypass auth in development mode
  if (process.env.NODE_ENV !== 'production') {
    try {
      const Admin = require('../models/adminModel');
      const admin = await Admin.findOne({ role: 'super_admin' });
      if (admin) {
        req.admin = {
          adminId: admin._id,
          username: admin.username || admin.name,
          email: admin.email,
          role: admin.role
        };
        req.user = { ...req.admin };
        return next();
      }
    } catch { /* fall through to hardcoded fallback */ }
    req.admin = {
      adminId: 'dev-admin-id',
      username: 'admin',
      email: 'admin@gmail.com',
      role: 'super_admin'
    };
    req.user = { ...req.admin };
    return next();
  }

  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user is admin
    const admin = await Admin.findById(decoded.userId);
    if (!admin || !admin.isActive) {
      return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
    }

    // Add admin info to request
    req.admin = {
      adminId: admin._id,
      username: admin.username,
      email: admin.email,
      role: admin.role
    };

    next();
  } catch (error) {
    logger.error(`Admin middleware error: ${error.message}`);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token.' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired.' });
    }
    return res.status(500).json({ error: 'Server error.' });
  }
};

const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.admin || !roles.includes(req.admin.role)) {
      return res.status(403).json({ error: 'Access denied. Insufficient role privileges.' });
    }
    next();
  };
};

const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({ error: 'Authentication required.' });
    }
    if (req.admin.role === 'super_admin' || (req.admin.permissions && req.admin.permissions.includes(permission))) {
      return next();
    }
    return res.status(403).json({ error: 'Access denied. Insufficient permissions.' });
  };
};

module.exports = { authenticateAdmin, requireRole, requirePermission };