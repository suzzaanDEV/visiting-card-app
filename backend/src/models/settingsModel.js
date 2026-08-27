const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  system: {
    siteName: { type: String, default: 'Cardly' },
    siteDescription: { type: String, default: 'Digital Visiting Card Platform' },
    maintenanceMode: { type: Boolean, default: false },
    debugMode: { type: Boolean, default: false },
    registrationEnabled: { type: Boolean, default: true },
    maxFileSize: { type: Number, default: 5 },
    allowedFileTypes: { type: [String], default: ['jpg', 'jpeg', 'png', 'gif', 'webp'] }
  },
  security: {
    sessionTimeout: { type: Number, default: 24 },
    maxLoginAttempts: { type: Number, default: 5 },
    requireStrongPassword: { type: Boolean, default: true },
    enableTwoFactor: { type: Boolean, default: false },
    passwordMinLength: { type: Number, default: 8 }
  },
  email: {
    smtpHost: { type: String, default: 'smtp.gmail.com' },
    smtpPort: { type: Number, default: 587 },
    smtpUser: { type: String, default: 'noreply@cardly.com' },
    smtpPassword: { type: String, default: '' },
    fromEmail: { type: String, default: 'noreply@cardly.com' },
    fromName: { type: String, default: 'Cardly Admin' }
  },
  notifications: {
    emailNotifications: { type: Boolean, default: true },
    pushNotifications: { type: Boolean, default: true },
    adminNotifications: { type: Boolean, default: true },
    userNotifications: { type: Boolean, default: true }
  },
  backup: {
    autoBackup: { type: Boolean, default: true },
    backupFrequency: { type: String, default: 'daily' },
    retentionDays: { type: Number, default: 30 },
    backupLocation: { type: String, default: 'local' },
    lastBackup: { type: Date, default: null }
  }
}, { timestamps: true });

settingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

settingsSchema.statics.updateSettings = async function(updates) {
  let settings = await this.findOne();
  if (!settings) {
    settings = new this(updates);
  } else {
    for (const [section, values] of Object.entries(updates)) {
      if (typeof values === 'object' && values !== null && !Array.isArray(values)) {
        settings[section] = { ...(settings[section]?.toObject?.() || settings[section] || {}), ...values };
      } else {
        settings[section] = values;
      }
    }
  }
  await settings.save();
  return settings;
};

module.exports = mongoose.model('Settings', settingsSchema);
