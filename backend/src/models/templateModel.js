const mongoose = require('mongoose');

const templateSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  tags: [{ type: String }],
  preview: {
    backgroundColor: { type: String, required: true },
    textColor: { type: String, default: '#000000' },
    fontFamily: { type: String, default: 'Arial' },
    elements: [{ type: Object, required: true }]
  },
  design: {
    backgroundColor: { type: String, required: true },
    textColor: { type: String, default: '#000000' },
    fontFamily: { type: String, default: 'Arial' },
    elements: [{ type: Object, required: true }],
    layout: { type: String, default: 'standard' }, // standard, modern, creative, minimal
    aspectRatio: { type: String, default: '16:9' }
  },
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