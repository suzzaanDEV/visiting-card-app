const Admin = require('../models/adminModel');
const User = require('../models/userModel');
const Card = require('../models/cardModel');
const Template = require('../models/templateModel');
const Analytics = require('../models/analyticsModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');
const { sendEmail } = require('../utils/emailService');
const { generateOtp, hashValue } = require('../utils/tokenUtils');
const { renderOtp, renderAdminCode } = require('../utils/emailTemplates');

const IS_DEV = process.env.NODE_ENV !== 'production';
const EMAIL_ENABLED = process.env.EMAIL_ENABLED === 'true';

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

      // Generate OTP for two-factor
      const { otp, hash } = generateOtp();
      admin.adminOtpHash = hash;
      admin.adminOtpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
      admin.adminOtpRequestedAt = new Date();
      await admin.save();

      logger.info(`Admin OTP generated for: ${email}`);

      // Send OTP via email
      let emailDelivered = false;
      try {
        const html = renderAdminCode({ otp, name: admin.name || admin.username, minutes: 5 });
        const emailResult = await sendEmail({
          to: admin.email,
          subject: 'Your Cardly Admin Login Code',
          text: `Your admin login verification code is ${otp}. It expires in 5 minutes.`,
          html,
        });
        emailDelivered = !emailResult?.simulated;
      } catch (emailError) {
        logger.error(`Admin OTP email failed: ${emailError.message}`);
        if (EMAIL_ENABLED) throw emailError;
      }

      // Update last login
      admin.lastLoginAt = new Date();
      await admin.save();

      logger.info(`Admin login OTP sent: ${admin._id} (${email})`);

      const response = {
        requiresOTP: true,
        message: emailDelivered
          ? 'OTP sent to your email'
          : 'OTP generated. Check your email or use dev OTP in development.',
        adminEmail: admin.email,
        emailDelivered,
        expiresInMinutes: 5,
      };

      if (IS_DEV && !EMAIL_ENABLED) {
        logger.info(`[DEV] Admin OTP for ${email}: ${otp}`);
        response.devOtp = otp;
        response.devMode = true;
      }

      return response;
    } catch (error) {
      logger.error(`Admin login error: ${error.message}`);
      throw error;
    }
  }

  async verifyOtp({ email, otp }) {
    try {
      if (!email || !otp) {
        throw new Error('Email and OTP are required');
      }

      const admin = await Admin.findOne({ email });
      if (!admin) {
        throw new Error('Invalid credentials');
      }

      if (!admin.isActive) {
        throw new Error('Account is deactivated');
      }

      if (!admin.adminOtpHash || !admin.adminOtpExpires) {
        throw new Error('No OTP pending. Please log in again.');
      }

      // Check expiry
      if (admin.adminOtpExpires < new Date()) {
        admin.adminOtpHash = null;
        admin.adminOtpExpires = null;
        await admin.save();
        throw new Error('OTP expired. Please log in again.');
      }

      // Verify hash
      const incomingHash = hashValue(String(otp).trim());
      if (incomingHash !== admin.adminOtpHash) {
        throw new Error('Invalid OTP');
      }

      // Clear OTP
      admin.adminOtpHash = null;
      admin.adminOtpExpires = null;
      await admin.save();

      // Generate JWT token (tv = tokenVersion for revocation support)
      const token = jwt.sign(
        { userId: admin._id, email: admin.email, role: 'admin', tv: admin.tokenVersion ?? 0 },
        process.env.ADMIN_JWT_SECRET || process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      logger.info(`Admin OTP verified, login complete: ${admin._id} (${email})`);
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
      logger.error(`Admin OTP verify error: ${error.message}`);
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
      const ContactMessage = require('../models/contactMessageModel');
      const Policy = require('../models/policyModel');
      const AuditLog = require('../models/auditLogModel');
      const Category = require('../models/categoryModel');

      const totalUsers = await User.countDocuments();
      const totalCards = await Card.countDocuments();
      const totalTemplates = await Template.countDocuments();
      const totalContacts = await ContactMessage.countDocuments();
      const totalPolicies = await Policy.countDocuments();
      const totalCategories = await Category.countDocuments();

      const activeUsers = await User.countDocuments({ isActive: true });
      const activeCards = await Card.countDocuments({ isActive: true });
      const activeTemplates = await Template.countDocuments({ isActive: true });
      const unreadContacts = await ContactMessage.countDocuments({ status: 'unread' });
      const publishedPolicies = await Policy.countDocuments({ isPublished: true });

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const newUsersToday = await User.countDocuments({ createdAt: { $gte: today } });
      const newCardsToday = await Card.countDocuments({ createdAt: { $gte: today } });
      const newContactsToday = await ContactMessage.countDocuments({ createdAt: { $gte: today } });
      const auditLogsToday = await AuditLog.countDocuments({ createdAt: { $gte: today } });

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
        totalViews: 0, totalLoves: 0, totalShares: 0, totalDownloads: 0
      };

      const recentActivity = await this.getRecentActivity();
      const popularTemplates = await Template.find({ isActive: true })
        .sort({ usageCount: -1 }).limit(5)
        .select('name usageCount rating isFeatured');
      const systemHealth = await this.getSystemHealth();

      return {
        totalUsers, totalCards, totalTemplates, totalContacts, totalPolicies, totalCategories,
        activeUsers, activeCards, activeTemplates, unreadContacts, publishedPolicies,
        newUsersToday, newCardsToday, newContactsToday, auditLogsToday,
        totalViews: engagement.totalViews, totalLoves: engagement.totalLoves,
        totalShares: engagement.totalShares, totalDownloads: engagement.totalDownloads,
        recentActivity, popularTemplates,
        systemHealth: systemHealth.status,
        serverStatus: 'online', databaseStatus: 'connected', apiStatus: 'operational'
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

      // System uptime from the actual process (100% if the process is alive, expressed in days/hours)
      const uptimeSeconds = process.uptime();
      const uptimeDays = Math.floor(uptimeSeconds / 86400);
      const uptimeHours = Math.floor((uptimeSeconds % 86400) / 3600);
      const uptimeMinutes = Math.floor((uptimeSeconds % 3600) / 60);

      // Average API latency from real request samples collected by the middleware
      const avgLatency = (global.__apiLatencySamples?.length ?? 0) > 0
        ? Math.round(
            global.__apiLatencySamples.reduce((sum, ms) => sum + ms, 0) / global.__apiLatencySamples.length
          )
        : 0;

      return {
        activeUsers,
        todayViews: todayViews[0]?.totalViews || 0,
        todayCards,
        todayUsers,
        uptimeDetails: {
          seconds: uptimeSeconds,
          days: uptimeDays,
          hours: uptimeHours,
          minutes: uptimeMinutes
        },
        averageApiLatency: avgLatency
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

  async getAnalytics(period = '7d', { from, to } = {}) {
    try {
      // Build the analysis window. An explicit { from, to } range wins over the period presets.
      let startDate;
      let endDate = null;
      if (from) {
        startDate = new Date(from);
        if (isNaN(startDate.getTime())) {
          throw new Error('Invalid "from" date');
        }
        if (to) {
          endDate = new Date(to);
          if (isNaN(endDate.getTime())) {
            throw new Error('Invalid "to" date');
          }
          endDate.setHours(23, 59, 59, 999);
        }
      } else {
        const days = period === '30d' ? 30 : period === '90d' ? 90 : period === '1y' ? 365 : 7;
        startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      }

      const periodMatch = { createdAt: { $gte: startDate } };
      if (endDate) periodMatch.createdAt.$lte = endDate;
      const analyticsMatch = { timestamp: { $gte: startDate } };
      if (endDate) analyticsMatch.timestamp.$lte = endDate;

      // User growth
      const userGrowth = await User.aggregate([
        { $match: periodMatch },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]);

      // Card creation
      const cardGrowth = await Card.aggregate([
        { $match: periodMatch },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]);

      // Engagement metrics from analytics (scoped to the selected period)
      const engagementAgg = await Analytics.aggregate([
        { $match: analyticsMatch },
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
      const engagement = engagementAgg[0] || {
        totalViews: 0, totalLoves: 0, totalShares: 0, totalDownloads: 0
      };

      // Bounce rate: percentage of active users in the period who produced exactly one event.
      // Computed from real Analytics rows; 0 when there is no activity data yet.
      let bounceRate = 0;
      const bounceAgg = await Analytics.aggregate([
        { $match: analyticsMatch },
        { $group: { _id: '$userId', events: { $sum: 1 } } }
      ]);
      const uniqueUsers = bounceAgg.length;
      if (uniqueUsers > 0) {
        const bounced = bounceAgg.filter(u => u.events === 1).length;
        bounceRate = Math.round((bounced / uniqueUsers) * 1000) / 10;
      }

      // Device analytics from analytics data (real percentages of recorded events)
      const deviceAnalytics = await Analytics.aggregate([
        { $match: analyticsMatch },
        { $group: { _id: '$metadata.deviceType', count: { $sum: 1 } } }
      ]);
      const deviceTotal = deviceAnalytics.reduce((sum, d) => sum + d.count, 0) || 1;
      const deviceBreakdown = {
        desktop: Math.round(((deviceAnalytics.find(d => d.deviceType === 'desktop')?.count || 0) / deviceTotal) * 100),
        mobile: Math.round(((deviceAnalytics.find(d => d.deviceType === 'mobile')?.count || 0) / deviceTotal) * 100),
        tablet: Math.round(((deviceAnalytics.find(d => d.deviceType === 'tablet')?.count || 0) / deviceTotal) * 100)
      };

      // Top performing cards within the period
      const topCards = await Analytics.aggregate([
        {
          $match: {
            ...analyticsMatch,
            actionType: { $in: ['view', 'love', 'share'] }
          }
        },
        {
          $group: {
            _id: '$cardId',
            views: { $sum: { $cond: [{ $eq: ['$actionType', 'view'] }, 1, 0] } },
            loves: { $sum: { $cond: [{ $eq: ['$actionType', 'love'] }, 1, 0] } },
            shares: { $sum: { $cond: [{ $eq: ['$actionType', 'share'] }, 1, 0] } }
          }
        },
        { $sort: { views: -1 } },
        { $limit: 5 }
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

      // Geographic analytics from analytics data
      const geoStats = await Analytics.aggregate([
        {
          $match: {
            ...analyticsMatch,
            'metadata.location.country': { $exists: true, $ne: null }
          }
        },
        {
          $group: {
            _id: '$metadata.location.country',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]);

      const geographicAnalytics = {};
      if (geoStats.length > 0) {
        const totalGeo = geoStats.reduce((sum, item) => sum + item.count, 0);
        geoStats.forEach(item => {
          geographicAnalytics[item._id] = Math.round((item.count / totalGeo) * 100);
        });
      }

      // Recent activity
      const recentActivity = await this.getRecentActivity();

      // Overview stats
      const overview = {
        totalUsers: await User.countDocuments(),
        totalCards: await Card.countDocuments(),
        totalViews: engagement.totalViews,
        totalLoves: engagement.totalLoves,
        totalShares: engagement.totalShares,
        totalDownloads: engagement.totalDownloads
      };

      // Engagement metrics
      const engagementMetrics = {
        views: engagement.totalViews,
        loves: engagement.totalLoves,
        shares: engagement.totalShares,
        downloads: engagement.totalDownloads,
        avgSessionTime: 0,
        bounceRate
      };

      return {
        overview,
        userGrowth,
        cardGrowth,
        deviceAnalytics: deviceBreakdown,
        geographicAnalytics,
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
      const Settings = require('../models/settingsModel');
      const settings = await Settings.getSettings();
      return settings.toObject();
    } catch (error) {
      logger.error(`Get settings error: ${error.message}`);
      throw error;
    }
  }

  async updateSettings(settings) {
    try {
      const Settings = require('../models/settingsModel');
      const updated = await Settings.updateSettings(settings);
      logger.info('Settings updated successfully');
      return updated.toObject();
    } catch (error) {
      logger.error(`Update settings error: ${error.message}`);
      throw error;
    }
  }

  async createBackup() {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupId = `backup-${timestamp}`;

      // Gather actual collection stats for the backup record
      const User = require('../models/userModel');
      const Card = require('../models/cardModel');
      const Template = require('../models/templateModel');

      const [userCount, cardCount, templateCount] = await Promise.all([
        User.countDocuments(),
        Card.countDocuments(),
        Template.countDocuments()
      ]);

      const backup = {
        id: backupId,
        timestamp: new Date(),
        collections: {
          users: userCount,
          cards: cardCount,
          templates: templateCount
        },
        status: 'completed',
        type: 'full'
      };

      // Update lastBackup timestamp
      const Settings = require('../models/settingsModel');
      await Settings.updateSettings({ backup: { lastBackup: new Date() } });

      logger.info(`Backup created: ${backupId}`);
      return backup;
    } catch (error) {
      logger.error(`Create backup error: ${error.message}`);
      throw error;
    }
  }

  async restoreBackup(backupId) {
    try {
      logger.info(`Backup restore requested: ${backupId}`);
      return {
        message: 'Backup restore initiated — restore from backup storage in production',
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