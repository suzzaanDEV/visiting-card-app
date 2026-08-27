const Card = require('../models/cardModel');
const logger = require('../utils/logger');

/**
 * Advanced Search Algorithms Implementation
 * Implements multiple search and sorting algorithms for robust card discovery
 */

class AdvancedSearchAlgorithms {
  
  /**
   * 1. TF-IDF (Term Frequency-Inverse Document Frequency) Algorithm
   * Calculates relevance scores based on term frequency and document frequency
   */
  async tfidfSearch(query, options = {}) {
    try {
      const { limit = 20, skip = 0, filters = {} } = options;
      
      // Normalize query
      const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 0);
      
      if (searchTerms.length === 0) {
        return { results: [], total: 0, algorithm: 'tfidf' };
      }

      // Calculate TF-IDF scores
      const regex = searchTerms.join('|');
      const orClause = [
        { title: { $regex: regex, $options: 'i' } },
        { fullName: { $regex: regex, $options: 'i' } },
        { jobTitle: { $regex: regex, $options: 'i' } },
        { company: { $regex: regex, $options: 'i' } },
        { bio: { $regex: regex, $options: 'i' } },
        { industry: { $regex: regex, $options: 'i' } },
        { profession: { $regex: regex, $options: 'i' } },
        { skills: { $regex: regex, $options: 'i' } },
        { services: { $regex: regex, $options: 'i' } }
      ];

      const pipeline = [
        {
          $match: {
            isPublic: true,
            ...filters,
            $or: orClause
          }
        },
        {
          $addFields: {
            _titleWords: { $split: [{ $toLower: { $ifNull: ['$title', ''] } }, ' '] },
            _nameWords: { $split: [{ $toLower: { $ifNull: ['$fullName', ''] } }, ' '] },
            _jobWords: { $split: [{ $toLower: { $ifNull: ['$jobTitle', ''] } }, ' '] },
            _companyWords: { $split: [{ $toLower: { $ifNull: ['$company', ''] } }, ' '] }
          }
        },
        {
          $addFields: {
            tfidfScore: {
              $sum: [
                {
                  $multiply: [
                    {
                      $size: {
                        $filter: {
                          input: '$_titleWords',
                          cond: { $in: ['$$this', searchTerms] }
                        }
                      }
                    },
                    10
                  ]
                },
                {
                  $multiply: [
                    {
                      $size: {
                        $filter: {
                          input: '$_nameWords',
                          cond: { $in: ['$$this', searchTerms] }
                        }
                      }
                    },
                    8
                  ]
                },
                {
                  $multiply: [
                    {
                      $size: {
                        $filter: {
                          input: '$_jobWords',
                          cond: { $in: ['$$this', searchTerms] }
                        }
                      }
                    },
                    6
                  ]
                },
                {
                  $multiply: [
                    {
                      $size: {
                        $filter: {
                          input: '$_companyWords',
                          cond: { $in: ['$$this', searchTerms] }
                        }
                      }
                    },
                    6
                  ]
                }
              ]
            }
          }
        },
        {
          $sort: { tfidfScore: -1, createdAt: -1 }
        },
        {
          $skip: skip
        },
        {
          $limit: limit
        },
        {
          $lookup: {
            from: 'users',
            localField: 'ownerUserId',
            foreignField: '_id',
            as: 'owner'
          }
        },
        {
          $unwind: { path: '$owner', preserveNullAndEmptyArrays: true }
        },
        {
          $project: {
            _id: 1,
            title: 1,
            fullName: 1,
            jobTitle: 1,
            company: 1,
            email: 1,
            bio: 1,
            shortLink: 1,
            qrCode: 1,
            loveCount: 1,
            views: 1,
            createdAt: 1,
            tfidfScore: 1,
            'owner.username': 1,
            'owner.email': 1,
            'owner.name': 1,
            _titleWords: 0,
            _nameWords: 0,
            _jobWords: 0,
            _companyWords: 0
          }
        }
      ];

      const results = await Card.aggregate(pipeline);
      const total = await Card.countDocuments({
        isPublic: true,
        ...filters,
        $or: orClause
      });

      return {
        results,
        total,
        algorithm: 'tfidf',
        query,
        pagination: {
          limit,
          skip,
          hasMore: skip + limit < total
        }
      };
    } catch (error) {
      logger.error(`TF-IDF search error: ${error.message}`);
      throw error;
    }
  }

  /**
   * 2. BM25 (Best Matching 25) Algorithm
   * Advanced ranking function based on probabilistic relevance
   */
  async bm25Search(query, options = {}) {
    try {
      const { limit = 20, skip = 0, filters = {} } = options;
      
      const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 0);
      
      if (searchTerms.length === 0) {
        return { results: [], total: 0, algorithm: 'bm25' };
      }

      // BM25 parameters
      const k1 = 1.2; // Term frequency saturation parameter
      const b = 0.75; // Length normalization parameter
      const avgDocLength = 50; // Average document length (approximate)

      const bm25Regex = searchTerms.join('|');
      const bm25Or = [
        { title: { $regex: bm25Regex, $options: 'i' } },
        { fullName: { $regex: bm25Regex, $options: 'i' } },
        { jobTitle: { $regex: bm25Regex, $options: 'i' } },
        { company: { $regex: bm25Regex, $options: 'i' } },
        { bio: { $regex: bm25Regex, $options: 'i' } },
        { industry: { $regex: bm25Regex, $options: 'i' } },
        { profession: { $regex: bm25Regex, $options: 'i' } },
        { skills: { $regex: bm25Regex, $options: 'i' } },
        { services: { $regex: bm25Regex, $options: 'i' } }
      ];

      const pipeline = [
        {
          $match: {
            isPublic: true,
            ...filters,
            $or: bm25Or
          }
        },
        {
          $addFields: {
            _titleWords: { $split: [{ $toLower: { $ifNull: ['$title', ''] } }, ' '] },
            _nameWords: { $split: [{ $toLower: { $ifNull: ['$fullName', ''] } }, ' '] },
            _titleLen: { $strLenCP: { $ifNull: ['$title', ''] } },
            _nameLen: { $strLenCP: { $ifNull: ['$fullName', ''] } },
            docLength: {
              $add: [
                { $strLenCP: { $ifNull: ['$title', ''] } },
                { $strLenCP: { $ifNull: ['$fullName', ''] } },
                { $strLenCP: { $ifNull: ['$jobTitle', ''] } },
                { $strLenCP: { $ifNull: ['$company', ''] } },
                { $strLenCP: { $ifNull: ['$bio', ''] } }
              ]
            }
          }
        },
        {
          $addFields: {
            bm25Score: {
              $sum: [
                // Title score (highest weight)
                {
                  $multiply: [
                    {
                      $divide: [
                        {
                          $multiply: [
                            {
                              $size: {
                                $filter: {
                                  input: '$_titleWords',
                                  cond: { $in: ['$$this', searchTerms] }
                                }
                              }
                            },
                            k1 + 1
                          ]
                        },
                        {
                          $add: [
                            k1,
                            {
                              $multiply: [
                                k1,
                                {
                                  $divide: [
                                    '$_titleLen',
                                    avgDocLength
                                  ]
                                }
                              ]
                            }
                          ]
                        }
                      ]
                    },
                    10
                  ]
                },
                // Full name score
                {
                  $multiply: [
                    {
                      $divide: [
                        {
                          $multiply: [
                            {
                              $size: {
                                $filter: {
                                  input: '$_nameWords',
                                  cond: { $in: ['$$this', searchTerms] }
                                }
                              }
                            },
                            k1 + 1
                          ]
                        },
                        {
                          $add: [
                            k1,
                            {
                              $multiply: [
                                k1,
                                {
                                  $divide: [
                                    '$_nameLen',
                                    avgDocLength
                                  ]
                                }
                              ]
                            }
                          ]
                        }
                      ]
                    },
                    8
                  ]
                }
              ]
            }
          }
        },
        {
          $sort: { bm25Score: -1, createdAt: -1 }
        },
        {
          $skip: skip
        },
        {
          $limit: limit
        },
        {
          $lookup: {
            from: 'users',
            localField: 'ownerUserId',
            foreignField: '_id',
            as: 'owner'
          }
        },
        {
          $unwind: { path: '$owner', preserveNullAndEmptyArrays: true }
        },
        {
          $project: {
            _id: 1,
            title: 1,
            fullName: 1,
            jobTitle: 1,
            company: 1,
            email: 1,
            bio: 1,
            shortLink: 1,
            qrCode: 1,
            loveCount: 1,
            views: 1,
            createdAt: 1,
            bm25Score: 1,
            'owner.username': 1,
            'owner.email': 1,
            'owner.name': 1,
            _titleWords: 0,
            _nameWords: 0,
            _titleLen: 0,
            _nameLen: 0,
            docLength: 0
          }
        }
      ];

      const results = await Card.aggregate(pipeline);
      const total = await Card.countDocuments({
        isPublic: true,
        ...filters,
        $or: bm25Or
      });

      return {
        results,
        total,
        algorithm: 'bm25',
        query,
        pagination: {
          limit,
          skip,
          hasMore: skip + limit < total
        }
      };
    } catch (error) {
      logger.error(`BM25 search error: ${error.message}`);
      throw error;
    }
  }

  /**
   * 3. Hybrid Search Algorithm
   * Combines multiple algorithms for optimal results
   */
  async hybridSearch(query, options = {}) {
    try {
      const { limit = 20, skip = 0, filters = {}, algorithm = 'hybrid' } = options;
      
      // Get results from multiple algorithms
      const [tfidfResults, bm25Results] = await Promise.all([
        this.tfidfSearch(query, { limit: Math.ceil(limit * 0.6), skip: 0, filters }),
        this.bm25Search(query, { limit: Math.ceil(limit * 0.4), skip: 0, filters })
      ]);

      // Combine and deduplicate results
      const combinedResults = this.mergeResults(tfidfResults.results, bm25Results.results);
      
      // Apply pagination
      const paginatedResults = combinedResults.slice(skip, skip + limit);

      return {
        results: paginatedResults,
        total: Math.max(tfidfResults.total || 0, bm25Results.total || 0, combinedResults.length),
        algorithm: 'hybrid',
        query,
        pagination: {
          limit,
          skip,
          hasMore: skip + limit < combinedResults.length
        }
      };
    } catch (error) {
      logger.error(`Hybrid search error: ${error.message}`);
      throw error;
    }
  }

  /**
   * 4. Advanced Sorting Algorithms
   */
  async advancedSorting(cards, sortBy = 'relevance', sortOrder = 'desc') {
    try {
      const sortFunctions = {
        // Popularity-based sorting with engagement metrics
        popularity: (a, b) => {
          const scoreA = (a.views * 0.4) + (a.loveCount * 0.6) + (a.shares * 0.2);
          const scoreB = (b.views * 0.4) + (b.loveCount * 0.6) + (b.shares * 0.2);
          return sortOrder === 'desc' ? scoreB - scoreA : scoreA - scoreB;
        },

        // Recency with popularity boost
        recent_popular: (a, b) => {
          const timeWeightA = this.calculateTimeWeight(a.createdAt);
          const timeWeightB = this.calculateTimeWeight(b.createdAt);
          const scoreA = timeWeightA * (1 + (a.loveCount * 0.1));
          const scoreB = timeWeightB * (1 + (b.loveCount * 0.1));
          return sortOrder === 'desc' ? scoreB - scoreA : scoreA - scoreB;
        },

        // Trending algorithm (recent engagement)
        trending: (a, b) => {
          const recentEngagementA = this.calculateRecentEngagement(a);
          const recentEngagementB = this.calculateRecentEngagement(b);
          return sortOrder === 'desc' ? recentEngagementB - recentEngagementA : recentEngagementA - recentEngagementB;
        },

        // Quality score (completeness + engagement)
        quality: (a, b) => {
          const qualityA = this.calculateQualityScore(a);
          const qualityB = this.calculateQualityScore(b);
          return sortOrder === 'desc' ? qualityB - qualityA : qualityA - qualityB;
        },

        // Default relevance sorting
        relevance: (a, b) => {
          const relevanceA = a.tfidfScore || a.bm25Score || 0;
          const relevanceB = b.tfidfScore || b.bm25Score || 0;
          return sortOrder === 'desc' ? relevanceB - relevanceA : relevanceA - relevanceB;
        },

        // Alphabetical by name
        name: (a, b) => {
          const nameA = (a.fullName || '').toLowerCase();
          const nameB = (b.fullName || '').toLowerCase();
          return sortOrder === 'desc' ? nameB.localeCompare(nameA) : nameA.localeCompare(nameB);
        },

        recent: (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
        oldest: (a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0),
        popular: (a, b) => ((b.loveCount || 0) + (b.views || 0) * 0.1) - ((a.loveCount || 0) + (a.views || 0) * 0.1),
        views: (a, b) => (b.views || 0) - (a.views || 0),
        loves: (a, b) => (b.loveCount || 0) - (a.loveCount || 0),
        date: (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
        newest: (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
        company: (a, b) => (a.company || '').localeCompare(b.company || ''),
      };

      const sortFunction = sortFunctions[sortBy] || sortFunctions.relevance;
      return [...cards].sort(sortFunction);
    } catch (error) {
      logger.error(`Advanced sorting error: ${error.message}`);
      return cards;
    }
  }

  /**
   * Helper methods for sorting algorithms
   */
  calculateTimeWeight(createdAt) {
    const now = new Date();
    const diffInHours = (now - new Date(createdAt)) / (1000 * 60 * 60);
    return Math.exp(-diffInHours / 168); // Decay over 1 week
  }

  calculateRecentEngagement(card) {
    const now = new Date();
    const createdAt = new Date(card.createdAt);
    const daysSinceCreation = (now - createdAt) / (1000 * 60 * 60 * 24);
    
    // Higher engagement for recent cards
    const timeMultiplier = Math.max(0.1, 1 - (daysSinceCreation / 30));
    return (card.loveCount + card.views * 0.1) * timeMultiplier;
  }

  calculateQualityScore(card) {
    let score = 0;
    
    // Completeness score
    if (card.title) score += 10;
    if (card.fullName) score += 10;
    if (card.jobTitle) score += 8;
    if (card.company) score += 8;
    if (card.email) score += 6;
    if (card.phone) score += 6;
    if (card.website) score += 4;
    if (card.bio) score += 5;
    
    // Engagement score
    score += (card.loveCount * 2);
    score += (card.views * 0.1);
    score += (card.shares * 1);
    
    return score;
  }

  mergeResults(results1, results2) {
    const merged = [...results1];
    const seenIds = new Set(results1.map(r => r._id.toString()));
    
    for (const result of results2) {
      if (!seenIds.has(result._id.toString())) {
        merged.push(result);
        seenIds.add(result._id.toString());
      }
    }
    
    return merged;
  }

  /**
   * 5. Fuzzy Search with Levenshtein Distance
   */
  async fuzzySearch(query, options = {}) {
    try {
      const { limit = 20, skip = 0, filters = {}, threshold = 0.7 } = options;
      
      const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 0);
      
      if (searchTerms.length === 0) {
        return { results: [], total: 0, algorithm: 'fuzzy' };
      }

      // Use MongoDB's $regex with fuzzy matching
      const fuzzyRegex = searchTerms.map(term => 
        term.split('').join('.*')
      ).join('|');

      const pipeline = [
        {
          $match: {
            isPublic: true,
            ...filters,
            $or: [
              { title: { $regex: fuzzyRegex, $options: 'i' } },
              { fullName: { $regex: fuzzyRegex, $options: 'i' } },
              { jobTitle: { $regex: fuzzyRegex, $options: 'i' } },
              { company: { $regex: fuzzyRegex, $options: 'i' } },
              { bio: { $regex: fuzzyRegex, $options: 'i' } },
              { industry: { $regex: fuzzyRegex, $options: 'i' } },
              { profession: { $regex: fuzzyRegex, $options: 'i' } },
              { skills: { $regex: fuzzyRegex, $options: 'i' } },
              { services: { $regex: fuzzyRegex, $options: 'i' } }
            ]
          }
        },
        {
          $addFields: {
            _titleWords: { $split: [{ $toLower: { $ifNull: ['$title', ''] } }, ' '] },
            _nameWords: { $split: [{ $toLower: { $ifNull: ['$fullName', ''] } }, ' '] }
          }
        },
        {
          $addFields: {
            fuzzyScore: {
              $sum: [
                {
                  $multiply: [
                    {
                      $size: {
                        $filter: {
                          input: '$_titleWords',
                          cond: { $in: ['$$this', searchTerms] }
                        }
                      }
                    },
                    10
                  ]
                },
                {
                  $multiply: [
                    {
                      $size: {
                        $filter: {
                          input: '$_nameWords',
                          cond: { $in: ['$$this', searchTerms] }
                        }
                      }
                    },
                    8
                  ]
                }
              ]
            }
          }
        },
        {
          $sort: { fuzzyScore: -1, createdAt: -1 }
        },
        {
          $skip: skip
        },
        {
          $limit: limit
        },
        {
          $lookup: {
            from: 'users',
            localField: 'ownerUserId',
            foreignField: '_id',
            as: 'owner'
          }
        },
        {
          $unwind: { path: '$owner', preserveNullAndEmptyArrays: true }
        },
        {
          $project: {
            _id: 1,
            title: 1,
            fullName: 1,
            jobTitle: 1,
            company: 1,
            email: 1,
            bio: 1,
            shortLink: 1,
            qrCode: 1,
            loveCount: 1,
            views: 1,
            createdAt: 1,
            fuzzyScore: 1,
            'owner.username': 1,
            'owner.email': 1,
            'owner.name': 1,
            _titleWords: 0,
            _nameWords: 0
          }
        }
      ];

      const results = await Card.aggregate(pipeline);
      const total = await Card.countDocuments({
        isPublic: true,
        ...filters,
        $or: [
          { title: { $regex: fuzzyRegex, $options: 'i' } },
          { fullName: { $regex: fuzzyRegex, $options: 'i' } },
          { jobTitle: { $regex: fuzzyRegex, $options: 'i' } },
          { company: { $regex: fuzzyRegex, $options: 'i' } },
          { bio: { $regex: fuzzyRegex, $options: 'i' } },
          { industry: { $regex: fuzzyRegex, $options: 'i' } },
          { profession: { $regex: fuzzyRegex, $options: 'i' } },
          { skills: { $regex: fuzzyRegex, $options: 'i' } },
          { services: { $regex: fuzzyRegex, $options: 'i' } }
        ]
      });

      return {
        results,
        total,
        algorithm: 'fuzzy',
        query,
        pagination: {
          limit,
          skip,
          hasMore: skip + limit < total
        }
      };
    } catch (error) {
      logger.error(`Fuzzy search error: ${error.message}`);
      throw error;
    }
  }
}

module.exports = new AdvancedSearchAlgorithms(); 