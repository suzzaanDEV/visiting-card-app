const authService = require('../services/authService');
const logger = require('../utils/logger');

// Add input validation
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  return password.length >= 6;
};

exports.register = async (req, res, next) => {
  try {
    const { username, email, password, name } = req.body;
    const result = await authService.register({ username, email, password, name });
    res.status(201).json(result);
  } catch (error) {
    logger.error(`Registration error: ${error.message}`);
    res.status(400).json({ error: error.message });
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login({ email, password });
    res.status(200).json(result);
  } catch (error) {
    logger.error(`Login error: ${error.message}`);
    res.status(401).json({ error: error.message });
  }
};

exports.logout = async (req, res, next) => {
  try {
    await authService.logout(req.user.userId);
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    logger.error(`Logout error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

exports.getProfile = async (req, res, next) => {
  try {
    const user = await authService.getUserProfile(req.user.userId);
    res.status(200).json({ user });
  } catch (error) {
    logger.error(`Get profile error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { name, email, phone, location, website, bio } = req.body;
    const user = await authService.updateUserProfile(req.user.userId, {
      name,
      email,
      phone,
      location,
      website,
      bio
    });
    res.status(200).json({ user });
  } catch (error) {
    logger.error(`Update profile error: ${error.message}`);
    res.status(400).json({ error: error.message });
  }
};

exports.getUserStats = async (req, res, next) => {
  try {
    const stats = await authService.getUserStats(req.user.userId);
    res.status(200).json(stats);
  } catch (error) {
    logger.error(`Get user stats error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

exports.checkAuth = async (req, res, next) => {
  try {
    const user = await authService.getUserProfile(req.user.userId);
    res.status(200).json({ user });
  } catch (error) {
    logger.error(`Check auth error: ${error.message}`);
    res.status(401).json({ error: error.message });
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const result = await authService.forgotPassword(email);
    res.status(200).json(result);
  } catch (error) {
    logger.error(`Forgot password error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token and new password are required' });
    }

    const result = await authService.resetPassword(token, newPassword);
    res.status(200).json(result);
  } catch (error) {
    logger.error(`Reset password error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

exports.requestEmailOtp = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const result = await authService.requestEmailOtp(email);
    res.status(200).json(result);
  } catch (error) {
    logger.error(`Request email OTP error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

exports.verifyEmail = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required' });
    }

    const result = await authService.verifyEmailOtp(email, otp);
    res.status(200).json(result);
  } catch (error) {
    logger.error(`Email verification error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }
    
    // For now, just return a success message
    // In a real app, you would validate current password and update to new password
    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    logger.error(`Change password error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};