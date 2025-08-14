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
    required: false, // Allow anonymous tracking
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
analyticsSchema.index({ 'metadata.deviceType': 1 });

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

// Static method to get system-wide analytics
analyticsSchema.statics.getSystemAnalytics = async function(period = '30d') {
  const days = period === '7d' ? 7 : period === '90d' ? 90 : 30;
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const systemStats = await this.aggregate([
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
};

// Static method to get device analytics
analyticsSchema.statics.getDeviceAnalytics = async function(period = '30d') {
  const days = period === '7d' ? 7 : period === '90d' ? 90 : 30;
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const deviceStats = await this.aggregate([
    {
      $match: {
        timestamp: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: '$metadata.deviceType',
        count: { $sum: 1 }
      }
    },
    {
      $project: {
        deviceType: '$_id',
        count: 1,
        percentage: { $multiply: [{ $divide: ['$count', { $sum: '$count' }] }, 100] }
      }
    }
  ]);

  return deviceStats;
};

// Static method to get geographic analytics
analyticsSchema.statics.getGeographicAnalytics = async function(period = '30d') {
  const days = period === '7d' ? 7 : period === '90d' ? 90 : 30;
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const geoStats = await this.aggregate([
    {
      $match: {
        timestamp: { $gte: startDate },
        'metadata.location.country': { $exists: true, $ne: null }
      }
    },
    {
      $group: {
        _id: '$metadata.location.country',
        count: { $sum: 1 }
      }
    },
    {
      $sort: { count: -1 }
    },
    {
      $limit: 10
    }
  ]);

  return geoStats;
};

module.exports = mongoose.model('Analytics', analyticsSchema); 