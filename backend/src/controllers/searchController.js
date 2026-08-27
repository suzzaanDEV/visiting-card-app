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
      dateRange,
      location,
      industry,
      profession
    } = req.query;

    const safePage = Math.max(parseInt(page) || 1, 1);
    const safeLimit = Math.min(Math.max(parseInt(limit) || 20, 1), 50);

    const extraFilter = {};
    if (dateRange && dateRange !== 'all') {
      const now = new Date();
      let cutoffDate;
      switch (dateRange) {
        case 'today':
          cutoffDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case 'year':
          cutoffDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
      }
      if (cutoffDate) {
        extraFilter.createdAt = { $gte: cutoffDate };
      }
    }

    if (location && location.trim()) {
      const { escapeRegex } = require('../utils/sanitize');
      const safeLoc = escapeRegex(location.trim());
      extraFilter.$or = [
        { city: { $regex: safeLoc, $options: 'i' } },
        { state: { $regex: safeLoc, $options: 'i' } },
        { country: { $regex: safeLoc, $options: 'i' } },
        { address: { $regex: safeLoc, $options: 'i' } }
      ];
    }

    const result = await searchService.searchCards({
      query: q || '',
      category,
      sortBy,
      page: safePage,
      limit: safeLimit,
      algorithm,
      tags,
      extraFilter,
      industry,
      profession,
      location
    });

    res.status(200).json({
      ...result,
      currentPage: safePage,
      totalPages: Math.ceil(result.total / safeLimit)
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

    const safeLimit = Math.min(Math.max(parseInt(limit) || 5, 1), 20);
    const suggestions = await searchService.getSuggestions(query.trim(), safeLimit);
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

    const safePage = Math.max(parseInt(page) || 1, 1);
    const safeLimit = Math.min(Math.max(parseInt(limit) || 6, 1), 50);
    
    const result = await searchService.getPopularCards(
      safeLimit,
      sortBy,
      sortOrder,
      safePage,
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

    const safePage = Math.max(parseInt(page) || 1, 1);
    const safeLimit = Math.min(Math.max(parseInt(limit) || 6, 1), 50);
    
    const result = await searchService.getRecentCards(
      safeLimit,
      sortBy,
      sortOrder,
      safePage,
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
      searchType = 'hybrid',
      location,
      industry,
      jobTitle,
      company,
      skills
    } = req.body;

    const safePage = Math.max(parseInt(page) || 1, 1);
    const safeLimit = Math.min(Math.max(parseInt(limit) || 20, 1), 50);

    const { escapeRegex } = require('../utils/sanitize');
    const extraFilter = {};
    const andConditions = [];

    if (dateRange && dateRange !== 'all') {
      const now = new Date();
      let cutoffDate;
      switch (dateRange) {
        case 'today':
          cutoffDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case 'year':
          cutoffDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
      }
      if (cutoffDate) {
        extraFilter.createdAt = { $gte: cutoffDate };
      }
    }

    if (location && location.trim()) {
      const safeLoc = escapeRegex(location.trim());
      andConditions.push({
        $or: [
          { city: { $regex: safeLoc, $options: 'i' } },
          { state: { $regex: safeLoc, $options: 'i' } },
          { country: { $regex: safeLoc, $options: 'i' } },
          { address: { $regex: safeLoc, $options: 'i' } }
        ]
      });
    }

    if (industry && industry.trim()) {
      andConditions.push({ industry: { $regex: escapeRegex(industry.trim()), $options: 'i' } });
    }

    if (jobTitle && jobTitle.trim()) {
      andConditions.push({ jobTitle: { $regex: escapeRegex(jobTitle.trim()), $options: 'i' } });
    }

    if (company && company.trim()) {
      andConditions.push({ company: { $regex: escapeRegex(company.trim()), $options: 'i' } });
    }

    if (skills && skills.trim()) {
      const skillList = skills.split(',').map((s) => s.trim()).filter(Boolean);
      if (skillList.length > 0) {
        andConditions.push({ skills: { $in: skillList.map((s) => new RegExp(escapeRegex(s), 'i')) } });
      }
    }

    if (andConditions.length > 0) {
      extraFilter.$and = andConditions;
    }

    const result = await searchService.searchCards({
      query,
      category,
      sortBy,
      page: safePage,
      limit: safeLimit,
      algorithm: searchType,
      tags,
      extraFilter
    });

    res.status(200).json({
      ...result,
      currentPage: safePage,
      totalPages: Math.ceil(result.total / safeLimit)
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

exports.getCardsByCategory = async (req, res, next) => {
  try {
    const { category } = req.params;
    const { limit = 20 } = req.query;

    if (!category || category.trim().length === 0) {
      return res.status(400).json({ error: 'Category parameter is required' });
    }

    const safeLimit = Math.min(Math.max(parseInt(limit) || 20, 1), 50);
    const filter = { isPublic: true, isActive: true };
    filter.category = category.toLowerCase();
    const Card = require('../models/cardModel');
    const cards = await Card.find(filter)
      .sort({ createdAt: -1 })
      .limit(safeLimit)
      .populate('ownerUserId', 'name username');
    res.status(200).json({ cards, total: cards.length });
  } catch (error) {
    logger.error(`Get cards by category error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

exports.getRecommendations = async (req, res) => {
  try {
    const { cardId } = req.params;
    const { limit = 6 } = req.query;

    if (!cardId) {
      return res.status(400).json({ error: 'Card ID is required' });
    }

    const safeLimit = Math.min(Math.max(parseInt(limit) || 6, 1), 50);
    const result = await searchService.getRecommendations(cardId, safeLimit);
    res.status(200).json(result);
  } catch (error) {
    logger.error(`Recommendations error: ${error.message}`);
    const status = error.message.includes('not found') ? 404 : 500;
    res.status(status).json({ error: error.message });
  }
};
