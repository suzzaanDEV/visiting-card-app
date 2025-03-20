const Card = require('../models/cardModel');
const CardDesign = require('../models/cardDesignModel');
const logger = require('../utils/logger');
const advancedSearchAlgorithms = require('../algorithms/advancedSearchAlgorithms');

class SearchService {
  async searchCards({ query, category, sortBy, page = 1, limit = 20, algorithm = 'hybrid' }) {
    try {
      const skip = (page - 1) * limit;
      let filter = { isPublic: true };

      // Add category filter
      if (category && category !== 'all') {
        filter.category = category;
      }

      let result;

      // Use advanced algorithms for search
      if (query && query.trim()) {
        try {
          const searchOptions = {
            limit,
            skip,
            filters: filter,
            algorithm
          };

          // Choose algorithm based on parameter
          switch (algorithm) {
            case 'tfidf':
              result = await advancedSearchAlgorithms.tfidfSearch(query, searchOptions);
              break;
            case 'bm25':
              result = await advancedSearchAlgorithms.bm25Search(query, searchOptions);
              break;
            case 'fuzzy':
              result = await advancedSearchAlgorithms.fuzzySearch(query, searchOptions);
              break;
            case 'hybrid':
            default:
              result = await advancedSearchAlgorithms.hybridSearch(query, searchOptions);
              break;
          }

          // Apply additional sorting if needed
          if (sortBy && sortBy !== 'relevance') {
            result.results = await advancedSearchAlgorithms.advancedSorting(result.results, sortBy, 'desc');
          }

          return {
            cards: result.results,
            currentPage: page,
            totalPages: Math.ceil(result.total / limit),
            hasMore: result.pagination.hasMore,
            total: result.total,
            algorithm: result.algorithm
          };
        } catch (error) {
          logger.error(`Advanced search failed, falling back to basic search: ${error.message}`);
          // Fallback to basic search
          return await this.basicSearch(query, filter, sortBy, page, limit);
        }
      } else {
        // No query - use traditional sorting
        let sort = {};
        switch (sortBy) {
          case 'recent':
            sort = { createdAt: -1 };
            break;
          case 'popular':
            sort = { views: -1, loveCount: -1 };
            break;
          case 'views':
            sort = { views: -1 };
            break;
          case 'loves':
            sort = { loveCount: -1 };
            break;
          case 'trending':
            // Trending: recent cards with high engagement
            const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            filter.createdAt = { $gte: oneWeekAgo };
            sort = { views: -1, loveCount: -1, createdAt: -1 };
            break;
          case 'quality':
            // Quality: completeness + engagement
            sort = { loveCount: -1, views: -1, createdAt: -1 };
            break;
          default:
            sort = { createdAt: -1 };
        }

        const cards = await Card.find(filter)
          .populate('ownerUserId', 'username email name')
          .sort(sort)
          .skip(skip)
          .limit(limit);

        const total = await Card.countDocuments(filter);
        const hasMore = skip + cards.length < total;

        return {
          cards,
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          hasMore,
          total,
          algorithm: 'traditional'
        };
      }
    } catch (error) {
      logger.error(`Error searching cards: ${error.message}`);
      throw error;
    }
  }

