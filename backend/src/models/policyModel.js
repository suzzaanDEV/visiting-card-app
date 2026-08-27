const mongoose = require('mongoose');

const policySchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
  title: { type: String, required: true, trim: true, maxlength: 200 },
  content: { type: String, required: true },
  summary: { type: String, trim: true, maxlength: 500 },
  version: { type: String, default: '1.0' },
  effectiveDate: { type: Date, default: Date.now },
  lastUpdated: { type: Date, default: Date.now },
  isPublished: { type: Boolean, default: false },
  isRequired: { type: Boolean, default: false },
  acceptedBy: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    acceptedAt: { type: Date, default: Date.now },
    version: { type: String }
  }],
  acceptedCount: { type: Number, default: 0 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' }
}, { timestamps: true });

policySchema.index({ slug: 1 });
policySchema.index({ isPublished: 1 });

policySchema.pre('save', function(next) {
  this.lastUpdated = new Date();
  next();
});

module.exports = mongoose.model('Policy', policySchema);
