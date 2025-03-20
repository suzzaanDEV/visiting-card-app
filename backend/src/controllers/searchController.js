const searchService = require('../services/searchService');
const advancedSearchAlgorithms = require('../algorithms/advancedSearchAlgorithms');
const logger = require('../utils/logger');

/**
 * Enhanced search cards with multiple algorithm support
 */
exports.searchCards = async (req, res, next) => {
  try {
    const { 
      q, 
      category, 
      sortBy = 'relevance', 
      page = 1, 
      limit = 20,
      searchType = 'hybrid',
      algorithm = 'hybrid',
      tags,
      dateRange
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const result = await searchService.searchCards({
      query: q || '',
      category,
      sortBy,
      page: parseInt(page),
      limit: parseInt(limit),
      algorithm
    });

    res.status(200).json({
      ...result,
      currentPage: parseInt(page),
      totalPages: Math.ceil(result.total / parseInt(limit))
    });
  } catch (error) {
    logger.error(`Search cards error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get search suggestions with enhanced algorithm
 */
exports.getSuggestions = async (req, res, next) => {
  try {
    const { query, limit = 5 } = req.query;
    
    if (!query || query.trim().length < 2) {
      return res.status(200).json({ suggestions: [] });
    }

    const suggestions = await searchService.getSuggestions(query.trim(), parseInt(limit));
    res.status(200).json({ suggestions });
  } catch (error) {
    logger.error(`Get suggestions error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

exports.getPopularCards = async (req, res, next) => {
  try {
    const { 
      limit = 6, 
      sortBy = 'popular', 
      sortOrder = 'desc', 
      page = 1, 
      q = '', 
      category = 'all' 
    } = req.query;
    
    const result = await searchService.getPopularCards(
      parseInt(limit),
      sortBy,
      sortOrder,
      parseInt(page),
      q,
      category
    );
    
    res.status(200).json(result);
  } catch (error) {
    logger.error(`Get popular cards error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

exports.getRecentCards = async (req, res, next) => {
  try {
    const { 
      limit = 6, 
      sortBy = 'recent', 
      sortOrder = 'desc', 
      page = 1, 
      q = '', 
      category = 'all',
      timeFilter = 'all'
    } = req.query;
    
    const result = await searchService.getRecentCards(
      parseInt(limit),
      sortBy,
      sortOrder,
      parseInt(page),
      q,
      category,
      timeFilter
    );
    
    res.status(200).json(result);
  } catch (error) {
    logger.error(`Get recent cards error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Advanced search with comprehensive filters
 */
exports.advancedSearch = async (req, res, next) => {
  try {
    const {
      query = '',
      category,
      tags,
      isPublic,
      userId,
      dateRange,
      sortBy = 'relevance',
      limit = 20,
      page = 1,
      searchType = 'hybrid'
    } = req.body;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const result = await searchService.searchCards({
      query,
      category,
      sortBy,
      page: parseInt(page),
      limit: parseInt(limit),
      algorithm: searchType
    });

    res.status(200).json({
      ...result,
      currentPage: parseInt(page),
      totalPages: Math.ceil(result.total / parseInt(limit))
    });
  } catch (error) {
    logger.error(`Advanced search error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get search analytics
 */
exports.getSearchAnalytics = async (req, res, next) => {
  try {
    const analytics = await searchService.getSearchAnalytics();
    res.status(200).json(analytics);
  } catch (error) {
    logger.error(`Search analytics error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get search performance metrics
 */
exports.getSearchPerformance = async (req, res, next) => {
  try {
    const performance = await searchService.getSearchPerformance();
    res.status(200).json(performance);
  } catch (error) {
    logger.error(`Search performance error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

exports.getCardsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { limit = 20 } = req.query;
    const cards = await searchService.getCardsByCategory(category, parseInt(limit));
    res.status(200).json(cards);
  } catch (error) {
    logger.error(`Category search error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};