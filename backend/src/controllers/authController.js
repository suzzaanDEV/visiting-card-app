const authService = require('../services/authService');
const logger = require('../utils/logger');

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