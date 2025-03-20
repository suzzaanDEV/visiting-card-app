const analyticsService = require('../services/analyticsService');
const logger = require('../utils/logger');

// Track user interaction
exports.trackInteraction = async (req, res, next) => {
  try {
    const { cardId, actionType } = req.body;
    const userId = req.user?.userId;
    
    const metadata = {
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip || req.connection.remoteAddress,
      referrer: req.headers.referer,
      sessionId: req.session?.id,
      pageUrl: req.headers.referer,
      timeSpent: req.body.timeSpent,
      interactionDepth: req.body.interactionDepth
    };

    await analyticsService.trackInteraction(cardId, userId, actionType, metadata);
    
    res.status(200).json({ message: 'Interaction tracked successfully' });
  } catch (error) {
    logger.error(`Track interaction error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

// Get card analytics
exports.getCardAnalytics = async (req, res, next) => {
  try {
    const { cardId } = req.params;
    const { period = '30d' } = req.query;
    
    const analytics = await analyticsService.getCardAnalytics(cardId, period);
    res.status(200).json(analytics);
  } catch (error) {
    logger.error(`Get card analytics error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

// Get user engagement analytics
exports.getUserEngagement = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { period = '30d' } = req.query;
    
    const engagement = await analyticsService.getUserEngagement(userId, period);
    res.status(200).json(engagement);
  } catch (error) {
    logger.error(`Get user engagement error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

// Get trending cards
exports.getTrendingCards = async (req, res, next) => {
  try {
    const { limit = 10, period = '7d' } = req.query;
    
    const trending = await analyticsService.getTrendingCards(parseInt(limit), period);
    res.status(200).json({ trending });
  } catch (error) {
    logger.error(`Get trending cards error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

// Get system analytics
exports.getSystemAnalytics = async (req, res, next) => {
  try {
    const { period = '30d' } = req.query;
    
    const analytics = await analyticsService.getSystemAnalytics(period);
    res.status(200).json(analytics);
  } catch (error) {
    logger.error(`Get system analytics error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

// Get real-time analytics
exports.getRealTimeAnalytics = async (req, res, next) => {
  try {
    const { cardId } = req.params;
    
    // Get analytics for the last 24 hours
    const realTime = await analyticsService.getCardAnalytics(cardId, '1d');
    
    // Get current active users (sessions in last 5 minutes)
    const activeUsers = await analyticsService.getActiveUsers(cardId);
    
    res.status(200).json({
      ...realTime,
      activeUsers
    });
  } catch (error) {
    logger.error(`Get real-time analytics error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

// Get engagement insights
exports.getEngagementInsights = async (req, res, next) => {
  try {
    const { cardId } = req.params;
    const { period = '30d' } = req.query;
    
    const analytics = await analyticsService.getCardAnalytics(cardId, period);
    
    // Calculate insights
    const totalEngagement = analytics.summary.reduce((sum, item) => sum + item.count, 0);
    const avgEngagementPerDay = totalEngagement / 30; // Assuming 30 days
    
    const insights = {
      totalEngagement,
      avgEngagementPerDay,
      topPerformingDay: analytics.trends.reduce((max, day) => 
        day.totalEngagement > max.totalEngagement ? day : max
      ),
      engagementGrowth: analytics.trends.length > 1 ? 
        ((analytics.trends[analytics.trends.length - 1].totalEngagement - analytics.trends[0].totalEngagement) / analytics.trends[0].totalEngagement * 100).toFixed(2) : 0,
      devicePreference: analytics.deviceBreakdown.reduce((max, device) => 
        device.visits > max.visits ? device : max
      ),
      topCountries: analytics.demographics.slice(0, 5)
    };
    
    res.status(200).json({
      analytics,
      insights
    });
  } catch (error) {
    logger.error(`Get engagement insights error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

// Export analytics report
exports.exportAnalyticsReport = async (req, res, next) => {
  try {
    const { cardId } = req.params;
    const { period = '30d', format = 'json' } = req.query;
    
    const analytics = await analyticsService.getCardAnalytics(cardId, period);
    
    if (format === 'csv') {
      // Generate CSV report
      const csvData = generateCSVReport(analytics);
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="analytics-${cardId}-${period}.csv"`);
      res.status(200).send(csvData);
    } else {
      // Return JSON report
      res.status(200).json({
        report: analytics,
        generatedAt: new Date().toISOString(),
        period
      });
    }
  } catch (error) {
    logger.error(`Export analytics report error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

// Helper function to generate CSV report
function generateCSVReport(analytics) {
  const headers = ['Date', 'Views', 'Loves', 'Shares', 'Downloads', 'Total Engagement'];
  const rows = analytics.trends.map(day => {
    const views = day.actions.find(a => a.actionType === 'view')?.count || 0;
    const loves = day.actions.find(a => a.actionType === 'love')?.count || 0;
    const shares = day.actions.find(a => a.actionType === 'share')?.count || 0;
    const downloads = day.actions.find(a => a.actionType === 'download')?.count || 0;
    
    return [
      day._id,
      views,
      loves,
      shares,
      downloads,
      day.totalEngagement
    ];
  });
  
  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');
  
  return csvContent;
} 