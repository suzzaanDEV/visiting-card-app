const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  name: {
    type: String,
    trim: true,
    maxlength: 100
  },
  jobTitle: {
    type: String,
    trim: true,
    maxlength: 100
  },
  company: {
    type: String,
    trim: true,
    maxlength: 100
  },
  phone: {
    type: String,
    trim: true
  },
  location: {
    type: String,
    trim: true
  },
  website: {
    type: String,
    trim: true
  },
  bio: {
    type: String,
    maxlength: 500
  },
  avatar: {
    type: String
  },
  pushSubscriptions: [{
    endpoint: { type: String, required: true },
    keys: {
      p256dh: { type: String, required: true },
      auth: { type: String, required: true }
    },
    createdAt: { type: Date, default: Date.now }
  }],
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },
  privacySettings: {
    defaultCardVisibility: { type: String, enum: ['public', 'private', 'contacts'], default: 'public' },
    showEmail: { type: Boolean, default: true },
    showPhone: { type: Boolean, default: true },
    showAddress: { type: Boolean, default: true },
    profileVisible: { type: Boolean, default: true }
  },
  notificationPreferences: {
    pushEnabled: { type: Boolean, default: true },
    cardLoved: { type: Boolean, default: true },
    cardShared: { type: Boolean, default: true },
    cardViewed: { type: Boolean, default: true },
    accessRequests: { type: Boolean, default: true },
    accessUpdates: { type: Boolean, default: true },
    systemAlerts: { type: Boolean, default: true },
    weeklyDigest: { type: Boolean, default: false }
  },
  // Add activity tracking fields
  lastLoginAt: {
    type: Date,
    default: null
  },
  loginCount: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationOtpHash: String,
  emailVerificationOtpExpires: Date,
  otpLastRequestedAt: Date,
  twoFactorOtpHash: String,
  twoFactorOtpExpires: Date,
  twoFactorOtpRequestedAt: Date,
  refreshTokenHash: String,
  refreshTokenExpires: Date,
  passwordResetTokenHash: String,
  passwordResetExpires: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: { updatedAt: 'updatedAt' } });

// Index for search functionality
userSchema.index({ username: 'text', email: 'text', name: 'text' });

module.exports = mongoose.model('User', userSchema);
