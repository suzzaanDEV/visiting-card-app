const auditService = require('../services/auditService');
const AuditLog = require('../models/auditLogModel');

exports.getRecentLogs = async (req, res) => {
  try {
    const {
      page, limit, search, action, entityType, severity, success,
      userId, adminId, startDate, endDate,
    } = req.query;
    const result = await auditService.getPaginated({
      page, limit, search, action, entityType, severity, success,
      userId, adminId, startDate, endDate,
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getActionList = async (req, res) => {
  try {
    const counts = await AuditLog.getActionCounts();
    const used = new Set(counts.map((c) => c._id));
    const actions = AuditLog.ACTION_TYPES.map((action) => ({
      action,
      count: used.has(action) ? counts.find((c) => c._id === action).count : 0,
    }));
    res.json({ actions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getStats = async (req, res) => {
  try {
    const stats = await auditService.getStats();
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getActionCounts = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const counts = await auditService.getActionCounts(startDate, endDate);
    res.json(counts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getByEntity = async (req, res) => {
  try {
    const logs = await auditService.getByEntity(req.params.entityType, req.params.entityId);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getTimeline = async (req, res) => {
  try {
    const { hours = 24 } = req.query;
    const timeline = await auditService.getTimeline(parseInt(hours));
    res.json(timeline);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.exportLogs = async (req, res) => {
  try {
    const { format = 'json', limit = 100, search, action, entityType, severity, success, userId, adminId, startDate, endDate } = req.query;
    const result = await auditService.getPaginated({
      limit, search, action, entityType, severity, success, userId, adminId, startDate, endDate,
    });
    const logs = result.logs;

    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="audit-logs-${Date.now()}.csv"`);
      const header = 'timestamp,action,entityType,entityId,userId,adminId,actorEmail,severity,success,statusCode,method,path,requestId,elapsedMs,errorMessage,ipAddress,metadata\n';
      const rows = logs.map(l => {
        const md = l.metadata ? JSON.stringify(Object.fromEntries(l.metadata)) : '';
        const cell = (v) => (v === null || v === undefined ? '' : String(v).replace(/\n/g, ' '));
        return [
          l.createdAt ? l.createdAt.toISOString() : '',
          cell(l.action),
          cell(l.entityType),
          l.entityId || '',
          l.userId || '',
          l.adminId || '',
          cell(l.actorEmail),
          cell(l.severity),
          l.success,
          cell(l.statusCode),
          cell(l.method),
          cell(l.path),
          cell(l.requestId),
          cell(l.elapsedMs),
          cell(l.errorMessage),
          cell(l.ipAddress),
          `"${md.replace(/"/g, '""')}"`
        ].join(',');
      }).join('\n');
      return res.send(header + rows);
    }

    res.setHeader('Content-Type', 'application/json');
    return res.json({ logs, total: result.total });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};