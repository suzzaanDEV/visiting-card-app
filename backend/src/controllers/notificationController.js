const notificationService = require('../services/notificationService');
const logger = require('../utils/logger');

// Get user's notifications
exports.getNotifications = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, unreadOnly = false } = req.query;
    const userId = req.user.userId;

    const result = await notificationService.getUserNotifications(userId, {
      page: parseInt(page),
      limit: parseInt(limit),
      unreadOnly: unreadOnly === 'true'
    });

    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    logger.error(`Get notifications error: ${error.message}`);
    res.status(400).json({ error: error.message });
  }
};

// Mark notification as read
exports.markAsRead = async (req, res, next) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.userId;

    const notification = await notificationService.markAsRead(notificationId, userId);
    
    res.status(200).json({
      success: true,
      notification,
      message: 'Notification marked as read'
    });
  } catch (error) {
    logger.error(`Mark notification as read error: ${error.message}`);
    res.status(400).json({ error: error.message });
  }
};

// Mark all notifications as read
exports.markAllAsRead = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    await notificationService.markAllAsRead(userId);
    
    res.status(200).json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    logger.error(`Mark all notifications as read error: ${error.message}`);
    res.status(400).json({ error: error.message });
  }
};

// Delete notification
exports.deleteNotification = async (req, res, next) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.userId;

    const notification = await notificationService.deleteNotification(notificationId, userId);
    
    res.status(200).json({
      success: true,
      notification,
      message: 'Notification deleted'
    });
  } catch (error) {
    logger.error(`Delete notification error: ${error.message}`);
    res.status(400).json({ error: error.message });
  }
};

// Get notification statistics
exports.getNotificationStats = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const stats = await notificationService.getNotificationStats(userId);
    
    res.status(200).json({
      success: true,
      stats
    });
  } catch (error) {
    logger.error(`Get notification stats error: ${error.message}`);
    res.status(400).json({ error: error.message });
  }
}; 