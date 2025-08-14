const express = require('express');
const router = express.Router();
const { authenticateAdmin } = require('../middleware/adminMiddleware');
const adminController = require('../controllers/adminController');

// Admin authentication
router.post('/login', adminController.adminLogin);
router.post('/logout', authenticateAdmin, adminController.adminLogout);

// Dashboard
router.get('/dashboard', authenticateAdmin, adminController.getDashboard);
router.get('/realtime', authenticateAdmin, adminController.getRealTimeData);

// User management
router.get('/users', authenticateAdmin, adminController.getAllUsers);
router.get('/users/:userId', authenticateAdmin, adminController.getUserById);
router.put('/users/:userId', authenticateAdmin, adminController.updateUser);
router.delete('/users/:userId', authenticateAdmin, adminController.deleteUser);
router.post('/users/:userId/ban', authenticateAdmin, adminController.banUser);
router.post('/users/:userId/unban', authenticateAdmin, adminController.unbanUser);

// Access requests management
router.get('/access-requests', authenticateAdmin, adminController.getAllAccessRequests);
router.post('/access-requests/:requestId/approve', authenticateAdmin, adminController.adminApproveAccessRequest);
router.post('/access-requests/:requestId/reject', authenticateAdmin, adminController.adminRejectAccessRequest);

// Card management
router.get('/cards', authenticateAdmin, adminController.getAllCards);
router.get('/cards/:cardId', authenticateAdmin, adminController.getCardById);
router.put('/cards/:cardId', authenticateAdmin, adminController.updateCard);
router.delete('/cards/:cardId', authenticateAdmin, adminController.deleteCard);
router.post('/cards/:cardId/feature', authenticateAdmin, adminController.featureCard);
router.get('/cards/:cardId/analytics', authenticateAdmin, adminController.getCardAnalytics);

// Template management
router.get('/templates', authenticateAdmin, adminController.getAllTemplates);
router.get('/templates/:templateId', authenticateAdmin, adminController.getTemplateById);
router.post('/templates', authenticateAdmin, adminController.createTemplate);
router.put('/templates/:templateId', authenticateAdmin, adminController.updateTemplate);
router.delete('/templates/:templateId', authenticateAdmin, adminController.deleteTemplate);
router.put('/templates/:templateId/featured', authenticateAdmin, adminController.toggleTemplateFeatured);

// Analytics
router.get('/analytics', authenticateAdmin, adminController.getAnalytics);
router.get('/analytics/cards', authenticateAdmin, adminController.getCardAnalytics);
router.get('/analytics/users', authenticateAdmin, adminController.getUserAnalytics);

// Settings
router.get('/settings', authenticateAdmin, adminController.getSettings);
router.put('/settings', authenticateAdmin, adminController.updateSettings);
router.post('/backup', authenticateAdmin, adminController.createBackup);
router.post('/restore', authenticateAdmin, adminController.restoreBackup);

// Notifications
router.get('/notifications', authenticateAdmin, adminController.getNotifications);
router.put('/notifications/:notificationId/read', authenticateAdmin, adminController.markNotificationAsRead);

module.exports = router; 