  async getPopularCards(limit = 6, sortBy = 'popular', sortOrder = 'desc', page = 1, searchQuery = '', category = 'all') {
    try {
      const skip = (page - 1) * limit;
      let filter = { isPublic: true };

      // Add search query filter
      if (searchQuery && searchQuery.trim()) {
        filter.$or = [
          { title: { $regex: searchQuery, $options: 'i' } },
          { fullName: { $regex: searchQuery, $options: 'i' } },
          { jobTitle: { $regex: searchQuery, $options: 'i' } },
          { company: { $regex: searchQuery, $options: 'i' } },
          { email: { $regex: searchQuery, $options: 'i' } },
          { bio: { $regex: searchQuery, $options: 'i' } }
        ];
      }

      // Add category filter
      if (category && category !== 'all') {
        filter.category = category;
      }

      // Use advanced algorithms for search if query exists
      if (searchQuery && searchQuery.trim()) {
        const searchOptions = {
          limit,
          skip,
          filters: filter,
          algorithm: 'hybrid'
        };

        const result = await advancedSearchAlgorithms.hybridSearch(searchQuery, searchOptions);
        
        // Apply additional sorting
        result.results = await advancedSearchAlgorithms.advancedSorting(result.results, sortBy, sortOrder);

        return {
          cards: result.results,
          currentPage: page,
          totalPages: Math.ceil(result.total / limit),
          hasMore: result.pagination.hasMore,
          total: result.total,
          algorithm: 'hybrid'
        };
      }

      // Build sort object based on sortBy parameter
      let sort = {};
      switch (sortBy) {
        case 'popular':
          sort = { views: -1, loveCount: -1, createdAt: -1 };
          break;
        case 'views':
          sort = { views: -1, createdAt: -1 };
          break;
        case 'loves':
          sort = { loveCount: -1, views: -1, createdAt: -1 };
          break;
        case 'recent':
          sort = { createdAt: -1, views: -1 };
          break;
        case 'trending':
          // Trending algorithm: recent popularity weighted by time
          const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          filter.createdAt = { $gte: oneWeekAgo };
          sort = { views: -1, loveCount: -1, createdAt: -1 };
          break;
        case 'quality':
          // Quality score: completeness + engagement
          sort = { loveCount: -1, views: -1, createdAt: -1 };
          break;
        default:
          sort = { views: -1, createdAt: -1 };
      }

      // Apply sort order
      if (sortOrder === 'asc') {
        Object.keys(sort).forEach(key => {
          sort[key] = sort[key] === -1 ? 1 : -1;
        });
      }

      const cards = await Card.find(filter)
        .populate('ownerUserId', 'username email name')
        .sort(sort)
        .skip(skip)
        .limit(limit);

      const total = await Card.countDocuments(filter);
      const hasMore = skip + cards.length < total;

      return {
        cards,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        hasMore,
        total,
        algorithm: 'traditional'
      };
    } catch (error) {
      logger.error(`Error getting popular cards: ${error.message}`);
      throw error;
    }
  }

  async getRecentCards(limit = 6, sortBy = 'recent', sortOrder = 'desc', page = 1, searchQuery = '', category = 'all', timeFilter = 'all') {
    try {
      const skip = (page - 1) * limit;
      let filter = { isPublic: true };

      // Add search query filter
      if (searchQuery && searchQuery.trim()) {
        filter.$or = [
          { title: { $regex: searchQuery, $options: 'i' } },
          { fullName: { $regex: searchQuery, $options: 'i' } },
          { jobTitle: { $regex: searchQuery, $options: 'i' } },
          { company: { $regex: searchQuery, $options: 'i' } },
          { email: { $regex: searchQuery, $options: 'i' } },
          { bio: { $regex: searchQuery, $options: 'i' } }
        ];
      }

      // Add category filter
      if (category && category !== 'all') {
        filter.category = category;
      }

      // Add time filter
      if (timeFilter && timeFilter !== 'all') {
        const now = new Date();
        let startDate;
        
        switch (timeFilter) {
          case 'today':
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            break;
          case 'week':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case 'month':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            break;
          case 'year':
            startDate = new Date(now.getFullYear(), 0, 1);
            break;
          default:
            startDate = null;
        }
        
        if (startDate) {
          filter.createdAt = { $gte: startDate };
        }
      }

      // Use advanced algorithms for search if query exists
      if (searchQuery && searchQuery.trim()) {
        const searchOptions = {
          limit,
          skip,
          filters: filter,
          algorithm: 'hybrid'
        };

        const result = await advancedSearchAlgorithms.hybridSearch(searchQuery, searchOptions);
        
        // Apply additional sorting
        result.results = await advancedSearchAlgorithms.advancedSorting(result.results, sortBy, sortOrder);

        return {
          cards: result.results,
          currentPage: page,
          totalPages: Math.ceil(result.total / limit),
          hasMore: result.pagination.hasMore,
          total: result.total,
          algorithm: 'hybrid'
        };
      }

      // Build sort object based on sortBy parameter
      let sort = {};
      switch (sortBy) {
        case 'recent':
          sort = { createdAt: -1 };
          break;
        case 'created':
          sort = { createdAt: -1 };
          break;
        case 'updated':
          sort = { updatedAt: -1, createdAt: -1 };
          break;
        case 'trending':
          // Recent trending: recent cards with high engagement
          const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          filter.createdAt = { $gte: oneWeekAgo };
          sort = { views: -1, loveCount: -1, createdAt: -1 };
          break;
        case 'popular':
          // Recent popular: recent cards that are also popular
          sort = { views: -1, loveCount: -1, createdAt: -1 };
          break;
        case 'quality':
          // Quality score for recent cards
          sort = { loveCount: -1, views: -1, createdAt: -1 };
          break;
        default:
          sort = { createdAt: -1 };
      }

      // Apply sort order
      if (sortOrder === 'asc') {
        Object.keys(sort).forEach(key => {
          sort[key] = sort[key] === -1 ? 1 : -1;
        });
      }

      const cards = await Card.find(filter)
        .populate('ownerUserId', 'username email name')
        .sort(sort)
        .skip(skip)
        .limit(limit);

      const total = await Card.countDocuments(filter);
      const hasMore = skip + cards.length < total;

      return {
        cards,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        hasMore,
        total,
        algorithm: 'traditional'
      };
    } catch (error) {
      logger.error(`Error getting recent cards: ${error.message}`);
      throw error;
    }
  }

