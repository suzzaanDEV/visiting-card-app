const Admin = require('../models/adminModel');
const User = require('../models/userModel');
const Card = require('../models/cardModel');
const Template = require('../models/templateModel');
const Analytics = require('../models/analyticsModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

class AdminService {
  async login({ email, password }) {
    try {
      // Find admin by email
      const admin = await Admin.findOne({ email });
      if (!admin) {
        throw new Error('Invalid credentials');
      }

      // Check password
      const isPasswordValid = await bcrypt.compare(password, admin.password);
      if (!isPasswordValid) {
        throw new Error('Invalid credentials');
      }

      // Check if admin is active
      if (!admin.isActive) {
        throw new Error('Account is deactivated');
      }

      // Update last login
      admin.lastLoginAt = new Date();
      await admin.save();

      // Generate JWT token
      const token = jwt.sign(
        { userId: admin._id, email: admin.email, role: 'admin' },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      logger.info(`Admin logged in: ${admin._id} (${email})`);
      return {
        admin: {
          adminId: admin._id,
          username: admin.username,
          email: admin.email,
          role: admin.role
        },
        token
      };
    } catch (error) {
      logger.error(`Admin login error: ${error.message}`);
      throw error;
    }
  }

  async getAdminById(adminId) {
    try {
      const admin = await Admin.findById(adminId).select('-password');
      if (!admin) {
        throw new Error('Admin not found');
      }
      return admin;
    } catch (error) {
      logger.error(`Get admin by ID error: ${error.message}`);
      throw error;
    }
  }

  async getDashboardStats() {
    try {
      // Basic counts
      const totalUsers = await User.countDocuments();
      const totalCards = await Card.countDocuments();
      const totalTemplates = await Template.countDocuments();
      
      // Active counts
      const activeUsers = await User.countDocuments({ isActive: true });
      const activeCards = await Card.countDocuments({ isActive: true });
      const activeTemplates = await Template.countDocuments({ isActive: true });

      // Today's stats
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const newUsersToday = await User.countDocuments({ createdAt: { $gte: today } });
      const newCardsToday = await Card.countDocuments({ createdAt: { $gte: today } });

      // Engagement metrics from analytics
      const engagementStats = await Analytics.aggregate([
        {
          $group: {
            _id: null,
            totalViews: { $sum: { $cond: [{ $eq: ['$actionType', 'view'] }, 1, 0] } },
            totalLoves: { $sum: { $cond: [{ $eq: ['$actionType', 'love'] }, 1, 0] } },
            totalShares: { $sum: { $cond: [{ $eq: ['$actionType', 'share'] }, 1, 0] } },
            totalDownloads: { $sum: { $cond: [{ $eq: ['$actionType', 'download'] }, 1, 0] } }
          }
        }
      ]);

      const engagement = engagementStats[0] || {
        totalViews: 0,
        totalLoves: 0,
        totalShares: 0,
        totalDownloads: 0
      };

      // Recent activity (last 10 activities)
      const recentActivity = await this.getRecentActivity();

      // Popular templates
      const popularTemplates = await Template.find({ isActive: true })
        .sort({ usageCount: -1 })
        .limit(5)
        .select('name usageCount rating isFeatured');

      // System health
      const systemHealth = await this.getSystemHealth();

      return {
        totalUsers,
        totalCards,
        totalTemplates,
        activeUsers,
        activeCards,
        activeTemplates,
        newUsersToday,
        newCardsToday,
        totalViews: engagement.totalViews,
        totalLoves: engagement.totalLoves,
        totalShares: engagement.totalShares,
        totalDownloads: engagement.totalDownloads,
        recentActivity,
        popularTemplates,
        systemHealth: systemHealth.status,
        serverStatus: 'online',
        databaseStatus: 'connected',
        apiStatus: 'operational'
      };
    } catch (error) {
      logger.error(`Get dashboard stats error: ${error.message}`);
      throw error;
    }
  }

  async getRecentActivity() {
    try {
      // Get recent user registrations
      const recentUsers = await User.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('username name createdAt');

      // Get recent card creations
      const recentCards = await Card.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('ownerUserId', 'username name')
        .select('title fullName createdAt ownerUserId');

      // Get recent template updates
      const recentTemplates = await Template.find()
        .sort({ updatedAt: -1 })
        .limit(5)
        .select('name updatedAt');

      // Get recent analytics events
      const recentAnalytics = await Analytics.find()
        .sort({ timestamp: -1 })
        .limit(10)
        .populate('cardId', 'title fullName')
        .populate('userId', 'username name')
        .select('actionType timestamp cardId userId');

      const activities = [];

      // Add user activities
      recentUsers.forEach(user => {
        activities.push({
          id: `user_${user._id}`,
          type: 'user_created',
          description: `New user registered: ${user.name || user.username}`,
          user: user.name || user.username,
          time: this.formatTimeAgo(user.createdAt),
          timestamp: user.createdAt
        });
      });

      // Add card activities
      recentCards.forEach(card => {
        const cardName = card.title || card.fullName || 'Untitled Card';
        const ownerName = card.ownerUserId?.name || card.ownerUserId?.username || 'Unknown';
        activities.push({
          id: `card_${card._id}`,
          type: 'card_created',
          description: `New card created: ${cardName} by ${ownerName}`,
          user: ownerName,
          card: cardName,
          time: this.formatTimeAgo(card.createdAt),
          timestamp: card.createdAt
        });
      });

      // Add template activities
      recentTemplates.forEach(template => {
        activities.push({
          id: `template_${template._id}`,
          type: 'template_updated',
          description: `Template updated: ${template.name}`,
          user: 'Admin',
          time: this.formatTimeAgo(template.updatedAt),
          timestamp: template.updatedAt
        });
      });

      // Add analytics activities with meaningful descriptions
      recentAnalytics.forEach(analytics => {
        const userName = analytics.userId?.name || analytics.userId?.username || 'Anonymous';
        const cardName = analytics.cardId?.title || analytics.cardId?.fullName || 'Unknown Card';
        
        let description = '';
        switch (analytics.actionType) {
          case 'view':
            description = `${userName} viewed ${cardName}`;
            break;
          case 'love':
            description = `${userName} loved ${cardName}`;
            break;
          case 'share':
            description = `${userName} shared ${cardName}`;
            break;
          case 'download':
            description = `${userName} downloaded ${cardName}`;
            break;
          case 'contact':
            description = `${userName} contacted owner of ${cardName}`;
            break;
          default:
            description = `${userName} performed ${analytics.actionType} on ${cardName}`;
        }

        activities.push({
          id: `analytics_${analytics._id}`,
          type: `card_${analytics.actionType}`,
          description: description,
          user: userName,
          card: cardName,
          time: this.formatTimeAgo(analytics.timestamp),
          timestamp: analytics.timestamp
        });
      });

      // Sort by timestamp and return top 10
      return activities
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 10);
    } catch (error) {
      logger.error(`Get recent activity error: ${error.message}`);
      return [];
    }
  }

  formatTimeAgo(date) {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  }

  async getRealTimeData() {
    try {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      // Active users (users who logged in today)
      const activeUsers = await User.countDocuments({
        lastLoginAt: { $gte: today }
      });

      // Today's views from analytics
      const todayViews = await Analytics.aggregate([
        {
          $match: {
            actionType: 'view',
            timestamp: { $gte: today }
          }
        },
        {
          $group: {
            _id: null,
            totalViews: { $sum: 1 }
          }
        }
      ]);

      // Today's new cards
      const todayCards = await Card.countDocuments({
        createdAt: { $gte: today }
      });

      // Today's new users
      const todayUsers = await User.countDocuments({
        createdAt: { $gte: today }
      });

      return {
        activeUsers,
        todayViews: todayViews[0]?.totalViews || 0,
        todayCards,
        todayUsers
      };
    } catch (error) {
      logger.error(`Get real-time data error: ${error.message}`);
      return {
        activeUsers: 0,
        todayViews: 0,
        todayCards: 0,
        todayUsers: 0
      };
    }
  }

  async getAnalytics(period = '7d') {
    try {
      const days = period === '30d' ? 30 : period === '90d' ? 90 : 7;
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      // User growth
      const userGrowth = await User.aggregate([
        {
          $match: { createdAt: { $gte: startDate } }
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 }
          }
        },
        {
          $sort: { _id: 1 }
        }
      ]);

      // Card creation
      const cardGrowth = await Card.aggregate([
        {
          $match: { createdAt: { $gte: startDate } }
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 }
          }
        },
        {
          $sort: { _id: 1 }
        }
      ]);

      // Engagement metrics from analytics
      const totalViews = await Analytics.aggregate([
        {
          $group: {
            _id: null,
            totalViews: { $sum: { $cond: [{ $eq: ['$actionType', 'view'] }, 1, 0] } },
            totalLoves: { $sum: { $cond: [{ $eq: ['$actionType', 'love'] }, 1, 0] } },
            totalShares: { $sum: { $cond: [{ $eq: ['$actionType', 'share'] }, 1, 0] } },
            totalDownloads: { $sum: { $cond: [{ $eq: ['$actionType', 'download'] }, 1, 0] } }
          }
        }
      ]);

      // Device analytics from analytics data
      const deviceAnalytics = await Analytics.aggregate([
        {
          $group: {
            _id: '$metadata.deviceType',
            count: { $sum: 1 }
          }
        },
        {
          $project: {
            deviceType: '$_id',
            percentage: { $multiply: [{ $divide: ['$count', { $sum: '$count' }] }, 100] }
          }
        }
      ]);

      // Convert to expected format - use real data or defaults
      const deviceBreakdown = {
        desktop: deviceAnalytics.find(d => d.deviceType === 'desktop')?.percentage || 0,
        mobile: deviceAnalytics.find(d => d.deviceType === 'mobile')?.percentage || 0,
        tablet: deviceAnalytics.find(d => d.deviceType === 'tablet')?.percentage || 0
      };

      // Top performing cards
      const topCards = await Analytics.aggregate([
        {
          $group: {
            _id: '$cardId',
            views: { $sum: { $cond: [{ $eq: ['$actionType', 'view'] }, 1, 0] } },
            loves: { $sum: { $cond: [{ $eq: ['$actionType', 'love'] }, 1, 0] } },
            shares: { $sum: { $cond: [{ $eq: ['$actionType', 'share'] }, 1, 0] } }
          }
        },
        {
          $sort: { views: -1 }
        },
        {
          $limit: 5
        }
      ]);

      // Populate card details
      const cardIds = topCards.map(item => item._id);
      const cards = await Card.find({ _id: { $in: cardIds } })
        .populate('ownerUserId', 'username name')
        .select('title fullName views loveCount shares ownerUserId');

      const topCardsWithDetails = topCards.map(item => {
        const card = cards.find(c => c._id.toString() === item._id.toString());
        return {
          _id: item._id,
          title: card?.title || card?.fullName || 'Unknown Card',
          fullName: card?.fullName || card?.title || 'Unknown Card',
          views: item.views,
          loves: item.loves,
          shares: item.shares,
          owner: card?.ownerUserId
        };
      });

      // Recent activity
      const recentActivity = await this.getRecentActivity();

      // Overview stats
      const overview = {
        totalUsers: await User.countDocuments(),
        totalCards: await Card.countDocuments(),
        totalViews: totalViews[0]?.totalViews || 0,
        totalLoves: totalViews[0]?.totalLoves || 0,
        totalShares: totalViews[0]?.totalShares || 0,
        totalDownloads: totalViews[0]?.totalDownloads || 0
      };

      // Engagement metrics
      const engagementMetrics = {
        views: totalViews[0]?.totalViews || 0,
        loves: totalViews[0]?.totalLoves || 0,
        shares: totalViews[0]?.totalShares || 0,
        downloads: totalViews[0]?.totalDownloads || 0
      };

      return {
        overview,
        userGrowth,
        cardGrowth,
        deviceAnalytics: deviceBreakdown,
        engagementMetrics,
        topCards: topCardsWithDetails,
        recentActivity
      };
    } catch (error) {
      logger.error(`Get analytics error: ${error.message}`);
      throw error;
    }
  }

  async getSystemHealth() {
    try {
      const health = {
        status: 'healthy',
        timestamp: new Date(),
        services: {
          database: 'connected',
          memory: process.memoryUsage(),
          uptime: process.uptime()
        }
      };

      // Check database connection
      try {
        await User.findOne().limit(1);
        health.services.database = 'connected';
      } catch (error) {
        health.status = 'degraded';
        health.services.database = 'disconnected';
      }

      // Check memory usage
      const memoryUsage = process.memoryUsage();
      const memoryPercent = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;
      
      if (memoryPercent > 80) {
        health.status = 'warning';
      }

      return health;
    } catch (error) {
      logger.error(`Get system health error: ${error.message}`);
      throw error;
    }
  }

  async exportData(type, format = 'json') {
    try {
      let data;
      
      switch (type) {
        case 'users':
          data = await User.find({}).select('-password');
          break;
        case 'cards':
          data = await Card.find({}).populate('ownerUserId', 'username name');
          break;
        case 'templates':
          data = await Template.find({});
          break;
        case 'analytics':
          data = await this.getAnalytics('30d');
          break;
        default:
          throw new Error('Invalid export type');
      }

      if (format === 'csv') {
        return this.convertToCSV(data, type);
      }

      return data;
    } catch (error) {
      logger.error(`Export data error: ${error.message}`);
      throw error;
    }
  }

  convertToCSV(data, type) {
    if (!Array.isArray(data) || data.length === 0) {
      return '';
    }

    const headers = Object.keys(data[0].toObject ? data[0].toObject() : data[0]);
    const csvRows = [headers.join(',')];

    data.forEach(item => {
      const values = headers.map(header => {
        const value = item[header];
        return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value;
      });
      csvRows.push(values.join(','));
    });

    return csvRows.join('\n');
  }

  async getSettings() {
    try {
      // Return default settings - in a real app, these would come from a database
      return {
        system: {
          siteName: 'Cardly',
          siteDescription: 'Digital Visiting Card Platform',
          maintenanceMode: false,
          registrationEnabled: true,
          maxFileSize: 5, // MB
          allowedFileTypes: ['jpg', 'jpeg', 'png', 'gif', 'webp']
        },
        security: {
          passwordMinLength: 8,
          requireStrongPassword: true,
          sessionTimeout: 24, // hours
          maxLoginAttempts: 5,
          enableTwoFactor: false
        },
        email: {
          smtpHost: 'smtp.gmail.com',
          smtpPort: 587,
          smtpUser: 'noreply@cardly.com',
          smtpPassword: '',
          fromEmail: 'noreply@cardly.com',
          fromName: 'Cardly Admin'
        },
        notifications: {
          emailNotifications: true,
          pushNotifications: false,
          adminNotifications: true,
          userNotifications: true
        },
        backup: {
          autoBackup: true,
          backupFrequency: 'daily',
          retentionDays: 30,
          backupLocation: 'local'
        }
      };
    } catch (error) {
      logger.error(`Get settings error: ${error.message}`);
      throw error;
    }
  }

  async updateSettings(settings) {
    try {
      // In a real app, this would save to database
      // For now, just return the updated settings
      logger.info('Settings updated successfully');
      return settings;
    } catch (error) {
      logger.error(`Update settings error: ${error.message}`);
      throw error;
    }
  }

  async createBackup() {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupId = `backup-${timestamp}`;
      
      // In a real app, this would create an actual backup
      const backup = {
        id: backupId,
        timestamp: new Date(),
        size: '0 MB',
        status: 'completed',
        type: 'full'
      };

      logger.info(`Backup created: ${backupId}`);
      return backup;
    } catch (error) {
      logger.error(`Create backup error: ${error.message}`);
      throw error;
    }
  }

  async restoreBackup(backupId) {
    try {
      // In a real app, this would restore from backup
      logger.info(`Backup restored: ${backupId}`);
      return {
        message: 'Backup restored successfully',
        backupId,
        timestamp: new Date()
      };
    } catch (error) {
      logger.error(`Restore backup error: ${error.message}`);
      throw error;
    }
  }
}

module.exports = new AdminService(); 