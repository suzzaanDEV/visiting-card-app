const AuditLog = require('../models/auditLogModel');
const requestContext = require('../utils/requestContext');

const stripUndefined = (obj) => Object.entries(obj).reduce((acc, [k, v]) => {
  if (v !== undefined && v !== null) acc[k] = v;
  return acc;
}, {});

const auditService = {
  // Record an audit event. Caller-provided values always win over the
  // request context captured by the auditContext middleware.
  async log(data) {
    const ctx = requestContext.get();
    const payload = {
      requestId: ctx.requestId,
      correlationId: ctx.correlationId,
      method: ctx.method,
      path: ctx.path,
      elapsedMs: ctx.startedAt ? Date.now() - ctx.startedAt : undefined,
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
      ...data
    };
    // Caller-supplied ip/user-agent win; fall back to request context.
    if (payload.ipAddress === undefined || payload.ipAddress === null) payload.ipAddress = ctx.ipAddress;
    if (payload.userAgent === undefined || payload.userAgent === null) payload.userAgent = ctx.userAgent;
    return AuditLog.log(stripUndefined(payload));
  },

  async getRecent(limit = 50, filters = {}) {
    return AuditLog.getRecent(limit, filters);
  },

  async getPaginated(filters = {}) {
    const page = Math.max(1, Number(filters.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(filters.limit) || 50));
    const query = {};

    if (filters.action) query.action = filters.action;
    if (filters.entityType) query.entityType = filters.entityType;
    if (filters.severity) query.severity = filters.severity;
    if (filters.success !== undefined && filters.success !== '') query.success = filters.success === 'true' || filters.success === true;
    if (filters.userId) query.userId = filters.userId;
    if (filters.adminId) query.adminId = filters.adminId;
    if (filters.startDate || filters.endDate) {
      query.createdAt = {};
      if (filters.startDate) query.createdAt.$gte = new Date(filters.startDate);
      if (filters.endDate) query.createdAt.$lte = new Date(filters.endDate);
    }
    if (filters.search) {
      const rx = new RegExp(filters.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      query.$or = [
        { action: rx },
        { entityType: rx },
        { errorMessage: rx },
        { ipAddress: rx },
        { path: rx },
        { actorEmail: rx },
        { actorName: rx },
        { requestId: { $regex: rx.source, $options: 'i' } }
      ];
    }

    const [logs, total] = await Promise.all([
      AuditLog.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      AuditLog.countDocuments(query)
    ]);

    return {
      logs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
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