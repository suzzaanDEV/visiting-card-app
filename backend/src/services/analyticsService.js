const Analytics = require('../models/analyticsModel');
const Card = require('../models/cardModel');
const User = require('../models/userModel');
const logger = require('../utils/logger');

class AnalyticsService {
  // Track user interaction
  async trackInteraction(cardId, userId, actionType, metadata = {}) {
    try {
      const analytics = new Analytics({
        cardId,
        userId,
        actionType,
        metadata: {
          userAgent: metadata.userAgent,
          ipAddress: metadata.ipAddress,
          referrer: metadata.referrer,
          deviceType: this.getDeviceType(metadata.userAgent),
          location: metadata.location,
          sessionId: metadata.sessionId,
          pageUrl: metadata.pageUrl,
          timeSpent: metadata.timeSpent,
          interactionDepth: metadata.interactionDepth
        },
        isAnonymous: !userId
      });

      await analytics.save();

      // Update card stats based on action type
      await this.updateCardStats(cardId, actionType);

      return analytics;
    } catch (error) {
      logger.error(`Track interaction error: ${error.message}`);
      throw error;
    }
  }

  // Get device type from user agent
  getDeviceType(userAgent) {
    if (!userAgent) return 'desktop';
    
    const mobileRegex = /Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
    const tabletRegex = /iPad|Android(?=.*\bMobile\b)(?=.*\bSafari\b)/i;
    
    if (tabletRegex.test(userAgent)) return 'tablet';
    if (mobileRegex.test(userAgent)) return 'mobile';
    return 'desktop';
  }

  // Update card statistics
  async updateCardStats(cardId, actionType) {
    try {
      const card = await Card.findById(cardId);
      if (!card) return;

      switch (actionType) {
        case 'view':
          card.views += 1;
          break;
        case 'love':
          card.loveCount += 1;
          break;
        case 'unlove':
          card.loveCount = Math.max(0, card.loveCount - 1);
          break;
        case 'share':
          card.shares += 1;
          break;
        case 'download':
          card.downloads += 1;
          break;
      }

      await card.save();
    } catch (error) {
      logger.error(`Update card stats error: ${error.message}`);
    }
  }

  // Get comprehensive card analytics
  async getCardAnalytics(cardId, period = '30d') {
    try {
      const analytics = await Analytics.getAnalyticsSummary(cardId, period);
      const card = await Card.findById(cardId).populate('ownerUserId', 'username email');

      // Get engagement trends
      const engagementTrends = await this.getEngagementTrends(cardId, period);
      
      // Get demographic data
      const demographics = await this.getDemographics(cardId, period);
      
      // Get device breakdown
      const deviceBreakdown = await this.getDeviceBreakdown(cardId, period);

      return {
        card: {
          _id: card._id,
          title: card.title,
          shortLink: card.shortLink,
          owner: card.ownerUserId,
          createdAt: card.createdAt
        },
        summary: analytics,
        trends: engagementTrends,
        demographics,
        deviceBreakdown,
        period
      };
    } catch (error) {
      logger.error(`Get card analytics error: ${error.message}`);
      throw error;
    }
  }

  // Get engagement trends over time
  async getEngagementTrends(cardId, period = '30d') {
    try {
      const days = period === '7d' ? 7 : period === '90d' ? 90 : 30;
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      const trends = await Analytics.aggregate([
        {
          $match: {
            cardId: cardId,
            timestamp: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: {
              date: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
              actionType: '$actionType'
            },
            count: { $sum: 1 }
          }
        },
        {
          $group: {
            _id: '$_id.date',
            actions: {
              $push: {
                actionType: '$_id.actionType',
                count: '$count'
              }
            },
            totalEngagement: { $sum: '$count' }
          }
        },
        {
          $sort: { _id: 1 }
        }
      ]);

      return trends;
    } catch (error) {
      logger.error(`Get engagement trends error: ${error.message}`);
      throw error;
    }
  }

  // Get demographic data
  async getDemographics(cardId, period = '30d') {
    try {
      const days = period === '7d' ? 7 : period === '90d' ? 90 : 30;
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      const demographics = await Analytics.aggregate([
        {
          $match: {
            cardId: cardId,
            timestamp: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: '$metadata.location.country',
            count: { $sum: 1 },
            uniqueUsers: { $addToSet: '$userId' }
          }
        },
        {
          $project: {
            country: '$_id',
            visits: '$count',
            uniqueVisitors: { $size: '$uniqueUsers' }
          }
        },
        {
          $sort: { visits: -1 }
        }
      ]);

      return demographics;
    } catch (error) {
      logger.error(`Get demographics error: ${error.message}`);
      throw error;
    }
  }

