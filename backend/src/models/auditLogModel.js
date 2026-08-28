const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  action: { type: String, required: true, enum: [
    'user.register', 'user.login', 'user.logout', 'user.update', 'user.delete', 'user.ban', 'user.unban',
    'admin.login', 'admin.logout', 'admin.update_settings', 'admin.backup', 'admin.restore',
    'admin.create_template', 'admin.update_template', 'admin.delete_template',
    'admin.feature_card', 'admin.unfeature_card', 'admin.delete_card',
    'admin.approve_access', 'admin.reject_access',
    'card.create', 'card.update', 'card.delete', 'card.love', 'card.share', 'card.view',
    'card.archive', 'card.restore', 'card.privacy_change',
    'notification.send', 'notification.mark_read',
    'policy.create', 'policy.update', 'policy.publish',
    'auth.password_change', 'auth.password_reset', 'auth.email_verify',
    'auth.two_factor_enable', 'auth.two_factor_disable',
    'auth.two_factor_login', 'auth.two_factor_login_failed',
    'system.error', 'system.backup', 'system.restore'
  ]},
  entityType: { type: String, enum: ['user', 'card', 'admin', 'template', 'policy', 'notification', 'system', null], default: null },
  entityId: { type: mongoose.Schema.Types.ObjectId, default: null },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', default: null },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  },
  ipAddress: { type: String },
  userAgent: { type: String },
  severity: { type: String, enum: ['info', 'warning', 'critical'], default: 'info' },
  success: { type: Boolean, default: true },
  errorMessage: { type: String }
}, { timestamps: true });

auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ adminId: 1, createdAt: -1 });
auditLogSchema.index({ entityType: 1, entityId: 1 });
auditLogSchema.index({ severity: 1, createdAt: -1 });
auditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 });

auditLogSchema.statics.log = async function(data) {
  try {
    return await this.create(data);
  } catch (err) {
    console.error('Audit log write failed:', err.message);
    return null;
  }
};

auditLogSchema.statics.getRecent = async function(limit = 50, filters = {}) {
  const query = {};
  if (filters.action) query.action = filters.action;
  if (filters.entityType) query.entityType = filters.entityType;
  if (filters.severity) query.severity = filters.severity;
  if (filters.userId) query.userId = filters.userId;
  if (filters.adminId) query.adminId = filters.adminId;
  if (filters.startDate || filters.endDate) {
    query.createdAt = {};
    if (filters.startDate) query.createdAt.$gte = new Date(filters.startDate);
    if (filters.endDate) query.createdAt.$lte = new Date(filters.endDate);
  }
  return this.find(query).sort({ createdAt: -1 }).limit(limit);
};

auditLogSchema.statics.getActionCounts = async function(startDate, endDate) {
  const match = {};
  if (startDate || endDate) {
    match.createdAt = {};
    if (startDate) match.createdAt.$gte = new Date(startDate);
    if (endDate) match.createdAt.$lte = new Date(endDate);
  }
  return this.aggregate([
    ...(Object.keys(match).length ? [{ $match: match }] : []),
    { $group: { _id: '$action', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
};

module.exports = mongoose.model('AuditLog', auditLogSchema);
