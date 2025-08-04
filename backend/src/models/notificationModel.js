const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  type: {
    type: String,
    enum: ['access_request', 'access_approved', 'access_rejected', 'card_loved', 'card_shared', 'system'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  isRead: {
    type: Boolean,
    default: false
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  expiresAt: {
    type: Date,
    default: function() {
      return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    }
  }
}, {
  timestamps: true
});

// Indexes for better query performance
notificationSchema.index({ recipientId: 1, isRead: 1 });
notificationSchema.index({ recipientId: 1, createdAt: -1 });
notificationSchema.index({ type: 1, createdAt: -1 });

// Method to mark as read
notificationSchema.methods.markAsRead = function() {
  this.isRead = true;
  return this.save();
};

// Method to mark as deleted
notificationSchema.methods.markAsDeleted = function() {
  this.isDeleted = true;
  return this.save();
};

// Static method to create access request notification
notificationSchema.statics.createAccessRequestNotification = async function(recipientId, senderId, cardId, requestId) {
  const notification = new this({
    recipientId,
    senderId,
    type: 'access_request',
    title: 'New Access Request',
    message: 'Someone has requested access to your private card',
    data: {
      cardId,
      requestId,
      actionUrl: `/admin/access-requests/${requestId}`
    }
  });
  
  return await notification.save();
};

// Static method to create access approved notification
notificationSchema.statics.createAccessApprovedNotification = async function(recipientId, cardId, cardTitle) {
  const notification = new this({
    recipientId,
    type: 'access_approved',
    title: 'Access Request Approved',
    message: `Your access request for "${cardTitle}" has been approved`,
    data: {
      cardId,
      actionUrl: `/c/${cardId}`
    }
  });
  
  return await notification.save();
};

// Static method to create access rejected notification
notificationSchema.statics.createAccessRejectedNotification = async function(recipientId, cardId, cardTitle, reason) {
  const notification = new this({
    recipientId,
    type: 'access_rejected',
    title: 'Access Request Rejected',
    message: `Your access request for "${cardTitle}" has been rejected${reason ? `: ${reason}` : ''}`,
    data: {
      cardId,
      reason
    }
  });
  
  return await notification.save();
};

module.exports = mongoose.model('Notification', notificationSchema); 