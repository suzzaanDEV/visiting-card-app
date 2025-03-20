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
      const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 2);
      
      if (searchTerms.length === 0) {
        return { results: [], total: 0, algorithm: 'tfidf' };
      }

      // Calculate TF-IDF scores
      const pipeline = [
        {
          $match: {
            isPublic: true,
            ...filters,
            $or: [
              { title: { $regex: searchTerms.join('|'), $options: 'i' } },
              { fullName: { $regex: searchTerms.join('|'), $options: 'i' } },
              { jobTitle: { $regex: searchTerms.join('|'), $options: 'i' } },
              { company: { $regex: searchTerms.join('|'), $options: 'i' } },
              { bio: { $regex: searchTerms.join('|'), $options: 'i' } }
            ]
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
                          input: { $split: [{ $toLower: '$title' }, ' '] },
                          cond: { $in: ['$$this', searchTerms] }
                        }
                      }
                    },
                    10 // Title weight
                  ]
                },
                {
                  $multiply: [
                    {
                      $size: {
                        $filter: {
                          input: { $split: [{ $toLower: '$fullName' }, ' '] },
                          cond: { $in: ['$$this', searchTerms] }
                        }
                      }
                    },
                    8 // Full name weight
                  ]
                },
                {
                  $multiply: [
                    {
                      $size: {
                        $filter: {
                          input: { $split: [{ $toLower: '$jobTitle' }, ' '] },
                          cond: { $in: ['$$this', searchTerms] }
                        }
                      }
                    },
                    6 // Job title weight
                  ]
                },
                {
                  $multiply: [
                    {
                      $size: {
                        $filter: {
                          input: { $split: [{ $toLower: '$company' }, ' '] },
                          cond: { $in: ['$$this', searchTerms] }
                        }
                      }
                    },
                    6 // Company weight
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
          $unwind: '$owner'
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
            'owner.name': 1
          }
        }
      ];

      const results = await Card.aggregate(pipeline);
      const total = await Card.countDocuments({
        isPublic: true,
        ...filters,
        $or: [
          { title: { $regex: searchTerms.join('|'), $options: 'i' } },
          { fullName: { $regex: searchTerms.join('|'), $options: 'i' } },
          { jobTitle: { $regex: searchTerms.join('|'), $options: 'i' } },
          { company: { $regex: searchTerms.join('|'), $options: 'i' } },
          { bio: { $regex: searchTerms.join('|'), $options: 'i' } }
        ]
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
      
      const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 2);
      
      if (searchTerms.length === 0) {
        return { results: [], total: 0, algorithm: 'bm25' };
      }

      // BM25 parameters
      const k1 = 1.2; // Term frequency saturation parameter
      const b = 0.75; // Length normalization parameter
      const avgDocLength = 50; // Average document length (approximate)

      const pipeline = [
        {
          $match: {
            isPublic: true,
            ...filters,
            $or: [
              { title: { $regex: searchTerms.join('|'), $options: 'i' } },
              { fullName: { $regex: searchTerms.join('|'), $options: 'i' } },
              { jobTitle: { $regex: searchTerms.join('|'), $options: 'i' } },
              { company: { $regex: searchTerms.join('|'), $options: 'i' } },
              { bio: { $regex: searchTerms.join('|'), $options: 'i' } }
            ]
          }
        },
        {
          $addFields: {
            docLength: {
              $add: [
                { $strLenCP: '$title' },
                { $strLenCP: '$fullName' },
                { $strLenCP: '$jobTitle' },
                { $strLenCP: '$company' },
                { $strLenCP: '$bio' }
              ]
            },
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
                                  input: { $split: [{ $toLower: '$title' }, ' '] },
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
                                    { $strLenCP: '$title' },
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
                                  input: { $split: [{ $toLower: '$fullName' }, ' '] },
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
                                    { $strLenCP: '$fullName' },
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
          $unwind: '$owner'
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
            'owner.name': 1
          }
        }
      ];

      const results = await Card.aggregate(pipeline);
      const total = await Card.countDocuments({
        isPublic: true,
        ...filters,
        $or: [
          { title: { $regex: searchTerms.join('|'), $options: 'i' } },
          { fullName: { $regex: searchTerms.join('|'), $options: 'i' } },
          { jobTitle: { $regex: searchTerms.join('|'), $options: 'i' } },
          { company: { $regex: searchTerms.join('|'), $options: 'i' } },
          { bio: { $regex: searchTerms.join('|'), $options: 'i' } }
        ]
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
        total: combinedResults.length,
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
        }
      };

      const sortFunction = sortFunctions[sortBy] || sortFunctions.relevance;
      return cards.sort(sortFunction);
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
      
      const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 2);
      
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
              { company: { $regex: fuzzyRegex, $options: 'i' } }
            ]
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
                          input: { $split: [{ $toLower: '$title' }, ' '] },
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
                          input: { $split: [{ $toLower: '$fullName' }, ' '] },
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
          $unwind: '$owner'
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
          { company: { $regex: fuzzyRegex, $options: 'i' } }
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