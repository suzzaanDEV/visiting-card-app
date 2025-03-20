const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { authenticateAdmin } = require('../middleware/adminMiddleware');

// Track user interaction (public route for anonymous tracking)
router.post('/track', analyticsController.trackInteraction);

// Get card analytics (requires authentication)
router.get('/card/:cardId', authenticateToken, analyticsController.getCardAnalytics);

// Get user engagement analytics (requires authentication)
router.get('/user/:userId', authenticateToken, analyticsController.getUserEngagement);

// Get trending cards (public route)
router.get('/trending', analyticsController.getTrendingCards);

// Get system analytics (admin only)
router.get('/system', authenticateAdmin, analyticsController.getSystemAnalytics);

// Get real-time analytics (requires authentication)
router.get('/realtime/:cardId', authenticateToken, analyticsController.getRealTimeAnalytics);

// Get engagement insights (requires authentication)
router.get('/insights/:cardId', authenticateToken, analyticsController.getEngagementInsights);

// Export analytics report (requires authentication)
router.get('/export/:cardId', authenticateToken, analyticsController.exportAnalyticsReport);

module.exports = router; 