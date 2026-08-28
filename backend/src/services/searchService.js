const Card = require('../models/cardModel');
const CardDesign = require('../models/cardDesignModel');
const Template = require('../models/templateModel');
const logger = require('../utils/logger');
const advancedSearchAlgorithms = require('../algorithms/advancedSearchAlgorithms');
const { rankTrendingCards } = require('../algorithms/trendingRanking');
const { recommendCards } = require('../algorithms/recommendationEngine');
const { escapeRegex } = require('../utils/sanitize');

class SearchService {
  // Attach a lightweight template snapshot ({ id, name, design }) to each card so
  // frontend thumbnails render the real template design. Mirrors cardService.
  async attachTemplateSnapshots(cardsOrCard) {
    const list = Array.isArray(cardsOrCard) ? cardsOrCard : [cardsOrCard];
    const templateIds = [...new Set(list.map((c) => c && c.templateId).filter(Boolean))];
    const templates = templateIds.length
      ? await Template.find({ id: { $in: templateIds }, isActive: true }).select('id name design').lean()
      : [];
    const templateMap = new Map(templates.map((t) => [t.id, t]));

    for (const card of list) {
      if (!card) continue;
      const t = card.templateId ? templateMap.get(card.templateId) : null;
      if (t) {
        const snapshot = { id: t.id, name: t.name, design: t.design };
        if (typeof card.set === 'function') {
          card.set('template', snapshot, { strict: false });
        } else {
          card.template = snapshot;
        }
      }
    }
    return cardsOrCard;
  }

