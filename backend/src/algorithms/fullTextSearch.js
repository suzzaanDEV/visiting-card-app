const Card = require('../models/cardModel');
const logger = require('../utils/logger');

/**
 * Advanced Multi-Algorithm Search System
 * Implements multiple search strategies for optimal results
 */

// Search algorithm types
const SEARCH_ALGORITHMS = {
  FUZZY: 'fuzzy',
  EXACT: 'exact', 
  FULLTEXT: 'fulltext',
  SEMANTIC: 'semantic',
  HYBRID: 'hybrid'
};

/**
 * Main search function with multiple algorithm support
 * @param {string} query - Search query
 * @param {object} options - Search options
 * @returns {object} Search results with metadata
 */
exports.search = async (query, options = {}) => {
  try {
    const {
      limit = 20,
      skip = 0,
      sortBy = 'relevance',
      filters = {},
      searchType = 'hybrid',
      includePrivate = false
    } = options;

    // Normalize query
    const normalizedQuery = query.trim().toLowerCase();
    
    if (!normalizedQuery && !Object.keys(filters).length) {
      return {
        results: [],
        total: 0,
        query: normalizedQuery,
        searchType,
        pagination: { limit, skip, hasMore: false }
      };
    }

    let searchQuery = {};

    // Build search query based on algorithm type
    switch (searchType) {
      case SEARCH_ALGORITHMS.FUZZY:
        searchQuery = buildFuzzyQuery(normalizedQuery);
        break;
      
      case SEARCH_ALGORITHMS.EXACT:
        searchQuery = buildExactQuery(normalizedQuery);
        break;
      
      case SEARCH_ALGORITHMS.FULLTEXT:
        searchQuery = buildFullTextQuery(normalizedQuery);
        break;
      
      case SEARCH_ALGORITHMS.SEMANTIC:
        searchQuery = buildSemanticQuery(normalizedQuery);
        break;
      
      case SEARCH_ALGORITHMS.HYBRID:
      default:
        searchQuery = buildHybridQuery(normalizedQuery);
        break;
    }

    // Apply filters
    searchQuery = applyFilters(searchQuery, filters, includePrivate);

    // Build sort object
    let sortObject = buildSortObject(sortBy, searchType, normalizedQuery);

    const results = await Card.find(searchQuery)
      .sort(sortObject)
      .limit(limit)
      .skip(skip)
      .populate('ownerUserId', 'name email profilePicture')
      .lean();

    const total = await Card.countDocuments(searchQuery);

    logger.info(`Search completed for query: "${normalizedQuery}" with ${results.length} results using ${searchType} algorithm`);

    return {
      results,
      total,
      query: normalizedQuery,
      searchType,
      pagination: {
        limit,
        skip,
        hasMore: skip + limit < total
      }
    };
  } catch (error) {
    logger.error(`Search error: ${error.message}`);
    throw new Error('Search failed');
  }
};

/**
 * Build fuzzy search query with partial matching
 * @param {string} query - Normalized search query
 * @returns {object} MongoDB query object
 */
function buildFuzzyQuery(query) {
  const searchTerms = query.split(' ').filter(term => term.length > 0);
  
  return {
    $or: [
      { fullName: { $regex: query, $options: 'i' } },
      { jobTitle: { $regex: query, $options: 'i' } },
      { company: { $regex: query, $options: 'i' } },
      { email: { $regex: query, $options: 'i' } },
      { title: { $regex: query, $options: 'i' } },
      { bio: { $regex: query, $options: 'i' } },
      { tags: { $in: searchTerms.map(term => new RegExp(term, 'i')) } }
    ]
  };
}

/**
 * Build exact match search query
 * @param {string} query - Normalized search query
 * @returns {object} MongoDB query object
 */
