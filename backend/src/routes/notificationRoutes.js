const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Public route - VAPID key (no auth needed)
router.get('/vapid-key', notificationController.getVapidKey);

// All other notification routes require authentication
router.use(authenticateToken);

// Get user's notifications
router.get('/', notificationController.getNotifications);

// Get notification statistics
router.get('/stats', notificationController.getNotificationStats);

// Get notification preferences
router.get('/preferences', notificationController.getPreferences);

// Update notification preferences
router.put('/preferences', notificationController.updatePreferences);

// Subscribe to push notifications
router.post('/subscribe', notificationController.subscribe);

// Unsubscribe from push notifications
router.post('/unsubscribe', notificationController.unsubscribe);

// Static path BEFORE parameterized routes
router.patch('/mark-all-read', notificationController.markAllAsRead);

// Mark notification as read
router.patch('/:notificationId/read', notificationController.markAsRead);

// Delete notification
router.delete('/:notificationId', notificationController.deleteNotification);

module.exports = router; 
