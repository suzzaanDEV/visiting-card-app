const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true, lowercase: true },
  displayName: { type: String, required: true, trim: true },
  description: { type: String, trim: true, maxlength: 300 },
  permissions: [{
    type: String,
    enum: [
      'cards.create', 'cards.read', 'cards.update', 'cards.delete', 'cards.feature',
      'users.read', 'users.update', 'users.delete', 'users.ban',
      'templates.create', 'templates.read', 'templates.update', 'templates.delete',
      'analytics.read', 'analytics.export',
      'settings.read', 'settings.update',
      'policies.create', 'policies.read', 'policies.update', 'policies.delete',
      'audit.read',
      'notifications.manage',
      'crm.read', 'crm.update',
      'backup.create', 'backup.restore'
    ]
  }],
  isSystem: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  userCount: { type: Number, default: 0 }
}, { timestamps: true });

roleSchema.index({ name: 1 });
roleSchema.index({ isActive: 1 });

module.exports = mongoose.model('Role', roleSchema);
