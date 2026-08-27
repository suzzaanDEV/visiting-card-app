const mongoose = require('mongoose');

const templateSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true, default: 'general' },
  tags: [{ type: String }],
  preview: {
    backgroundColor: { type: String, required: true },
    textColor: { type: String, default: '#000000' },
    fontFamily: { type: String, default: 'Arial' },
    elements: [{ type: Object, required: true }]
  },
  design: {
    backgroundColor: { type: String, default: '#ffffff' },
    textColor: { type: String, default: '#1a1a1a' },
    accentColor: { type: String, default: '#6366f1' },
    fontFamily: { type: String, default: 'Inter' },
    borderRadius: { type: Number, default: 16 },
    backgroundImage: { type: String, default: '' },
    layout: { type: String, enum: ['standard', 'modern', 'minimal', 'bold', 'creative', 'premium', 'showcase'], default: 'standard' },
    headerStyle: { type: String, enum: ['centered', 'left', 'right', 'full'], default: 'centered' },
    avatarShape: { type: String, enum: ['circle', 'rounded', 'square'], default: 'circle' },
    avatarSize: { type: Number, default: 120 },
    sections: [{
      id: { type: String },
      type: { type: String },
      title: { type: String },
      visible: { type: Boolean, default: true },
      order: { type: Number }
    }],
    elements: [{ type: Object }],
    aspectRatio: { type: String, default: '16:9' }
  },
  backgroundImage: { type: String, default: '' },
  thumbnail: { type: String, default: '' },
  isPremium: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  usageCount: { type: Number, default: 0 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: { updatedAt: 'updatedAt' } });

templateSchema.index({ category: 1, isActive: 1 });
templateSchema.index({ name: 'text', description: 'text' });
templateSchema.index({ isFeatured: 1, isActive: 1 });

module.exports = mongoose.model('Template', templateSchema); 