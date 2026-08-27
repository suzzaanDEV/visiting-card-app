const ContactMessage = require('../models/contactMessageModel');
const { sendEmail } = require('../utils/emailService');
const { renderGeneric } = require('../utils/emailTemplates');

const crmService = {
  async getAll(filters = {}) {
    const query = {};
    if (filters.status) query.status = filters.status;
    if (filters.category) query.category = filters.category;
    if (filters.priority) query.priority = filters.priority;
    if (filters.isSpam !== undefined) query.isSpam = filters.isSpam;
    if (filters.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: 'i' } },
        { email: { $regex: filters.search, $options: 'i' } },
        { subject: { $regex: filters.search, $options: 'i' } }
      ];
    }
    const page = parseInt(filters.page) || 1;
    const limit = parseInt(filters.limit) || 20;
    const skip = (page - 1) * limit;
    const total = await ContactMessage.countDocuments(query);
    const messages = await ContactMessage.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit);
    return { messages, total, page, totalPages: Math.ceil(total / limit) };
  },

  async getById(id) {
    return ContactMessage.findById(id);
  },

  async markAsRead(id) {
    return ContactMessage.findByIdAndUpdate(id, { status: 'read' }, { new: true });
  },

  async markAsReplied(id, adminId, replyMessage) {
    const msg = await ContactMessage.findById(id);
    if (!msg) return null;

    msg.status = 'replied';
    msg.repliedBy = adminId;
    msg.repliedAt = new Date();
    msg.replyMessage = replyMessage;
    await msg.save();

    // Send email reply if email is present
    try {
      if (msg.email) {
        const subject = msg.subject ? `Re: ${msg.subject}` : 'Reply from Cardly';
        const html = renderGeneric({ title: subject, message: replyMessage, ctaText: 'View on Cardly', ctaUrl: process.env.FRONTEND_URL || 'https://cardly.app' });
        await sendEmail({ to: msg.email, subject, html });
      }
    } catch (err) {
      // Log but don't fail the operation
      const logger = require('../utils/logger');
      logger.warn(`Failed to send CRM reply email to ${msg.email}: ${err.message}`);
    }

    return msg;
  },

  async archive(id) {
    return ContactMessage.findByIdAndUpdate(id, { status: 'archived' }, { new: true });
  },

  async markAsSpam(id) {
    return ContactMessage.findByIdAndUpdate(id, { isSpam: true }, { new: true });
  },

  async delete(id) {
    return ContactMessage.findByIdAndDelete(id);
  },

  async getStats() {
    const total = await ContactMessage.countDocuments();
    const unread = await ContactMessage.countDocuments({ status: 'unread' });
    const replied = await ContactMessage.countDocuments({ status: 'replied' });
    const archived = await ContactMessage.countDocuments({ status: 'archived' });
    const spam = await ContactMessage.countDocuments({ isSpam: true });

    const categoryBreakdown = await ContactMessage.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const priorityBreakdown = await ContactMessage.aggregate([
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);

    const last7Days = await ContactMessage.aggregate([
      { $match: { createdAt: { $gte: new Date(Date.now() - 7 * 86400000) } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    return { total, unread, replied, archived, spam, categoryBreakdown, priorityBreakdown, last7Days };
  },

  async bulkUpdate(ids, updateData) {
    return ContactMessage.updateMany({ _id: { $in: ids } }, { $set: updateData });
  },

  async bulkDelete(ids) {
    return ContactMessage.deleteMany({ _id: { $in: ids } });
  }
};

module.exports = crmService;
