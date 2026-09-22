const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');
const logger = require('../utils/logger');
const { filterSensitiveData, addPrivacyHeaders } = require('../middleware/privacyMiddleware');

// Enhanced search endpoints
router.get('/', addPrivacyHeaders, filterSensitiveData, searchController.searchCards);
router.get('/suggestions', searchController.getSuggestions);
router.post('/advanced', addPrivacyHeaders, filterSensitiveData, searchController.advancedSearch);
router.get('/analytics', searchController.getSearchAnalytics);
router.get('/performance', searchController.getSearchPerformance);

// Legacy endpoints
router.get('/popular', addPrivacyHeaders, filterSensitiveData, searchController.getPopularCards);
router.get('/recent', addPrivacyHeaders, filterSensitiveData, searchController.getRecentCards);
router.get('/recommendations/:cardId', addPrivacyHeaders, filterSensitiveData, searchController.getRecommendations);
router.get('/category/:category', addPrivacyHeaders, filterSensitiveData, searchController.getCardsByCategory);

module.exports = router;