function buildExactQuery(query) {
  return {
    $or: [
      { fullName: { $regex: `^${query}$`, $options: 'i' } },
      { jobTitle: { $regex: `^${query}$`, $options: 'i' } },
      { company: { $regex: `^${query}$`, $options: 'i' } },
      { email: { $regex: `^${query}$`, $options: 'i' } },
      { title: { $regex: `^${query}$`, $options: 'i' } }
    ]
  };
}

/**
 * Build full-text search query using MongoDB text index
 * @param {string} query - Normalized search query
 * @returns {object} MongoDB query object
 */
function buildFullTextQuery(query) {
  return {
    $text: { $search: query }
  };
}

/**
 * Build semantic search query with word boundaries
 * @param {string} query - Normalized search query
 * @returns {object} MongoDB query object
 */
function buildSemanticQuery(query) {
  const searchTerms = query.split(' ').filter(term => term.length > 2);
  
  return {
    $or: [
      { fullName: { $regex: `\\b${searchTerms.join('|')}\\b`, $options: 'i' } },
      { jobTitle: { $regex: `\\b${searchTerms.join('|')}\\b`, $options: 'i' } },
      { company: { $regex: `\\b${searchTerms.join('|')}\\b`, $options: 'i' } },
      { bio: { $regex: `\\b${searchTerms.join('|')}\\b`, $options: 'i' } }
    ]
  };
}

/**
 * Build hybrid search query combining multiple algorithms
 * @param {string} query - Normalized search query
 * @returns {object} MongoDB query object
 */
function buildHybridQuery(query) {
  const searchTerms = query.split(' ').filter(term => term.length > 0);
  
  return {
    $or: [
      // Exact matches (highest priority)
      { fullName: { $regex: `^${query}$`, $options: 'i' } },
      { jobTitle: { $regex: `^${query}$`, $options: 'i' } },
      { company: { $regex: `^${query}$`, $options: 'i' } },
      { email: { $regex: `^${query}$`, $options: 'i' } },
      
      // Starts with matches
      { fullName: { $regex: `^${query}`, $options: 'i' } },
      { jobTitle: { $regex: `^${query}`, $options: 'i' } },
      { company: { $regex: `^${query}`, $options: 'i' } },
      
      // Contains matches
      { fullName: { $regex: query, $options: 'i' } },
      { jobTitle: { $regex: query, $options: 'i' } },
      { company: { $regex: query, $options: 'i' } },
      { email: { $regex: query, $options: 'i' } },
      { title: { $regex: query, $options: 'i' } },
      { bio: { $regex: query, $options: 'i' } },
      
      // Tag matches
      { tags: { $in: searchTerms.map(term => new RegExp(term, 'i')) } }
    ]
  };
}

/**
 * Apply filters to search query
 * @param {object} searchQuery - Base search query
 * @param {object} filters - Filter options
 * @param {boolean} includePrivate - Whether to include private cards
 * @returns {object} Filtered search query
 */
function applyFilters(searchQuery, filters, includePrivate) {
  let filteredQuery = { ...searchQuery };

  // Public/private filter
  if (!includePrivate) {
    filteredQuery.isPublic = true;
  }

  // Category filter
  if (filters.category && filters.category !== 'all') {
    filteredQuery.templateId = filters.category;
  }

  // User filter
  if (filters.userId) {
    filteredQuery.ownerUserId = filters.userId;
  }

  // Date range filter
  if (filters.dateRange) {
    filteredQuery.createdAt = {
      $gte: new Date(filters.dateRange.start),
      $lte: new Date(filters.dateRange.end)
    };
  }

  // Tag filter
  if (filters.tags && filters.tags.length > 0) {
    filteredQuery.tags = { $in: filters.tags };
  }

  return filteredQuery;
}

/**
 * Build sort object based on sort criteria
 * @param {string} sortBy - Sort criteria
 * @param {string} searchType - Search algorithm type
 * @param {string} query - Search query
 * @returns {object} MongoDB sort object
 */
