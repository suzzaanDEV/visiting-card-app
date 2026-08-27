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

// Get VAPID public key
exports.getVapidKey = async (req, res, next) => {
  try {
    const publicKey = notificationService.getVapidPublicKey();
    if (!publicKey) {
      return res.status(503).json({ error: 'Push notifications not configured' });
    }
    res.status(200).json({ publicKey });
  } catch (error) {
    logger.error(`Get VAPID key error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

// Subscribe to push notifications
exports.subscribe = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { endpoint, keys } = req.body;

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return res.status(400).json({ error: 'Invalid subscription data' });
    }

    await notificationService.savePushSubscription(userId, { endpoint, keys });

    res.status(200).json({
      success: true,
      message: 'Push subscription saved'
    });
  } catch (error) {
    logger.error(`Subscribe error: ${error.message}`);
    res.status(400).json({ error: error.message });
  }
};

// Unsubscribe from push notifications
exports.unsubscribe = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { endpoint } = req.body;

    if (!endpoint) {
      return res.status(400).json({ error: 'Endpoint required' });
    }

    await notificationService.removePushSubscription(userId, endpoint);

    res.status(200).json({
      success: true,
      message: 'Push subscription removed'
    });
  } catch (error) {
    logger.error(`Unsubscribe error: ${error.message}`);
    res.status(400).json({ error: error.message });
  }
};

// Get notification preferences
exports.getPreferences = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const preferences = await notificationService.getPreferences(userId);

    res.status(200).json({
      success: true,
      preferences
    });
  } catch (error) {
    logger.error(`Get preferences error: ${error.message}`);
    res.status(400).json({ error: error.message });
  }
};

// Update notification preferences
exports.updatePreferences = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const preferences = await notificationService.updatePreferences(userId, req.body);

    res.status(200).json({
      success: true,
      preferences,
      message: 'Preferences updated'
    });
  } catch (error) {
    logger.error(`Update preferences error: ${error.message}`);
    res.status(400).json({ error: error.message });
  }
};
