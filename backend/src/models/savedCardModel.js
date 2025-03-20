const mongoose = require('mongoose');

const savedCardSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  cardId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Card',
    required: true
  },
  savedAt: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 500
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: 50
  }]
}, { timestamps: true });

// Compound index to ensure unique user-card combinations
savedCardSchema.index({ userId: 1, cardId: 1 }, { unique: true });

// Index for quick retrieval of user's saved cards
savedCardSchema.index({ userId: 1, savedAt: -1 });

// Index for card popularity
savedCardSchema.index({ cardId: 1 });

module.exports = mongoose.model('SavedCard', savedCardSchema);
