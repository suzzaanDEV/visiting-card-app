const AuditLog = require('../models/auditLogModel');

const auditService = {
  async log(data) {
    return AuditLog.log(data);
  },

  async getRecent(limit = 50, filters = {}) {
    return AuditLog.getRecent(limit, filters);
  },

  async getActionCounts(startDate, endDate) {
    return AuditLog.getActionCounts(startDate, endDate);
  },

  async getStats() {
    const total = await AuditLog.countDocuments();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayCount = await AuditLog.countDocuments({ createdAt: { $gte: today } });
    const criticalCount = await AuditLog.countDocuments({ severity: 'critical' });
    const recentFailures = await AuditLog.countDocuments({ success: false, createdAt: { $gte: new Date(Date.now() - 86400000) } });

    const actionBreakdown = await AuditLog.aggregate([
      { $group: { _id: '$action', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]);

    const severityBreakdown = await AuditLog.aggregate([
      { $group: { _id: '$severity', count: { $sum: 1 } } }
    ]);

    return { total, todayCount, criticalCount, recentFailures, actionBreakdown, severityBreakdown };
  },

  async getByEntity(entityType, entityId) {
    return AuditLog.find({ entityType, entityId }).sort({ createdAt: -1 }).limit(100);
  },

  async getByUser(userId, limit = 100) {
    return AuditLog.find({ userId }).sort({ createdAt: -1 }).limit(limit);
  },

  async getByAdmin(adminId, limit = 100) {
    return AuditLog.find({ adminId }).sort({ createdAt: -1 }).limit(limit);
  },

  async getTimeline(hours = 24) {
    const since = new Date(Date.now() - hours * 3600000);
    return AuditLog.aggregate([
      { $match: { createdAt: { $gte: since } } },
      {
        $group: {
          _id: {
            hour: { $hour: '$createdAt' },
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }
          },
          count: { $sum: 1 },
          actions: { $addToSet: '$action' }
        }
      },
      { $sort: { '_id.date': 1, '_id.hour': 1 } }
    ]);
  }
};

module.exports = auditService;
