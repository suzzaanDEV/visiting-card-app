const auditService = require('../services/auditService');

exports.getRecentLogs = async (req, res) => {
  try {
    const { limit = 50, action, entityType, severity, userId, adminId, startDate, endDate } = req.query;
    const filters = {};
    if (action) filters.action = action;
    if (entityType) filters.entityType = entityType;
    if (severity) filters.severity = severity;
    if (userId) filters.userId = userId;
    if (adminId) filters.adminId = adminId;
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;
    const logs = await auditService.getRecent(parseInt(limit), filters);
    res.json(logs);
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
    const { format = 'json', limit = 100, action, entityType, severity, userId, adminId, startDate, endDate } = req.query;
    const filters = {};
    if (action) filters.action = action;
    if (entityType) filters.entityType = entityType;
    if (severity) filters.severity = severity;
    if (userId) filters.userId = userId;
    if (adminId) filters.adminId = adminId;
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;

    const logs = await auditService.getRecent(parseInt(limit), filters);

    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="audit-logs-${Date.now()}.csv"`);
      // Simple CSV serialization
      const header = 'timestamp,action,entityType,entityId,userId,adminId,severity,success,errorMessage,metadata\n';
      const rows = logs.map(l => {
        const md = l.metadata ? JSON.stringify(Object.fromEntries(l.metadata)) : '';
        return `${l.createdAt.toISOString()},${l.action},${l.entityType || ''},${l.entityId || ''},${l.userId || ''},${l.adminId || ''},${l.severity || ''},${l.success},${(l.errorMessage || '').replace(/\n/g, ' ')} ,"${md.replace(/"/g, '""')}"`;
      }).join('\n');
      return res.send(header + rows);
    }

    // Default JSON
    res.setHeader('Content-Type', 'application/json');
    return res.json({ logs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
