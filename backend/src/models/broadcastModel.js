const mongoose = require('mongoose');

const broadcastSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true
  },
  richContent: {
    type: String
  },
  imageUrl: {
    type: String
  },
  ctaText: {
    type: String
  },
  ctaUrl: {
    type: String
  },
  notificationType: {
    type: String,
    enum: ['announcement', 'update', 'marketing', 'security', 'card_activity'],
    default: 'announcement'
  },
  channels: {
    inApp: { type: Boolean, default: true },
    push: { type: Boolean, default: false },
    email: { type: Boolean, default: false }
  },
  audience: {
    type: String,
    enum: ['all', 'active', 'inactive', 'new', 'verified', 'segment', 'specific'],
    default: 'all'
  },
  audienceFilters: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  specificUserIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'sending', 'sent', 'partially_sent', 'failed', 'cancelled'],
    default: 'draft'
  },
  scheduledAt: {
    type: Date
  },
  sentAt: {
    type: Date
  },
  expiresAt: {
    type: Date
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  emailSubject: {
    type: String
  },
  emailHtml: {
    type: String
  },
  pushTitle: {
    type: String
  },
  pushBody: {
    type: String
  },
  deliveryStats: {
    total: { type: Number, default: 0 },
    sent: { type: Number, default: 0 },
    delivered: { type: Number, default: 0 },
    failed: { type: Number, default: 0 },
    opened: { type: Number, default: 0 },
    clicked: { type: Number, default: 0 }
  },
  recipients: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    channel: { type: String },
    status: { type: String },
    sentAt: { type: Date },
    error: { type: String }
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  }
}, {
  timestamps: true
});

broadcastSchema.index({ status: 1 });
broadcastSchema.index({ scheduledAt: 1 });
broadcastSchema.index({ createdAt: -1 });
broadcastSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0, partialFilterExpression: { expiresAt: { $exists: true, $ne: null } } });

module.exports = mongoose.model('Broadcast', broadcastSchema);