  // Get device breakdown
  async getDeviceBreakdown(cardId, period = '30d') {
    try {
      const days = period === '7d' ? 7 : period === '90d' ? 90 : 30;
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      const deviceBreakdown = await Analytics.aggregate([
        {
          $match: {
            cardId: cardId,
            timestamp: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: '$metadata.deviceType',
            count: { $sum: 1 },
            uniqueUsers: { $addToSet: '$userId' }
          }
        },
        {
          $project: {
            deviceType: '$_id',
            visits: '$count',
            uniqueVisitors: { $size: '$uniqueUsers' }
          }
        }
      ]);

      return deviceBreakdown;
    } catch (error) {
      logger.error(`Get device breakdown error: ${error.message}`);
      throw error;
    }
  }

  // Get trending cards
  async getTrendingCards(limit = 10, period = '7d') {
    try {
      const trending = await Analytics.getTrendingCards(limit, period);
      
      // Populate card details
      const cardIds = trending.map(item => item.cardId);
      const cards = await Card.find({ _id: { $in: cardIds } })
        .populate('ownerUserId', 'username email')
        .select('title shortLink createdAt');

      // Merge card details with analytics
      const trendingCards = trending.map(item => {
        const card = cards.find(c => c._id.toString() === item.cardId.toString());
        return {
          ...item,
          card: card || null
        };
      });

      return trendingCards;
    } catch (error) {
      logger.error(`Get trending cards error: ${error.message}`);
      throw error;
    }
  }

  // Get user engagement analytics
  async getUserEngagement(userId, period = '30d') {
    try {
      const engagement = await Analytics.getUserEngagement(userId, period);
      const user = await User.findById(userId).select('username email createdAt');

      // Get user's cards analytics
      const userCards = await Card.find({ ownerUserId: userId });
      const cardIds = userCards.map(card => card._id);
      
      const cardAnalytics = await Analytics.aggregate([
        {
          $match: {
            cardId: { $in: cardIds },
            timestamp: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
          }
        },
        {
          $group: {
            _id: '$cardId',
            totalViews: {
              $sum: { $cond: [{ $eq: ['$actionType', 'view'] }, 1, 0] }
            },
            totalLoves: {
              $sum: { $cond: [{ $eq: ['$actionType', 'love'] }, 1, 0] }
            },
            totalShares: {
              $sum: { $cond: [{ $eq: ['$actionType', 'share'] }, 1, 0] }
            },
            totalDownloads: {
              $sum: { $cond: [{ $eq: ['$actionType', 'download'] }, 1, 0] }
            }
          }
        }
      ]);

      return {
        user,
        engagement,
        cardAnalytics
      };
    } catch (error) {
      logger.error(`Get user engagement error: ${error.message}`);
      throw error;
    }
  }

  // Get system-wide analytics
  async getSystemAnalytics(period = '30d') {
    try {
      const days = period === '7d' ? 7 : period === '90d' ? 90 : 30;
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      const systemStats = await Analytics.aggregate([
        {
          $match: {
            timestamp: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: null,
            totalViews: {
              $sum: { $cond: [{ $eq: ['$actionType', 'view'] }, 1, 0] }
            },
            totalLoves: {
              $sum: { $cond: [{ $eq: ['$actionType', 'love'] }, 1, 0] }
            },
            totalShares: {
              $sum: { $cond: [{ $eq: ['$actionType', 'share'] }, 1, 0] }
            },
            totalDownloads: {
              $sum: { $cond: [{ $eq: ['$actionType', 'download'] }, 1, 0] }
            },
            uniqueUsers: { $addToSet: '$userId' },
            uniqueCards: { $addToSet: '$cardId' }
          }
        },
        {
          $project: {
            totalViews: 1,
            totalLoves: 1,
            totalShares: 1,
            totalDownloads: 1,
            uniqueUsers: { $size: '$uniqueUsers' },
            uniqueCards: { $size: '$uniqueCards' }
          }
        }
      ]);

      return systemStats[0] || {
        totalViews: 0,
        totalLoves: 0,
        totalShares: 0,
        totalDownloads: 0,
        uniqueUsers: 0,
        uniqueCards: 0
      };
    } catch (error) {
      logger.error(`Get system analytics error: ${error.message}`);
      throw error;
    }
  }
}

module.exports = new AnalyticsService(); 