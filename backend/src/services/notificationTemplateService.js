const NotificationTemplate = require('../models/notificationTemplateModel');
const logger = require('../utils/logger');

class NotificationTemplateService {
  async createTemplate(data, adminId) {
    const template = new NotificationTemplate({
      ...data,
      createdBy: adminId
    });
    await template.save();
    try {
      const AuditLog = require('../models/auditLogModel');
      await AuditLog.log({ action: 'admin.create_template', entityType: 'template', entityId: template._id, adminId, metadata: { title: template.title } });
    } catch (e) { logger.warn('Failed to write audit log for notification template create', e.message); }
    return template;
  }

  async updateTemplate(id, data) {
    const template = await NotificationTemplate.findById(id);
    if (!template) throw new Error('Template not found');
    Object.assign(template, data);
    await template.save();
    try {
      const AuditLog = require('../models/auditLogModel');
      await AuditLog.log({ action: 'admin.update_template', entityType: 'template', entityId: template._id, adminId: template.createdBy, metadata: { title: template.title } });
    } catch (e) { logger.warn('Failed to write audit log for notification template update', e.message); }
    return template;
  }

  async deleteTemplate(id) {
    const template = await NotificationTemplate.findById(id);
    if (!template) throw new Error('Template not found');
    await NotificationTemplate.findByIdAndDelete(id);
    try {
      const AuditLog = require('../models/auditLogModel');
      await AuditLog.log({ action: 'admin.delete_template', entityType: 'template', entityId: template._id, adminId: template.createdBy, metadata: { title: template.title } });
    } catch (e) { logger.warn('Failed to write audit log for notification template delete', e.message); }
    return { success: true };
  }

  async getTemplateById(id) {
    const template = await NotificationTemplate.findById(id)
      .populate('createdBy', 'username email');
    if (!template) throw new Error('Template not found');
    return template;
  }

  async getTemplates(filters = {}) {
    const { type, isActive, page = 1, limit = 20 } = filters;
    const query = {};
    if (type) query.type = type;
    if (isActive !== undefined) query.isActive = isActive;

    const skip = (page - 1) * limit;
    const templates = await NotificationTemplate.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('createdBy', 'username email');

    const total = await NotificationTemplate.countDocuments(query);

    return {
      templates,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async renderTemplate(templateId, variables = {}) {
    const template = await NotificationTemplate.findById(templateId);
    if (!template) throw new Error('Template not found');

    let rendered = template.body;
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      rendered = rendered.replace(regex, value != null ? String(value) : '');
    }

    let renderedSubject = template.subject || '';
    if (template.subject) {
      for (const [key, value] of Object.entries(variables)) {
        const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
        renderedSubject = renderedSubject.replace(regex, value != null ? String(value) : '');
      }
    }

    let renderedTitle = template.title || '';
    if (template.title) {
      for (const [key, value] of Object.entries(variables)) {
        const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
        renderedTitle = renderedTitle.replace(regex, value != null ? String(value) : '');
      }
    }

    return {
      subject: renderedSubject,
      title: renderedTitle,
      body: rendered
    };
  }
}

module.exports = new NotificationTemplateService();
