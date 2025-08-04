const mongoose = require('mongoose');

const cardAccessRequestSchema = new mongoose.Schema({
  cardId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Card',
    required: true
  },
  requesterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  requestType: {
    type: String,
    enum: ['qr_scan', 'manual_request'],
    required: true
  },
  requestMessage: {
    type: String,
    maxlength: 500
  },
  responseMessage: {
    type: String,
    maxlength: 500
  },
  expiresAt: {
    type: Date,
    default: function() {
      return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    }
  }
}, {
  timestamps: true
});

// Indexes for better query performance
cardAccessRequestSchema.index({ cardId: 1, requesterId: 1 });
cardAccessRequestSchema.index({ ownerId: 1, status: 1 });
cardAccessRequestSchema.index({ status: 1, createdAt: -1 });

// Method to check if request is expired
cardAccessRequestSchema.methods.isExpired = function() {
  return this.expiresAt < new Date();
};

// Method to approve request
cardAccessRequestSchema.methods.approve = function(message = '') {
  this.status = 'approved';
  this.responseMessage = message;
  return this.save();
};

// Method to reject request
cardAccessRequestSchema.methods.reject = function(message = '') {
  this.status = 'rejected';
  this.responseMessage = message;
  return this.save();
};

module.exports = mongoose.model('CardAccessRequest', cardAccessRequestSchema); 