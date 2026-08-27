const mongoose = require('mongoose');

const notificationTemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['email', 'push', 'in_app'],
    required: true
  },
  subject: {
    type: String
  },
  title: {
    type: String
  },
  body: {
    type: String,
    required: true
  },
  variables: [{
    type: String
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  }
}, {
  timestamps: true
});

notificationTemplateSchema.index({ type: 1, isActive: 1 });
notificationTemplateSchema.index({ name: 1 });

module.exports = mongoose.model('NotificationTemplate', notificationTemplateSchema);
