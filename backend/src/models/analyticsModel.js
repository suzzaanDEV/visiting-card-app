const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  cardId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Card',
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  actionType: {
    type: String,
    enum: ['view', 'love', 'unlove', 'share', 'download', 'save', 'qr_scan', 'link_click'],
    required: true
  },
  metadata: {
    userAgent: String,
    ipAddress: String,
    referrer: String,
    deviceType: {
      type: String,
      enum: ['desktop', 'mobile', 'tablet'],
      default: 'desktop'
    },
    location: {
      country: String,
      city: String,
      region: String
    },
    sessionId: String,
    pageUrl: String,
    timeSpent: Number, // in seconds
    interactionDepth: Number // how many interactions in this session
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  isAnonymous: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// Indexes for performance
analyticsSchema.index({ cardId: 1, actionType: 1, timestamp: -1 });
analyticsSchema.index({ userId: 1, actionType: 1, timestamp: -1 });
analyticsSchema.index({ timestamp: -1 });

// Static method to get analytics summary
analyticsSchema.statics.getAnalyticsSummary = async function(cardId, period = '30d') {
  const days = period === '7d' ? 7 : period === '90d' ? 90 : 30;
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const summary = await this.aggregate([
    {
      $match: {
        cardId: mongoose.Types.ObjectId(cardId),
        timestamp: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: '$actionType',
        count: { $sum: 1 },
        uniqueUsers: { $addToSet: '$userId' }
      }
    },
    {
      $project: {
        actionType: '$_id',
        count: 1,
        uniqueUsers: { $size: '$uniqueUsers' }
      }
    }
  ]);

  return summary;
};

// Static method to get trending cards
analyticsSchema.statics.getTrendingCards = async function(limit = 10, period = '7d') {
  const days = period === '1d' ? 1 : period === '30d' ? 30 : 7;
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const trending = await this.aggregate([
    {
      $match: {
        timestamp: { $gte: startDate },
        actionType: { $in: ['view', 'love', 'share', 'download'] }
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
        },
        uniqueVisitors: { $addToSet: '$userId' },
        lastActivity: { $max: '$timestamp' }
      }
    },
    {
      $project: {
        cardId: '$_id',
        totalViews: 1,
        totalLoves: 1,
        totalShares: 1,
        totalDownloads: 1,
        uniqueVisitors: { $size: '$uniqueVisitors' },
        lastActivity: 1,
        engagementScore: {
          $add: [
            '$totalViews',
            { $multiply: ['$totalLoves', 3] },
            { $multiply: ['$totalShares', 2] },
            { $multiply: ['$totalDownloads', 2] }
          ]
        }
      }
    },
    {
      $sort: { engagementScore: -1 }
    },
    {
      $limit: limit
    }
  ]);

  return trending;
};

// Static method to get user engagement analytics
analyticsSchema.statics.getUserEngagement = async function(userId, period = '30d') {
  const days = period === '7d' ? 7 : period === '90d' ? 90 : 30;
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const engagement = await this.aggregate([
    {
      $match: {
        userId: mongoose.Types.ObjectId(userId),
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
        totalActions: { $sum: '$count' }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]);

  return engagement;
};

module.exports = mongoose.model('Analytics', analyticsSchema); 