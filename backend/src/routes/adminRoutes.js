const express = require('express');
const router = express.Router();
const { authenticateAdmin } = require('../middleware/adminMiddleware');
const { authLimiter } = require('../middleware/authMiddleware');
const { upload, handleMulterError } = require('../utils/multerConfig');
const adminController = require('../controllers/adminController');

// Public routes (no auth required)
router.get('/settings/public', adminController.getPublicSettings);
router.get('/categories', adminController.getCardCategories);

// Admin authentication — rate limited to prevent credential brute-force/OTP guessing
router.post('/login', authLimiter, adminController.adminLogin);
router.post('/verify-otp', authLimiter, adminController.verifyAdminOtp);
router.post('/logout', authenticateAdmin, adminController.adminLogout);

// Dashboard
router.get('/dashboard', authenticateAdmin, adminController.getDashboard);
router.get('/realtime', authenticateAdmin, adminController.getRealTimeData);

// Admin profile
router.get('/profile', authenticateAdmin, adminController.getAdminProfile);
router.put('/profile', authenticateAdmin, adminController.updateAdminProfile);
router.put('/profile/password', authenticateAdmin, adminController.changeAdminPassword);
router.post('/profile/2fa/toggle', authenticateAdmin, adminController.toggleAdminTwoFactor);

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
router.post('/templates/background', authenticateAdmin, upload.single('image'), handleMulterError, adminController.uploadTemplateBackgroundImage);
router.put('/templates/:templateId', authenticateAdmin, adminController.updateTemplate);
router.delete('/templates/:templateId', authenticateAdmin, adminController.deleteTemplate);
router.put('/templates/:templateId/featured', authenticateAdmin, adminController.toggleTemplateFeatured);
router.post('/templates/:templateId/background', authenticateAdmin, upload.single('image'), handleMulterError, adminController.uploadTemplateBackground);

// Analytics
router.get('/analytics', authenticateAdmin, adminController.getAnalytics);
router.get('/analytics/cards/:cardId', authenticateAdmin, adminController.getCardAnalytics);
router.get('/analytics/users/:userId', authenticateAdmin, adminController.getUserAnalytics);

// Settings
router.get('/settings', authenticateAdmin, adminController.getSettings);
router.put('/settings', authenticateAdmin, adminController.updateSettings);
router.post('/backup', authenticateAdmin, adminController.createBackup);
router.post('/restore', authenticateAdmin, adminController.restoreBackup);

// Notifications
router.get('/notifications', authenticateAdmin, adminController.getNotifications);
router.put('/notifications/:notificationId/read', authenticateAdmin, adminController.markNotificationAsRead);

module.exports = router; 