const mongoose = require('mongoose');

const contactMessageSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, trim: true, lowercase: true },
  subject: { type: String, required: true, trim: true, maxlength: 200 },
  message: { type: String, required: true, trim: true, maxlength: 2000 },
  category: { type: String, enum: ['general', 'support', 'feedback', 'bug', 'partnership', 'other'], default: 'general' },
  status: { type: String, enum: ['unread', 'read', 'replied', 'archived'], default: 'unread' },
  priority: { type: String, enum: ['low', 'normal', 'high', 'urgent'], default: 'normal' },
  repliedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  repliedAt: { type: Date },
  replyMessage: { type: String },
  ipAddress: { type: String },
  userAgent: { type: String },
  isSpam: { type: Boolean, default: false }
}, { timestamps: true });

contactMessageSchema.index({ status: 1, createdAt: -1 });
contactMessageSchema.index({ email: 1 });
contactMessageSchema.index({ category: 1 });

module.exports = mongoose.model('ContactMessage', contactMessageSchema);