  async getSuggestions(query, limit = 5) {
    try {
      const suggestions = await Card.aggregate([
        {
          $match: {
            isPublic: true,
            $or: [
              { title: { $regex: query, $options: 'i' } },
              { fullName: { $regex: query, $options: 'i' } },
              { jobTitle: { $regex: query, $options: 'i' } },
              { company: { $regex: query, $options: 'i' } }
            ]
          }
        },
        {
          $group: {
            _id: '$title',
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

      return suggestions.map(s => s._id);
    } catch (error) {
      logger.error(`Error getting suggestions: ${error.message}`);
      return [];
    }
  }

  async basicSearch(query, filter, sortBy, page, limit) {
    try {
      const skip = (page - 1) * limit;
      
      // Basic regex search
      const searchFilter = {
        ...filter,
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { fullName: { $regex: query, $options: 'i' } },
          { jobTitle: { $regex: query, $options: 'i' } },
          { company: { $regex: query, $options: 'i' } },
          { email: { $regex: query, $options: 'i' } },
          { bio: { $regex: query, $options: 'i' } }
        ]
      };

      let sort = {};
      switch (sortBy) {
        case 'recent':
          sort = { createdAt: -1 };
          break;
        case 'popular':
          sort = { views: -1, loveCount: -1 };
          break;
        case 'views':
          sort = { views: -1 };
          break;
        case 'loves':
          sort = { loveCount: -1 };
          break;
        case 'trending':
          const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          searchFilter.createdAt = { $gte: oneWeekAgo };
          sort = { views: -1, loveCount: -1, createdAt: -1 };
          break;
        case 'quality':
          sort = { loveCount: -1, views: -1, createdAt: -1 };
          break;
        default:
          sort = { createdAt: -1 };
      }

      const cards = await Card.find(searchFilter)
        .populate('ownerUserId', 'username email name')
        .sort(sort)
        .skip(skip)
        .limit(limit);

      const total = await Card.countDocuments(searchFilter);
      const hasMore = skip + cards.length < total;

      return {
        cards,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        hasMore,
        total,
        algorithm: 'basic'
      };
    } catch (error) {
      logger.error(`Basic search error: ${error.message}`);
      throw error;
    }
  }

  async getSearchAnalytics() {
    try {
      // Basic analytics implementation
      const totalCards = await Card.countDocuments({ isPublic: true });
      const totalViews = await Card.aggregate([
        { $match: { isPublic: true } },
        { $group: { _id: null, totalViews: { $sum: '$views' } } }
      ]);
      
      return {
        totalCards,
        totalViews: totalViews[0]?.totalViews || 0,
        averageViews: totalViews[0]?.totalViews / totalCards || 0
      };
    } catch (error) {
      logger.error(`Error getting search analytics: ${error.message}`);
      throw error;
    }
  }

  async getSearchPerformance() {
    try {
      // Basic performance metrics
      const recentCards = await Card.countDocuments({
        isPublic: true,
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      });
      
      return {
        recentCards,
        performance: 'optimal',
        algorithm: 'hybrid'
      };
    } catch (error) {
      logger.error(`Error getting search performance: ${error.message}`);
      throw error;
    }
  }
}

module.exports = new SearchService();