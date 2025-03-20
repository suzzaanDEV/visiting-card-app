const adminService = require('../services/adminService');
const userService = require('../services/userService');
const cardService = require('../services/cardService');
const templateService = require('../services/templateService');
const logger = require('../utils/logger');
const Template = require('../models/templateModel');

// Admin login
exports.adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await adminService.login({ email, password });
    res.status(200).json(result);
  } catch (error) {
    logger.error(`Admin login error: ${error.message}`);
    res.status(401).json({ error: error.message });
  }
};

// Admin logout
exports.adminLogout = async (req, res, next) => {
  try {
    res.status(200).json({ message: 'Admin logged out successfully' });
  } catch (error) {
    logger.error(`Admin logout error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

// Get admin profile
exports.getAdminProfile = async (req, res, next) => {
  try {
    const adminId = req.admin.adminId;
    const admin = await adminService.getAdminById(adminId);
    res.status(200).json(admin);
  } catch (error) {
    logger.error(`Get admin profile error: ${error.message}`);
    res.status(404).json({ error: error.message });
  }
};

// Get admin dashboard
exports.getDashboard = async (req, res, next) => {
  try {
    const stats = await adminService.getDashboardStats();
    res.status(200).json(stats);
  } catch (error) {
    logger.error(`Get dashboard error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

// Get real-time data
exports.getRealTimeData = async (req, res, next) => {
  try {
    const realTimeData = await adminService.getRealTimeData();
    res.status(200).json(realTimeData);
  } catch (error) {
    logger.error(`Get real-time data error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

// Ban user
exports.banUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const result = await userService.toggleUserBan(userId);
    res.status(200).json(result);
  } catch (error) {
    logger.error(`Ban user error: ${error.message}`);
    res.status(400).json({ error: error.message });
  }
};

// Feature card
exports.featureCard = async (req, res, next) => {
  try {
    const { cardId } = req.params;
    const result = await cardService.toggleCardFeature(cardId);
    res.status(200).json(result);
  } catch (error) {
    logger.error(`Feature card error: ${error.message}`);
    res.status(400).json({ error: error.message });
  }
};

// Toggle template featured
exports.toggleTemplateFeatured = async (req, res, next) => {
  try {
    const { templateId } = req.params;
    const { isFeatured } = req.body;
    
    const template = await templateService.getTemplateById(templateId);
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    template.isFeatured = isFeatured;
    await template.save();
    
    res.status(200).json({ 
      message: `Template ${isFeatured ? 'featured' : 'unfeatured'} successfully`,
      template 
    });
  } catch (error) {
    logger.error(`Toggle template featured error: ${error.message}`);
    res.status(400).json({ error: error.message });
  }
};

// Get all users (admin only)
exports.getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    const users = await userService.getAllUsers({
      page: parseInt(page),
      limit: parseInt(limit),
      search,
      sortBy,
      sortOrder
    });
    
    res.status(200).json(users);
  } catch (error) {
    logger.error(`Get all users error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

// Get user details
exports.getUserDetails = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = await userService.getUserById(userId);
    res.status(200).json({ user });
  } catch (error) {
    logger.error(`Get user details error: ${error.message}`);
    res.status(404).json({ error: error.message });
  }
};

// Get user by ID (alias for getUserDetails)
exports.getUserById = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = await userService.getUserById(userId);
    res.status(200).json({ user });
  } catch (error) {
    logger.error(`Get user by ID error: ${error.message}`);
    res.status(404).json({ error: error.message });
  }
};

// Update user (admin only)
exports.updateUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const updateData = req.body;
    
    const user = await userService.updateUser(userId, updateData);
    res.status(200).json({ user });
  } catch (error) {
    logger.error(`Update user error: ${error.message}`);
    res.status(400).json({ error: error.message });
  }
};

// Delete user (admin only)
exports.deleteUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    await userService.deleteUser(userId);
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    logger.error(`Delete user error: ${error.message}`);
    res.status(400).json({ error: error.message });
  }
};

