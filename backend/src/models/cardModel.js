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
    trim: true,
    maxlength: 100
  },
  // Card Details
  fullName: {
    type: String,
    required: true,
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
  email: {
    type: String,
    trim: true,
    maxlength: 100
  },
  phone: {
    type: String,
    trim: true,
    maxlength: 20
  },
  website: {
    type: String,
    trim: true,
    maxlength: 200
  },
  address: {
    type: String,
    trim: true,
    maxlength: 200
  },
  bio: {
    type: String,
    trim: true,
    maxlength: 500
  },
  // Card Design
  cardImage: {
    type: String // URL to uploaded image
  },
  designJson: {
    type: String // JSON string of card design
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
  // Card Status
  shortLink: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  qrCode: {
    type: String
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  templateId: {
    type: String,
    ref: 'Template'
  },
  featured: {
    type: Boolean,
    default: false
  },
  loves: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    lovedAt: {
      type: Date,
      default: Date.now
    }
  }],
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
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: { updatedAt: 'updatedAt' } });

// Indexes for performance
cardSchema.index({ ownerUserId: 1, isActive: 1 });
cardSchema.index({ shortLink: 1 });
cardSchema.index({ loveCount: -1 });
cardSchema.index({ views: -1 });
cardSchema.index({ createdAt: -1 });

// Text index for search functionality
cardSchema.index({
  title: 'text',
  fullName: 'text',
  jobTitle: 'text',
  company: 'text',
  email: 'text',
  bio: 'text'
}, {
  weights: {
    title: 10,
    fullName: 8,
    jobTitle: 6,
    company: 6,
    email: 4,
    bio: 2
  },
  name: 'card_text_search'
});

// Virtual for love status
cardSchema.virtual('isLoved').get(function() {
  return this.loves.length > 0;
});

// Method to add love
cardSchema.methods.addLove = function(userId) {
  const existingLove = this.loves.find(love => love.userId.toString() === userId.toString());
  if (!existingLove) {
    this.loves.push({ userId });
    this.loveCount = this.loves.length;
    return true;
  }
  return false;
};

// Method to remove love
cardSchema.methods.removeLove = function(userId) {
  const loveIndex = this.loves.findIndex(love => love.userId.toString() === userId.toString());
  if (loveIndex > -1) {
    this.loves.splice(loveIndex, 1);
    this.loveCount = this.loves.length;
    return true;
  }
  return false;
};

// Method to check if user loved this card
cardSchema.methods.isLovedByUser = function(userId) {
  return this.loves.some(love => love.userId.toString() === userId.toString());
};

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

module.exports = mongoose.model('Card', cardSchema);