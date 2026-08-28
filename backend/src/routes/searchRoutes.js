const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');
const logger = require('../utils/logger');
const { searchLimiter } = require('../middleware/rateLimiter');
const { filterSensitiveData, addPrivacyHeaders } = require('../middleware/privacyMiddleware');

// Enhanced search endpoints
router.get('/', addPrivacyHeaders, filterSensitiveData, searchLimiter, searchController.searchCards);
router.get('/suggestions', searchLimiter, searchController.getSuggestions);
router.post('/advanced', addPrivacyHeaders, filterSensitiveData, searchLimiter, searchController.advancedSearch);
router.get('/analytics', searchController.getSearchAnalytics);
router.get('/performance', searchController.getSearchPerformance);

// Legacy endpoints
router.get('/popular', addPrivacyHeaders, filterSensitiveData, searchLimiter, searchController.getPopularCards);
router.get('/recent', addPrivacyHeaders, filterSensitiveData, searchLimiter, searchController.getRecentCards);
router.get('/recommendations/:cardId', addPrivacyHeaders, filterSensitiveData, searchController.getRecommendations);
router.get('/category/:category', addPrivacyHeaders, filterSensitiveData, searchController.getCardsByCategory);

module.exports = router;