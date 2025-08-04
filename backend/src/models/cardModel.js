const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({
  ownerUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  jobTitle: {
    type: String,
    trim: true
  },
  company: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  website: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  bio: {
    type: String,
    trim: true
  },
  backgroundColor: {
    type: String,
    default: '#ffffff'
  },
  textColor: {
    type: String,
    default: '#000000'
  },
  fontFamily: {
    type: String,
    default: 'Arial'
  },
  shortLink: {
    type: String,
    required: true,
    unique: true
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  isPrivate: {
    type: Boolean,
    default: false
  },
  privacy: {
    type: String,
    enum: ['public', 'private', 'shared'],
    default: 'public'
  },
  templateId: {
    type: String
  },
  featured: {
    type: Boolean,
    default: false
  },
  loveCount: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  shares: {
    type: Number,
    default: 0
  },
  downloads: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  loves: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Index for better query performance
cardSchema.index({ isPublic: 1, isActive: 1 });
cardSchema.index({ shortLink: 1 });
cardSchema.index({ ownerUserId: 1 });
cardSchema.index({ privacy: 1, isActive: 1 });

// Method to increment views
cardSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Method to increment shares
cardSchema.methods.incrementShares = function() {
  this.shares += 1;
  return this.save();
};

// Method to increment downloads
cardSchema.methods.incrementDownloads = function() {
  this.downloads += 1;
  return this.save();
};

// Method to check if user has loved this card
cardSchema.methods.isLovedByUser = function(userId) {
  return this.loves.some(love => love.userId.toString() === userId.toString());
};

// Method to add love
cardSchema.methods.addLove = function(userId) {
  if (!this.isLovedByUser(userId)) {
    this.loves.push({ userId });
    this.loveCount = this.loves.length;
  }
};

// Method to remove love
cardSchema.methods.removeLove = function(userId) {
  this.loves = this.loves.filter(love => love.userId.toString() !== userId.toString());
  this.loveCount = this.loves.length;
};

module.exports = mongoose.model('Card', cardSchema);