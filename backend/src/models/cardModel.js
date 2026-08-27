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
  department: {
    type: String,
    trim: true,
    maxlength: 100
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    trim: true
  },
  mobile: {
    type: String,
    trim: true
  },
  fax: {
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
  city: {
    type: String,
    trim: true
  },
  state: {
    type: String,
    trim: true
  },
  country: {
    type: String,
    trim: true
  },
  postalCode: {
    type: String,
    trim: true
  },
  bio: {
    type: String,
    trim: true,
    maxlength: 500
  },
  tagline: {
    type: String,
    trim: true,
    maxlength: 100
  },
  companyTagline: {
    type: String,
    trim: true,
    maxlength: 200
  },
  socialLinks: {
    linkedin: { type: String, trim: true },
    twitter: { type: String, trim: true },
    github: { type: String, trim: true },
    instagram: { type: String, trim: true },
    facebook: { type: String, trim: true },
    youtube: { type: String, trim: true },
    dribbble: { type: String, trim: true },
    behance: { type: String, trim: true }
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
  cardDesign: {
    backgroundColor: { type: String, default: '#ffffff' },
    textColor: { type: String, default: '#000000' },
    accentColor: { type: String, default: '#047857' },
    fontFamily: { type: String, default: 'Inter' },
    backgroundImage: { type: String, default: '' },
    borderRadius: { type: String, default: '12px' },
    layout: { type: String, default: 'standard' }
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
  templateName: {
    type: String
  },
  featured: {
    type: Boolean,
    default: false
  },
  category: {
    type: String,
    default: 'general',
    trim: true,
    lowercase: true
  },
  industry: {
    type: String,
    trim: true,
    default: ''
  },
  profession: {
    type: String,
    trim: true,
    default: ''
  },
  skills: {
    type: [String],
    default: []
  },
  services: {
    type: [String],
    default: []
  },
  products: {
    type: [String],
    default: []
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
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

cardSchema.index({ isPublic: 1, isActive: 1 });
cardSchema.index({ shortLink: 1 });
cardSchema.index({ ownerUserId: 1 });
cardSchema.index({ privacy: 1, isActive: 1 });
cardSchema.index({ category: 1, isActive: 1 });
cardSchema.index({ loveCount: -1 });
cardSchema.index({ views: -1 });

cardSchema.index(
  { title: 'text', fullName: 'text', jobTitle: 'text', company: 'text', bio: 'text', tags: 'text', category: 'text', city: 'text', country: 'text', industry: 'text', profession: 'text' },
  { weights: { title: 10, fullName: 8, jobTitle: 7, company: 6, tags: 5, category: 4, bio: 3, city: 2, country: 2, industry: 2, profession: 2 }, name: 'card_text_search' }
);

cardSchema.index({ isPublic: 1, isActive: 1, createdAt: -1 });
cardSchema.index({ isPublic: 1, isActive: 1, views: -1 });
cardSchema.index({ isPublic: 1, isActive: 1, loveCount: -1 });
cardSchema.index({ tags: 1 });
cardSchema.index({ city: 1, country: 1 });
cardSchema.index({ industry: 1 });
cardSchema.index({ profession: 1 });

cardSchema.methods.incrementViews = function() {
  return this.constructor.updateOne({ _id: this._id }, { $inc: { views: 1 } });
};

cardSchema.methods.incrementShares = function() {
  return this.constructor.updateOne({ _id: this._id }, { $inc: { shares: 1 } });
};

cardSchema.methods.incrementDownloads = function() {
  return this.constructor.updateOne({ _id: this._id }, { $inc: { downloads: 1 } });
};

cardSchema.methods.isLovedByUser = function(userId) {
  return this.loves.some(love => love.userId.toString() === userId.toString());
};

cardSchema.methods.addLove = async function(userId) {
  const result = await this.constructor.updateOne(
    { _id: this._id, 'loves.userId': { $ne: userId } },
    { $push: { loves: { userId } }, $inc: { loveCount: 1 } }
  );
  return result.modifiedCount > 0;
};

cardSchema.methods.removeLove = async function(userId) {
  const result = await this.constructor.updateOne(
    { _id: this._id },
    { $pull: { loves: { userId } }, $inc: { loveCount: -1 } }
  );
  return result.modifiedCount > 0;
};

module.exports = mongoose.model('Card', cardSchema);