function buildSortObject(sortBy, searchType, query) {
  switch (sortBy) {
    case 'relevance':
      if (searchType === 'fulltext' && query) {
        return { score: { $meta: 'textScore' } };
      }
      return { createdAt: -1 };
    
    case 'newest':
      return { createdAt: -1 };
    
    case 'oldest':
      return { createdAt: 1 };
    
    case 'popular':
      return { views: -1, loveCount: -1 };
    
    case 'name':
      return { fullName: 1 };
    
    case 'company':
      return { company: 1 };
    
    default:
      return { createdAt: -1 };
  }
}

/**
 * Get search suggestions based on user input
 * @param {string} query - Search query
 * @param {number} limit - Maximum suggestions to return
 * @returns {Array} Array of suggestion strings
 */
exports.getSuggestions = async (query, limit = 5) => {
  try {
    const normalizedQuery = query.trim().toLowerCase();
    
    if (!normalizedQuery) {
      return [];
    }

    const suggestions = await Card.aggregate([
      {
        $match: {
          $or: [
            { fullName: { $regex: normalizedQuery, $options: 'i' } },
            { jobTitle: { $regex: normalizedQuery, $options: 'i' } },
            { company: { $regex: normalizedQuery, $options: 'i' } },
            { title: { $regex: normalizedQuery, $options: 'i' } },
            { tags: { $regex: normalizedQuery, $options: 'i' } }
          ],
          isPublic: true
        }
      },
      {
        $group: {
          _id: '$fullName',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: limit
      }
    ]);

    return suggestions.map(s => s._id).filter(Boolean);
  } catch (error) {
    logger.error(`Search suggestions error: ${error.message}`);
    return [];
  }
};

/**
 * Advanced search with comprehensive filters
 * @param {object} params - Search parameters
 * @returns {object} Search results with metadata
 */
exports.advancedSearch = async (params) => {
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
      skip = 0,
      searchType = 'hybrid'
    } = params;

    // Use the main search function with advanced options
    return await exports.search(query, {
      limit,
      skip,
      sortBy,
      searchType,
      filters: {
        category,
        tags,
        isPublic,
        userId,
        dateRange
      }
    });
  } catch (error) {
    logger.error(`Advanced search error: ${error.message}`);
    throw new Error('Advanced search failed');
  }
};

/**
 * Get search analytics and statistics
 * @returns {object} Search analytics data
 */
exports.getSearchAnalytics = async () => {
  try {
    const analytics = await Card.aggregate([
      {
        $group: {
          _id: null,
          totalCards: { $sum: 1 },
          publicCards: {
            $sum: { $cond: [{ $eq: ['$isPublic', true] }, 1, 0] }
          },
          privateCards: {
            $sum: { $cond: [{ $eq: ['$isPublic', false] }, 1, 0] }
          },
          avgViews: { $avg: '$views' },
          totalViews: { $sum: '$views' },
          avgLoveCount: { $avg: '$loveCount' },
          totalLoveCount: { $sum: '$loveCount' }
        }
      }
    ]);

    return analytics[0] || {
      totalCards: 0,
      publicCards: 0,
      privateCards: 0,
      avgViews: 0,
      totalViews: 0,
      avgLoveCount: 0,
      totalLoveCount: 0
    };
  } catch (error) {
    logger.error(`Search analytics error: ${error.message}`);
    throw new Error('Failed to get search analytics');
  }
};

/**
 * Get search performance metrics
 * @returns {object} Performance metrics
 */
exports.getSearchPerformance = async () => {
  try {
    const performance = await Card.aggregate([
      {
        $group: {
          _id: null,
          avgSearchTime: { $avg: '$searchTime' },
          totalSearches: { $sum: '$searchCount' },
          popularSearches: { $push: '$searchTerms' }
        }
      }
    ]);

    return performance[0] || {
      avgSearchTime: 0,
      totalSearches: 0,
      popularSearches: []
    };
  } catch (error) {
    logger.error(`Search performance error: ${error.message}`);
    return {
      avgSearchTime: 0,
      totalSearches: 0,
      popularSearches: []
    };
  }
};