  async searchCards({ query, category, sortBy, page = 1, limit = 20, algorithm = 'hybrid', tags, extraFilter, industry, profession, location }) {
    try {
      const safeLimit = Math.min(Math.max(parseInt(limit) || 20, 1), 50);
      const safePage = Math.max(parseInt(page) || 1, 1);
      const skip = (safePage - 1) * safeLimit;
      let filter = { isPublic: true, isPrivate: { $ne: true }, privacy: { $ne: 'private' } };

      if (category && category !== 'all') {
        filter.category = category.toLowerCase();
      }

      if (industry && industry !== 'all') {
        filter.industry = { $regex: escapeRegex(industry), $options: 'i' };
      }

      if (profession && profession !== 'all') {
        filter.profession = { $regex: escapeRegex(profession), $options: 'i' };
      }

      if (tags) {
        const tagList = Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);
        if (tagList.length > 0) {
          filter.tags = { $in: tagList };
        }
      }

      if (location && location.trim()) {
        const safeLoc = escapeRegex(location.trim());
        const orConditions = [
          { city: { $regex: safeLoc, $options: 'i' } },
          { state: { $regex: safeLoc, $options: 'i' } },
          { country: { $regex: safeLoc, $options: 'i' } },
          { address: { $regex: safeLoc, $options: 'i' } }
        ];
        if (filter.$or && Array.isArray(filter.$or)) {
          filter.$or = filter.$or.concat(orConditions);
        } else {
          filter.$or = orConditions;
        }
      }

      if (extraFilter && Object.keys(extraFilter).length > 0) {
        Object.assign(filter, extraFilter);
      }

      let result;

      if (query && query.trim()) {
        const safeQuery = escapeRegex(query.trim());

        // Try $text search first
        let textResults = null;
        try {
          const textFilter = { ...filter };
          delete textFilter.$or; // $text can't coexist with $or regex in same query
          textResults = await Card.find(
            { ...textFilter, $text: { $search: query.trim() } },
            { score: { $meta: 'textScore' } }
          )
            .populate('ownerUserId', 'username email name')
            .sort({ score: { $meta: 'textScore' } })
            .skip(skip)
            .limit(safeLimit)
            .lean();

          const textTotal = await Card.countDocuments({ ...textFilter, $text: { $search: query.trim() } });

          if (textResults.length > 0) {
            result = {
              results: textResults,
              total: textTotal,
              algorithm: 'text-search',
              pagination: { hasMore: skip + textResults.length < textTotal }
            };
          }
        } catch (textErr) {
          // Text index may not exist yet, fall through to regex
          logger.warn(`Text search unavailable, falling back: ${textErr.message}`);
        }

        // Fallback to regex-based search
        if (!result) {
          try {
            const searchOptions = {
              limit: safeLimit,
              skip,
              filters: filter,
              algorithm
            };

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
          } catch (error) {
            logger.error(`Advanced search failed, falling back to basic search: ${error.message}`);
            return await this.basicSearch(query, filter, sortBy, safePage, safeLimit);
          }
        }

        if (sortBy && sortBy !== 'relevance' && result.results) {
          result.results = await advancedSearchAlgorithms.advancedSorting(result.results, sortBy, 'desc');
        }

        await this.attachTemplateSnapshots(result.results);

        return {
          cards: result.results,
          currentPage: safePage,
          totalPages: Math.ceil(result.total / safeLimit),
          hasMore: result.pagination.hasMore,
          total: result.total,
          algorithm: result.algorithm
        };
      } else {
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
          case 'trending': {
            const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            filter.createdAt = { $gte: oneWeekAgo };
            sort = { views: -1, loveCount: -1, createdAt: -1 };
            break;
          }
          case 'name':
            sort = { fullName: 1 };
            break;
          case 'quality':
            sort = { loveCount: -1, views: -1, createdAt: -1 };
            break;
          default:
            sort = { createdAt: -1 };
        }

        const cards = await Card.find(filter)
          .populate('ownerUserId', 'username email name')
          .sort(sort)
          .skip(skip)
          .limit(safeLimit);

        const total = await Card.countDocuments(filter);
        const hasMore = skip + cards.length < total;

        await this.attachTemplateSnapshots(cards);

        return {
          cards,
          currentPage: safePage,
          totalPages: Math.ceil(total / safeLimit),
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
      const safeLimit = Math.min(Math.max(parseInt(limit) || 6, 1), 50);
      const safePage = Math.max(parseInt(page) || 1, 1);
      const skip = (safePage - 1) * safeLimit;
      let filter = { isPublic: true, isPrivate: { $ne: true }, privacy: { $ne: 'private' } };

      if (category && category !== 'all') {
        filter.category = category;
      }

      // Use advanced algorithms for search if query exists (no redundant $or regex)
      if (searchQuery && searchQuery.trim()) {
        const searchOptions = {
          limit: safeLimit,
          skip,
          filters: filter,
          algorithm: 'hybrid'
        };

        const result = await advancedSearchAlgorithms.hybridSearch(searchQuery, searchOptions);
        result.results = await advancedSearchAlgorithms.advancedSorting(result.results, sortBy, sortOrder);

        await this.attachTemplateSnapshots(result.results);

        return {
          cards: result.results,
          currentPage: safePage,
          totalPages: Math.ceil(result.total / safeLimit),
          hasMore: result.pagination.hasMore,
          total: result.total,
          algorithm: 'hybrid'
        };
      }

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
        case 'trending': {
          const pool = await Card.find(filter)
            .populate('ownerUserId', 'username email name')
            .limit(Math.max(safeLimit * 5, 50))
            .lean();
          const ranked = rankTrendingCards(pool, {}, safeLimit);
          const cards = ranked.map((r) => ({ ...r.card, trendingScore: r.trendingScore }));
          const total = await Card.countDocuments(filter);
          await this.attachTemplateSnapshots(cards);
          return {
            cards,
            currentPage: safePage,
            totalPages: Math.ceil(total / safeLimit),
            hasMore: skip + cards.length < total,
            total,
            algorithm: 'weighted-trending',
          };
        }
        case 'name':
          sort = { fullName: 1 };
          break;
        case 'quality':
          sort = { loveCount: -1, views: -1, createdAt: -1 };
          break;
        default:
          sort = { views: -1, createdAt: -1 };
      }

      if (sortOrder === 'asc') {
        Object.keys(sort).forEach(key => {
          sort[key] = sort[key] === -1 ? 1 : -1;
        });
      }

      const cards = await Card.find(filter)
        .populate('ownerUserId', 'username email name')
        .sort(sort)
        .skip(skip)
        .limit(safeLimit);

      const total = await Card.countDocuments(filter);
      const hasMore = skip + cards.length < total;

      await this.attachTemplateSnapshots(cards);

      return {
        cards,
        currentPage: safePage,
        totalPages: Math.ceil(total / safeLimit),
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
      const safeLimit = Math.min(Math.max(parseInt(limit) || 6, 1), 50);
      const safePage = Math.max(parseInt(page) || 1, 1);
      const skip = (safePage - 1) * safeLimit;
      let filter = { isPublic: true, isPrivate: { $ne: true }, privacy: { $ne: 'private' } };

      if (category && category !== 'all') {
        filter.category = category;
      }

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

      // Use advanced algorithms for search if query exists (no redundant $or regex)
      if (searchQuery && searchQuery.trim()) {
        const searchOptions = {
          limit: safeLimit,
          skip,
          filters: filter,
          algorithm: 'hybrid'
        };

        const result = await advancedSearchAlgorithms.hybridSearch(searchQuery, searchOptions);
        result.results = await advancedSearchAlgorithms.advancedSorting(result.results, sortBy, sortOrder);

        await this.attachTemplateSnapshots(result.results);

        return {
          cards: result.results,
          currentPage: safePage,
          totalPages: Math.ceil(result.total / safeLimit),
          hasMore: result.pagination.hasMore,
          total: result.total,
          algorithm: 'hybrid'
        };
      }

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
        case 'trending': {
          const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          filter.createdAt = { $gte: oneWeekAgo };
          sort = { views: -1, loveCount: -1, createdAt: -1 };
          break;
        }
        case 'popular':
          sort = { views: -1, loveCount: -1, createdAt: -1 };
          break;
        case 'name':
          sort = { fullName: 1 };
          break;
        case 'quality':
          sort = { loveCount: -1, views: -1, createdAt: -1 };
          break;
        default:
          sort = { createdAt: -1 };
      }

      if (sortOrder === 'asc') {
        Object.keys(sort).forEach(key => {
          sort[key] = sort[key] === -1 ? 1 : -1;
        });
      }

      const cards = await Card.find(filter)
        .populate('ownerUserId', 'username email name')
        .sort(sort)
        .skip(skip)
        .limit(safeLimit);

      const total = await Card.countDocuments(filter);
      const hasMore = skip + cards.length < total;

      await this.attachTemplateSnapshots(cards);

      return {
        cards,
        currentPage: safePage,
        totalPages: Math.ceil(total / safeLimit),
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
      const safeQuery = escapeRegex(query);
      const results = await Card.aggregate([
        {
          $match: {
            isPublic: true,
            isPrivate: { $ne: true },
            privacy: { $ne: 'private' },
            $or: [
              { fullName: { $regex: safeQuery, $options: 'i' } },
              { jobTitle: { $regex: safeQuery, $options: 'i' } },
              { company: { $regex: safeQuery, $options: 'i' } },
              { category: { $regex: safeQuery, $options: 'i' } }
            ]
          }
        },
        {
          $project: {
            fullName: 1,
            jobTitle: 1,
            company: 1,
            category: 1
          }
        },
        { $limit: limit * 3 }
      ]);

      const suggestions = [];
      const seen = new Set();

      for (const doc of results) {
        if (suggestions.length >= limit) break;

        if (doc.fullName && new RegExp(safeQuery, 'i').test(doc.fullName) && !seen.has(`name:${doc.fullName}`)) {
          suggestions.push({ text: doc.fullName, type: 'name' });
          seen.add(`name:${doc.fullName}`);
        }
        if (suggestions.length >= limit) break;

        if (doc.jobTitle && new RegExp(safeQuery, 'i').test(doc.jobTitle) && !seen.has(`job:${doc.jobTitle}`)) {
          suggestions.push({ text: doc.jobTitle, type: 'job' });
          seen.add(`job:${doc.jobTitle}`);
        }
        if (suggestions.length >= limit) break;

        if (doc.company && new RegExp(safeQuery, 'i').test(doc.company) && !seen.has(`company:${doc.company}`)) {
          suggestions.push({ text: doc.company, type: 'company' });
          seen.add(`company:${doc.company}`);
        }
        if (suggestions.length >= limit) break;

        if (doc.category && new RegExp(safeQuery, 'i').test(doc.category) && !seen.has(`category:${doc.category}`)) {
          suggestions.push({ text: doc.category, type: 'category' });
          seen.add(`category:${doc.category}`);
        }
      }

      return suggestions;
    } catch (error) {
      logger.error(`Error getting suggestions: ${error.message}`);
      return [];
    }
  }

