const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');
const logger = require('../utils/logger');

// Enhanced search endpoints
router.get('/', searchController.searchCards);
router.get('/suggestions', searchController.getSuggestions);
router.post('/advanced', searchController.advancedSearch);
router.get('/analytics', searchController.getSearchAnalytics);
router.get('/performance', searchController.getSearchPerformance);

// Legacy endpoints
router.get('/popular', searchController.getPopularCards);
router.get('/recent', searchController.getRecentCards);
router.get('/category/:category', searchController.getCardsByCategory);

module.exports = router;