// Get all cards (admin only)
exports.getAllCards = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, category, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    const cards = await cardService.getAllCards({
      page: parseInt(page),
      limit: parseInt(limit),
      search,
      category,
      sortBy,
      sortOrder
    });
    
    res.status(200).json(cards);
  } catch (error) {
    logger.error(`Get all cards error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

// Get card details
exports.getCardDetails = async (req, res, next) => {
  try {
    const { cardId } = req.params;
    const card = await cardService.getCardById(cardId);
    res.status(200).json({ card });
  } catch (error) {
    logger.error(`Get card details error: ${error.message}`);
    res.status(404).json({ error: error.message });
  }
};

// Get card by ID (alias for getCardDetails)
exports.getCardById = async (req, res, next) => {
  try {
    const { cardId } = req.params;
    const card = await cardService.getCardById(cardId);
    res.status(200).json({ card });
  } catch (error) {
    logger.error(`Get card by ID error: ${error.message}`);
    res.status(404).json({ error: error.message });
  }
};

// Update card (admin only)
exports.updateCard = async (req, res, next) => {
  try {
    const { cardId } = req.params;
    const updateData = req.body;
    
    const card = await cardService.updateCardAdmin(cardId, updateData);
    res.status(200).json({ card });
  } catch (error) {
    logger.error(`Update card error: ${error.message}`);
    res.status(400).json({ error: error.message });
  }
};

// Delete card (admin only)
exports.deleteCard = async (req, res, next) => {
  try {
    const { cardId } = req.params;
    await cardService.deleteCardAdmin(cardId);
    res.status(200).json({ message: 'Card deleted successfully' });
  } catch (error) {
    logger.error(`Delete card error: ${error.message}`);
    res.status(400).json({ error: error.message });
  }
};

// Get analytics
exports.getAnalytics = async (req, res, next) => {
  try {
    const { period = '7d' } = req.query;
    const analytics = await adminService.getAnalytics(period);
    res.status(200).json(analytics);
  } catch (error) {
    logger.error(`Get analytics error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

// Get user analytics
exports.getUserAnalytics = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const analytics = await userService.getUserAnalytics(userId);
    res.status(200).json(analytics);
  } catch (error) {
    logger.error(`Get user analytics error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

// Get card analytics
exports.getCardAnalytics = async (req, res, next) => {
  try {
    const { cardId } = req.params;
    const analytics = await cardService.getCardAnalyticsAdmin(cardId);
    res.status(200).json(analytics);
  } catch (error) {
    logger.error(`Get card analytics error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

// Get trending cards
exports.getTrendingCards = async (req, res, next) => {
  try {
    const { limit = 10, period = '7d' } = req.query;
    const cards = await cardService.getTrendingCardsAdmin(parseInt(limit), period);
    res.status(200).json({ cards });
  } catch (error) {
    logger.error(`Get trending cards error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

// Get popular users
exports.getPopularUsers = async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;
    const users = await userService.getPopularUsers(parseInt(limit));
    res.status(200).json({ users });
  } catch (error) {
    logger.error(`Get popular users error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

// Ban/Unban user
exports.toggleUserBan = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { banned, reason } = req.body;
    
    const user = await userService.toggleUserBan(userId, { banned, reason });
    res.status(200).json({ user });
  } catch (error) {
    logger.error(`Toggle user ban error: ${error.message}`);
    res.status(400).json({ error: error.message });
  }
};

// Feature/Unfeature card
exports.toggleCardFeature = async (req, res, next) => {
  try {
    const { cardId } = req.params;
    const { featured } = req.body;
    
    const card = await cardService.toggleCardFeature(cardId, featured);
    res.status(200).json({ card });
  } catch (error) {
    logger.error(`Toggle card feature error: ${error.message}`);
    res.status(400).json({ error: error.message });
  }
};

// Get system health
exports.getSystemHealth = async (req, res, next) => {
  try {
    const health = await adminService.getSystemHealth();
    res.status(200).json(health);
  } catch (error) {
    logger.error(`Get system health error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

// Export data
exports.exportData = async (req, res, next) => {
  try {
    const { type, format = 'json' } = req.query;
    const data = await adminService.exportData(type, format);
    
    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${type}-${Date.now()}.csv"`);
      res.status(200).send(data);
    } else {
      res.status(200).json(data);
    }
  } catch (error) {
    logger.error(`Export data error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

// Template Management Methods

// Get all templates (admin only)
exports.getAllTemplates = async (req, res, next) => {
  try {
    const templates = await Template.find({ isActive: true }).sort({ createdAt: -1 });
    res.status(200).json({ templates });
  } catch (error) {
    logger.error(`Get all templates error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

// Get template by ID (admin only)
exports.getTemplateById = async (req, res, next) => {
  try {
    const template = await templateService.getTemplateById(req.params.templateId);
    res.status(200).json({ template });
  } catch (error) {
    logger.error(`Get template by ID error: ${error.message}`);
    res.status(404).json({ error: error.message });
  }
};

// Create template (admin only)
exports.createTemplate = async (req, res, next) => {
  try {
    const templateData = req.body;
    const adminId = req.user.userId;
    const template = await templateService.createTemplate(templateData, adminId);
    res.status(201).json({ template });
  } catch (error) {
    logger.error(`Create template error: ${error.message}`);
    res.status(400).json({ error: error.message });
  }
};

// Update template (admin only)
exports.updateTemplate = async (req, res, next) => {
  try {
    const template = await templateService.updateTemplate(req.params.templateId, req.body);
    res.status(200).json({ template });
  } catch (error) {
    logger.error(`Update template error: ${error.message}`);
    res.status(400).json({ error: error.message });
  }
};

// Delete template (admin only)
exports.deleteTemplate = async (req, res, next) => {
  try {
    await templateService.deleteTemplate(req.params.templateId);
    res.status(200).json({ message: 'Template deleted successfully' });
  } catch (error) {
    logger.error(`Delete template error: ${error.message}`);
    res.status(400).json({ error: error.message });
  }
};

// Settings Management Methods

// Get settings
exports.getSettings = async (req, res, next) => {
  try {
    const settings = await adminService.getSettings();
    res.status(200).json(settings);
  } catch (error) {
    logger.error(`Get settings error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

// Update settings
exports.updateSettings = async (req, res, next) => {
  try {
    const settings = req.body;
    const updatedSettings = await adminService.updateSettings(settings);
    res.status(200).json(updatedSettings);
  } catch (error) {
    logger.error(`Update settings error: ${error.message}`);
    res.status(400).json({ error: error.message });
  }
};

// Create backup
exports.createBackup = async (req, res, next) => {
  try {
    const backup = await adminService.createBackup();
    res.status(200).json({ 
      message: 'Backup created successfully',
      backup 
    });
  } catch (error) {
    logger.error(`Create backup error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

// Restore backup
exports.restoreBackup = async (req, res, next) => {
  try {
    const { backupId } = req.body;
    const result = await adminService.restoreBackup(backupId);
    res.status(200).json({ 
      message: 'Backup restored successfully',
      result 
    });
  } catch (error) {
    logger.error(`Restore backup error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
}; 