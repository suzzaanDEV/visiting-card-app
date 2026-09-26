const Category = require('../models/categoryModel');

const categoryService = {
  async create(data) {
    const cat = await Category.create(data);
    try {
      const AuditLog = require('../models/auditLogModel');
      await AuditLog.log({ action: 'admin.create_category', entityType: 'category', entityId: cat._id, metadata: { category: cat.slug } });
    } catch (e) { /* ignore */ }
    return cat;
  },

  async update(id, data) {
    const before = await Category.findById(id).lean();
    const updated = await Category.findByIdAndUpdate(id, data, { new: true });
    try {
      const AuditLog = require('../models/auditLogModel');
      await AuditLog.log({ action: 'admin.update_category', entityType: 'category', entityId: updated?._id ?? id, metadata: { categoryId: id }, before, after: updated?.toObject?.() || updated });
    } catch (e) { /* ignore */ }
    return updated;
  },

  async getAll() {
    return Category.find({ isActive: true }).sort({ sortOrder: 1, name: 1 });
  },

  async getAllForAdmin() {
    return Category.find().sort({ sortOrder: 1, name: 1 });
  },

  async getBySlug(slug) {
    return Category.findOne({ slug, isActive: true });
  },

  async delete(id) {
    const before = await Category.findById(id).lean();
    const removed = await Category.findByIdAndDelete(id);
    try {
      const AuditLog = require('../models/auditLogModel');
      await AuditLog.log({ action: 'admin.delete_category', entityType: 'category', entityId: removed?._id ?? id, metadata: { categoryId: id }, before });
    } catch (e) { /* ignore */ }
    return removed;
  },

  async updateCardCount(categoryId) {
    const Card = require('../models/cardModel');
    const count = await Card.countDocuments({ category: categoryId, isActive: true });
    return Category.findByIdAndUpdate(categoryId, { cardCount: count });
  },

  async seed() {
    const count = await Category.countDocuments();
    if (count > 0) return;
    const defaults = [
      { name: 'Business', slug: 'business', description: 'Corporate and professional cards', icon: 'briefcase', color: '#3b82f6', sortOrder: 1, isFeatured: true },
      { name: 'Technology', slug: 'technology', description: 'Tech professionals and companies', icon: 'cpu', color: '#8b5cf6', sortOrder: 2, isFeatured: true },
      { name: 'Creative', slug: 'creative', description: 'Designers, artists, and creative professionals', icon: 'palette', color: '#ec4899', sortOrder: 3, isFeatured: true },
      { name: 'Healthcare', slug: 'healthcare', description: 'Medical professionals and healthcare organizations', icon: 'heart-pulse', color: '#10b981', sortOrder: 4, isFeatured: true },
      { name: 'Education', slug: 'education', description: 'Educators and educational institutions', icon: 'graduation-cap', color: '#f59e0b', sortOrder: 5, isFeatured: true },
      { name: 'Personal', slug: 'personal', description: 'Personal networking cards', icon: 'user', color: '#6366f1', sortOrder: 6 },
      { name: 'Finance', slug: 'finance', description: 'Banking, investment, and financial services', icon: 'landmark', color: '#14b8a6', sortOrder: 7 },
      { name: 'Real Estate', slug: 'real-estate', description: 'Real estate agents and property services', icon: 'building', color: '#f97316', sortOrder: 8 },
      { name: 'Marketing', slug: 'marketing', description: 'Marketing and advertising professionals', icon: 'megaphone', color: '#e11d48', sortOrder: 9 },
      { name: 'Legal', slug: 'legal', description: 'Lawyers and legal professionals', icon: 'scale', color: '#475569', sortOrder: 10 },
      { name: 'Food & Hospitality', slug: 'food-hospitality', description: 'Restaurants, hotels, and hospitality', icon: 'utensils', color: '#ea580c', sortOrder: 11 },
      { name: 'Other', slug: 'other', description: 'Other categories', icon: 'layers', color: '#6b7280', sortOrder: 99 }
    ];
    await Category.insertMany(defaults);
    return defaults.length;
  }
};

module.exports = categoryService;