  async basicSearch(query, filter, sortBy, page, limit) {
    try {
      const skip = (page - 1) * limit;

      const safeQuery = escapeRegex(query);
      const searchFilter = {
        ...filter,
        $or: [
          { title: { $regex: safeQuery, $options: 'i' } },
          { fullName: { $regex: safeQuery, $options: 'i' } },
          { jobTitle: { $regex: safeQuery, $options: 'i' } },
          { company: { $regex: safeQuery, $options: 'i' } },
          { email: { $regex: safeQuery, $options: 'i' } },
          { bio: { $regex: safeQuery, $options: 'i' } },
          { industry: { $regex: safeQuery, $options: 'i' } },
          { profession: { $regex: safeQuery, $options: 'i' } },
          { skills: { $regex: safeQuery, $options: 'i' } },
          { services: { $regex: safeQuery, $options: 'i' } },
          { category: { $regex: safeQuery, $options: 'i' } }
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
        case 'trending': {
          const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          searchFilter.createdAt = { $gte: oneWeekAgo };
          sort = { views: -1, loveCount: -1, createdAt: -1 };
          break;
        }
        case 'name':
          sort = { fullName: 1 };
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

      await this.attachTemplateSnapshots(cards);

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
      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const [totalCards, cardsLastDay, cardsLastWeek, cardsLastMonth, totalViewsAgg] = await Promise.all([
        Card.countDocuments({ isPublic: true }),
        Card.countDocuments({ isPublic: true, createdAt: { $gte: oneDayAgo } }),
        Card.countDocuments({ isPublic: true, createdAt: { $gte: oneWeekAgo } }),
        Card.countDocuments({ isPublic: true, createdAt: { $gte: oneMonthAgo } }),
        Card.aggregate([
          { $match: { isPublic: true } },
          { $group: { _id: null, totalViews: { $sum: '$views' }, avgViews: { $avg: '$views' } } }
        ])
      ]);

      return {
        totalCards,
        cardsLastDay,
        cardsLastWeek,
        cardsLastMonth,
        totalViews: totalViewsAgg[0]?.totalViews || 0,
        averageViews: totalViewsAgg[0]?.avgViews || 0,
        performance: 'optimal',
        algorithm: 'hybrid'
      };
    } catch (error) {
      logger.error(`Error getting search performance: ${error.message}`);
      throw error;
    }
  }

  async getRecommendations(cardId, limit = 6) {
    try {
      const sourceCard = await Card.findById(cardId).lean();
      if (!sourceCard) {
        throw new Error('Source card not found');
      }

      const candidates = await Card.find({
        isPublic: true,
        isPrivate: { $ne: true },
        privacy: { $ne: 'private' },
        isActive: true,
        _id: { $ne: sourceCard._id },
      })
        .populate('ownerUserId', 'username email name')
        .limit(100)
        .lean();

      const recommendations = recommendCards(sourceCard, candidates, limit);
      await this.attachTemplateSnapshots(recommendations.map((r) => r.card));
      return {
        recommendations: recommendations.map((r) => ({
          ...r.card,
          similarityScore: Number(r.score.toFixed(4)),
        })),
        algorithm: 'content-based-cosine',
        total: recommendations.length,
      };
    } catch (error) {
      logger.error(`Recommendation error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Personalized discovery feed.
   * Authenticated users get cards ranked by the content-based recommendation
   * engine using the profile of their most data-rich public card as the source;
   * anonymous (or profile-less) users get the weighted-trending feed. Filters
   * (category / industry / location / search) apply to the candidate pool.
   */
  async getDiscoverCards({ userId = null, limit = 12, page = 1, search = '', category = '', industry = '', location = '', sortBy = '' } = {}) {
    try {
      const safeLimit = Math.min(Math.max(parseInt(limit) || 12, 1), 50);
      const safePage = Math.max(parseInt(page) || 1, 1);
      const skip = (safePage - 1) * safeLimit;
      const norm = (s) => (s || '').toString().toLowerCase().trim();

      const filter = { isPublic: true, isPrivate: { $ne: true }, privacy: { $ne: 'private' }, isActive: true };
      if (category && category !== 'all') filter.category = norm(category);
      if (industry && industry !== 'all') filter.industry = { $regex: escapeRegex(norm(industry)), $options: 'i' };

      const orClauses = [];
      if (search) {
        const re = { $regex: escapeRegex(norm(search)), $options: 'i' };
        orClauses.push({ fullName: re }, { title: re }, { jobTitle: re }, { company: re }, { bio: re }, { profession: re });
      }
      if (location) {
        const re = { $regex: escapeRegex(norm(location)), $options: 'i' };
        orClauses.push({ city: re }, { country: re });
      }
      if (orClauses.length) filter.$or = orClauses;

      const [total, deck] = await Promise.all([
        Card.countDocuments(filter),
        Card.find(filter)
          .populate('ownerUserId', 'username name avatar')
          .sort({ createdAt: -1 })
          .limit(300)
          .lean(),
      ]);

      const totalPages = Math.max(Math.ceil(total / safeLimit), 1);
      let personalized = false;
      let source = 'trending';
      let ranked = null;

      if (userId) {
        const myCards = await Card.find({
          ownerUserId: userId,
          isPublic: true,
          isPrivate: { $ne: true },
          privacy: { $ne: 'private' },
          isActive: true,
        })
          .sort({ views: -1 })
          .limit(25)
          .lean();
        let src = null;
        if (myCards.length) {
          src = myCards.reduce((best, c) => (this._profileDensity(c) > this._profileDensity(best) ? c : best), null);
        }
        if (src) {
          const recs = recommendCards(src, deck, safeLimit * 2);
          if (recs.length) {
            ranked = recs.map((r) => ({ ...r.card, similarityScore: Number(r.score.toFixed(4)), algorithm: r.algorithm }));
            personalized = true;
            source = 'profile';
          }
        }
      }

      if (!ranked) {
        const trending = rankTrendingCards(deck, { limit: safeLimit * 2 });
        ranked = trending.map((t) => ({ ...t.card, trendingScore: Number(t.trendingScore.toFixed(6)) }));
        source = 'trending';
      }

      // Explicit sort (newest / views / loveCount) overrides the ranking feed.
      const sortKey = { newest: 'createdAt', views: 'views', loveCount: 'loveCount' }[sortBy];
      if (sortKey) {
        ranked = [...ranked].sort((a, b) => (b[sortKey] || 0) - (a[sortKey] || 0));
      }

      // De-duplicate (a user's own cards can exist in the pool) and slice the page
      const seen = new Set();
      const paged = [];
      for (const item of ranked) {
        const id = String(item._id);
        if (seen.has(id)) continue;
        seen.add(id);
        paged.push(item);
        if (paged.length >= skip + safeLimit) break;
      }
      const cards = paged.slice(skip);

      await this.attachTemplateSnapshots(cards);
      return {
        cards,
        personalized,
        source,
        algorithm: personalized ? 'content-based-cosine' : 'weighted-trending',
        pagination: { page: safePage, limit: safeLimit, total, totalPages },
      };
    } catch (error) {
      logger.error(`Get discover cards error: ${error.message}`);
      throw error;
    }
  }

  // Heuristic: how "rich" a card profile is, used to pick the best source card.
  _profileDensity(card) {
    if (!card) return -1;
    const textFields = [card.jobTitle, card.company, card.category, card.city, card.country, card.industry, card.profession, card.bio];
    return textFields.filter(Boolean).length + (Array.isArray(card.skills) ? card.skills.length : 0) + (Array.isArray(card.tags) ? card.tags.length : 0);
  }
}

module.exports = new SearchService();
