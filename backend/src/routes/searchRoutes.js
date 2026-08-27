const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');
const logger = require('../utils/logger');
const { searchLimiter } = require('../middleware/rateLimiter');

// Enhanced search endpoints
router.get('/', searchLimiter, searchController.searchCards);
router.get('/suggestions', searchLimiter, searchController.getSuggestions);
router.post('/advanced', searchLimiter, searchController.advancedSearch);
router.get('/analytics', searchController.getSearchAnalytics);
router.get('/performance', searchController.getSearchPerformance);

// Legacy endpoints
router.get('/popular', searchLimiter, searchController.getPopularCards);
router.get('/recent', searchLimiter, searchController.getRecentCards);
router.get('/recommendations/:cardId', searchController.getRecommendations);
router.get('/category/:category', searchController.getCardsByCategory);

module.exports = router;