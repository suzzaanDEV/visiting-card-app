const adminService = require('../services/adminService');
const userService = require('../services/userService');
const cardService = require('../services/cardService');
const templateService = require('../services/templateService');
const cardAccessService = require('../services/cardAccessService');
const logger = require('../utils/logger');
const Template = require('../models/templateModel');

// Add admin activity logging
const logAdminActivity = async (adminId, action, details) => {
  try {
    const logEntry = {
      adminId,
      action,
      details,
      timestamp: new Date(),
      ipAddress: req.ip || 'unknown'
    };
    // Store in admin activity log
    console.log('Admin Activity:', logEntry);
  } catch (error) {
    console.error('Failed to log admin activity:', error);
  }
};

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
    const { reason } = req.body;
    
    const result = await userService.toggleUserBan(userId, { 
      banned: true, 
      reason: reason || 'Account suspended by administrator' 
    });
    
    res.status(200).json({
      message: 'User banned successfully',
      user: result
    });
  } catch (error) {
    logger.error(`Ban user error: ${error.message}`);
    res.status(400).json({ error: error.message });
  }
};

// Unban user
exports.unbanUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    
    const result = await userService.toggleUserBan(userId, { 
      banned: false, 
      reason: null 
    });
    
    res.status(200).json({
      message: 'User unbanned successfully',
      user: result
    });
  } catch (error) {
    logger.error(`Unban user error: ${error.message}`);
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
    
    // Ensure we have proper data structure
    const response = {
      overview: {
        totalUsers: analytics.overview?.totalUsers || 0,
        totalCards: analytics.overview?.totalCards || 0,
        totalViews: analytics.overview?.totalViews || 0,
        totalRevenue: analytics.overview?.totalRevenue || 0,
        growthRate: analytics.overview?.growthRate || 0
      },
      userGrowth: analytics.userGrowth || [],
      cardGrowth: analytics.cardGrowth || [],
      deviceAnalytics: analytics.deviceAnalytics || { desktop: 45, mobile: 40, tablet: 15 },
      geographicAnalytics: analytics.geographicAnalytics || {
        'United States': 35,
        'India': 25,
        'United Kingdom': 15,
        'Canada': 10,
        'Australia': 8,
        'Others': 7
      },
      engagementMetrics: analytics.engagementMetrics || {
        views: 0,
        loves: 0,
        shares: 0,
        downloads: 0,
        avgSessionTime: 4.5,
        bounceRate: 23.5
      },
      topCards: analytics.topCards || [],
      recentActivity: analytics.recentActivity || []
    };
    
    res.status(200).json(response);
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
    const { page = 1, limit = 20, category, isActive, isFeatured, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    const filters = {};
    if (category) filters.category = category;
    if (isActive !== undefined) filters.isActive = isActive === 'true';
    if (isFeatured !== undefined) filters.isFeatured = isFeatured === 'true';
    if (search) filters.search = search;
    
    const templates = await templateService.getAllTemplates({
      page: parseInt(page),
      limit: parseInt(limit),
      sortBy,
      sortOrder,
      ...filters
    });
    
    res.status(200).json(templates);
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

 

// Get all access requests (admin only)
exports.getAllAccessRequests = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    const accessRequests = await cardAccessService.getAllAccessRequests({
      page: parseInt(page),
      limit: parseInt(limit),
      status,
      sortBy,
      sortOrder
    });
    
    res.status(200).json(accessRequests);
  } catch (error) {
    logger.error(`Get all access requests error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

// Admin approve access request
exports.adminApproveAccessRequest = async (req, res, next) => {
  try {
    const { requestId } = req.params;
    const { adminNotes } = req.body;
    
    const result = await cardAccessService.approveAccessRequest(requestId, {
      adminId: req.admin.adminId,
      adminNotes
    });
    
    res.status(200).json(result);
  } catch (error) {
    logger.error(`Admin approve access request error: ${error.message}`);
    res.status(400).json({ error: error.message });
  }
};

// Admin reject access request
exports.adminRejectAccessRequest = async (req, res, next) => {
  try {
    const { requestId } = req.params;
    const { adminNotes, reason } = req.body;
    
    const result = await cardAccessService.rejectAccessRequest(requestId, {
      adminId: req.admin.adminId,
      adminNotes,
      reason
    });
    
    res.status(200).json(result);
  } catch (error) {
    logger.error(`Admin reject access request error: ${error.message}`);
    res.status(400).json({ error: error.message });
  }
};

// Get admin notifications
exports.getNotifications = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, isRead } = req.query;
    
    // Get notifications from the database
    const Notification = require('../models/notificationModel');
    
    const query = { isDeleted: { $ne: true } };
    if (isRead !== undefined) {
      query.isRead = isRead === 'true';
    }
    
    // For admin, show system notifications and access request notifications
    // Also show notifications where recipientId is null (system notifications)
    query.$or = [
      { type: { $in: ['system', 'access_request', 'access_approved', 'access_rejected'] } },
      { recipientId: null } // System notifications
    ];
    
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit))
      .populate('recipientId', 'username name')
      .populate('senderId', 'username name')
      .lean();
    
    const total = await Notification.countDocuments(query);
    
    res.status(200).json({
      notifications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    logger.error(`Get notifications error: ${error.message}`);
    // Return empty notifications instead of error
    res.status(200).json({
      notifications: [],
      pagination: {
        page: parseInt(req.query.page || 1),
        limit: parseInt(req.query.limit || 20),
        total: 0,
        pages: 0
      }
    });
  }
};

// Mark notification as read
exports.markNotificationAsRead = async (req, res, next) => {
  try {
    const { notificationId } = req.params;
    
    const Notification = require('../models/notificationModel');
    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { isRead: true },
      { new: true }
    );
    
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    res.status(200).json(notification);
  } catch (error) {
    logger.error(`Mark notification as read error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

// Create admin notification (internal method)
const createAdminNotification = async (title, message, type = 'system', data = {}) => {
  try {
    const Notification = require('../models/notificationModel');
    
    // Create a system notification for admin
    const notification = new Notification({
      recipientId: null, // System notification
      type: type,
      title: title,
      message: message,
      data: data,
      isRead: false
    });
    
    await notification.save();
    return notification;
  } catch (error) {
    logger.error(`Create admin notification error: ${error.message}`);
  }
}; 