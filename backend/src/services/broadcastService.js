const Broadcast = require('../models/broadcastModel');
const User = require('../models/userModel');
const Card = require('../models/cardModel');
const Notification = require('../models/notificationModel');
const pushService = require('../utils/pushNotification');
const { sendEmail } = require('../utils/emailService');
const { renderBroadcast } = require('../utils/emailTemplates');
const logger = require('../utils/logger');

class BroadcastService {
  async createBroadcast(data, adminId) {
    // Normalize audience input: accept either a string or an object { type, filters }
    const payload = { ...data };
    if (payload.audience && typeof payload.audience === 'object') {
      const { type, filters } = payload.audience;
      payload.audience = type || 'all';
      payload.audienceFilters = filters || payload.audienceFilters || {};
    }

    const broadcast = new Broadcast({
      ...payload,
      createdBy: adminId,
      status: 'draft'
    });
    // If email channel is enabled but emailHtml not provided, generate from template
    try {
      if (broadcast.channels?.email && !broadcast.emailHtml) {
        const html = renderBroadcast({ title: broadcast.title, message: broadcast.message, imageUrl: broadcast.imageUrl, ctaText: broadcast.ctaText, ctaUrl: broadcast.ctaUrl });
        broadcast.emailHtml = html;
        if (!broadcast.emailSubject) broadcast.emailSubject = broadcast.title || 'Cardly Notification';
      }
    } catch (e) { logger.warn('Failed to render broadcast template', e.message); }
    await broadcast.save();
    try {
      const AuditLog = require('../models/auditLogModel');
      await AuditLog.log({ action: 'notification.send', entityType: 'notification', entityId: broadcast._id, adminId, metadata: { title: broadcast.title, audience: broadcast.audience } });
    } catch (e) { logger.warn('Failed to write audit log for broadcast.create', e.message); }
    return broadcast;
  }

  async updateBroadcast(id, data, adminId) {
    const broadcast = await Broadcast.findById(id);
    if (!broadcast) throw new Error('Broadcast not found');
    if (!['draft', 'scheduled'].includes(broadcast.status)) {
      throw new Error('Can only update draft or scheduled broadcasts');
    }
    // Normalize audience if passed as object
    const update = { ...data };
    if (update.audience && typeof update.audience === 'object') {
      const { type, filters } = update.audience;
      update.audience = type || 'all';
      update.audienceFilters = filters || update.audienceFilters || {};
    }
    Object.assign(broadcast, update);
    await broadcast.save();
    return broadcast;
  }

  async deleteBroadcast(id) {
    const broadcast = await Broadcast.findById(id);
    if (!broadcast) throw new Error('Broadcast not found');
    if (!['draft', 'scheduled'].includes(broadcast.status)) {
      throw new Error('Can only delete draft or scheduled broadcasts');
    }
    await Broadcast.findByIdAndDelete(id);
    try {
      const AuditLog = require('../models/auditLogModel');
      await AuditLog.log({ action: 'notification.send', entityType: 'notification', entityId: id, adminId: null, metadata: { action: 'delete' } });
    } catch (e) { logger.warn('Failed to write audit log for broadcast.delete', e.message); }
    return { success: true };
  }

  async scheduleBroadcast(id, scheduledAt) {
    const broadcast = await Broadcast.findById(id);
    if (!broadcast) throw new Error('Broadcast not found');
    if (broadcast.status !== 'draft') {
      throw new Error('Can only schedule draft broadcasts');
    }
    if (!scheduledAt || new Date(scheduledAt) <= new Date()) {
      throw new Error('Scheduled time must be in the future');
    }
    broadcast.status = 'scheduled';
    broadcast.scheduledAt = new Date(scheduledAt);
    await broadcast.save();
    try {
      const AuditLog = require('../models/auditLogModel');
      await AuditLog.log({ action: 'notification.send', entityType: 'notification', entityId: broadcast._id, adminId: null, metadata: { action: 'schedule', scheduledAt: broadcast.scheduledAt } });
    } catch (e) { logger.warn('Failed to write audit log for broadcast.schedule', e.message); }
    return broadcast;
  }

  async cancelBroadcast(id) {
    const broadcast = await Broadcast.findById(id);
    if (!broadcast) throw new Error('Broadcast not found');
    if (!['draft', 'scheduled'].includes(broadcast.status)) {
      throw new Error('Can only cancel draft or scheduled broadcasts');
    }
    broadcast.status = 'cancelled';
    await broadcast.save();
    try {
      const AuditLog = require('../models/auditLogModel');
      await AuditLog.log({ action: 'notification.send', entityType: 'notification', entityId: broadcast._id, adminId: null, metadata: { action: 'cancel' } });
    } catch (e) { logger.warn('Failed to write audit log for broadcast.cancel', e.message); }
    return broadcast;
  }

  async sendBroadcast(id) {
    const broadcast = await Broadcast.findById(id);
    if (!broadcast) throw new Error('Broadcast not found');
    if (['sending', 'sent', 'partially_sent'].includes(broadcast.status)) {
      throw new Error('Broadcast already sent or in progress');
    }

    broadcast.status = 'sending';
    broadcast.sentAt = new Date();
    await broadcast.save();

    const audience = await this.resolveAudience(broadcast);
    broadcast.deliveryStats.total = audience.length;
    await broadcast.save();
    try {
      const AuditLog = require('../models/auditLogModel');
      await AuditLog.log({ action: 'notification.send', entityType: 'notification', entityId: broadcast._id, adminId: broadcast.createdBy, metadata: { totalRecipients: broadcast.deliveryStats.total } });
    } catch (e) { logger.warn('Failed to write audit log for broadcast.send', e.message); }

    if (audience.length === 0) {
      broadcast.status = 'partially_sent';
      await broadcast.save();
      return broadcast;
    }

    let deliveredCount = 0;
    let failedCount = 0;

    for (const userId of audience) {
      try {
        if (broadcast.channels.inApp) {
          await this._sendInApp(broadcast, userId);
          deliveredCount++;
          broadcast.recipients.push({
            userId,
            channel: 'in_app',
            status: 'sent',
            sentAt: new Date()
          });
        }

        if (broadcast.channels.push) {
          const pushResult = await this._sendPush(broadcast, userId);
          if (pushResult.sent > 0) {
            deliveredCount++;
            broadcast.recipients.push({
              userId,
              channel: 'push',
              status: 'sent',
              sentAt: new Date()
            });
          } else {
            failedCount++;
            broadcast.recipients.push({
              userId,
              channel: 'push',
              status: 'failed',
              error: 'No push subscriptions or delivery failed'
            });
          }
        }

        if (broadcast.channels.email) {
          const emailResult = await this._sendEmail(broadcast, userId);
          if (emailResult) {
            deliveredCount++;
            broadcast.recipients.push({
              userId,
              channel: 'email',
              status: 'sent',
              sentAt: new Date()
            });
          } else {
            failedCount++;
            broadcast.recipients.push({
              userId,
              channel: 'email',
              status: 'failed',
              error: 'Email not configured or delivery failed'
            });
          }
        }
      } catch (err) {
        failedCount++;
        broadcast.recipients.push({
          userId,
          channel: 'mixed',
          status: 'failed',
          error: err.message
        });
      }

      broadcast.deliveryStats.sent = deliveredCount + failedCount;
      broadcast.deliveryStats.delivered = deliveredCount;
      broadcast.deliveryStats.failed = failedCount;

      if (broadcast.recipients.length % 100 === 0) {
        await broadcast.save();
      }
    }

    await broadcast.save();

    if (failedCount === 0) {
      broadcast.status = 'sent';
    } else if (deliveredCount > 0) {
      broadcast.status = 'partially_sent';
    } else {
      broadcast.status = 'failed';
    }
    await broadcast.save();

    return broadcast;
  }

  async resolveAudience(broadcast) {
    const { audience, audienceFilters, specificUserIds } = broadcast;
    let query = { isActive: true };

    switch (audience) {
      case 'all':
        break;

      case 'active':
        query.lastLoginAt = { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) };
        break;

      case 'inactive':
        query.$or = [
          { lastLoginAt: { $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
          { lastLoginAt: null }
        ];
        break;

      case 'new':
        query.createdAt = { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) };
        break;

      case 'verified':
        query.isEmailVerified = true;
        break;

      case 'segment': {
        if (audienceFilters.profession) {
          query.profession = audienceFilters.profession;
        }
        if (audienceFilters.city) {
          query.location = audienceFilters.city;
        }
        if (audienceFilters.country) {
          query.location = audienceFilters.country;
        }
        if (audienceFilters.hasCards) {
          const cardOwners = await Card.distinct('ownerUserId', { isActive: true });
          if (audienceFilters.hasCards === true || audienceFilters.hasCards === 'true') {
            query._id = { $in: cardOwners };
          } else {
            query._id = { $nin: cardOwners };
          }
        }
        break;
      }

      case 'specific':
        if (!specificUserIds || specificUserIds.length === 0) return [];
        return specificUserIds;

      default:
        throw new Error(`Unknown audience type: ${audience}`);
    }

    const users = await User.find(query).select('_id');
    return users.map(u => u._id);
  }

  async _sendInApp(broadcast, userId) {
    const notification = new Notification({
      recipientId: userId,
      type: 'system',
      title: broadcast.title,
      message: broadcast.message,
      data: {
        broadcastId: broadcast._id,
        richContent: broadcast.richContent,
        imageUrl: broadcast.imageUrl,
        ctaText: broadcast.ctaText,
        ctaUrl: broadcast.ctaUrl,
        notificationType: broadcast.notificationType
      }
    });
    await notification.save();
    return notification;
  }

  async _sendPush(broadcast, userId) {
    const payload = {
      title: broadcast.pushTitle || broadcast.title,
      body: broadcast.pushBody || broadcast.message,
      data: {
        broadcastId: broadcast._id.toString(),
        notificationType: broadcast.notificationType,
        actionUrl: broadcast.ctaUrl || '/notifications'
      },
      tag: `broadcast-${broadcast._id}`
    };
    return await pushService.sendToUser(userId, payload);
  }

  async _sendEmail(broadcast, userId) {
    if (!broadcast.channels.email || !broadcast.emailSubject || !broadcast.emailHtml) {
      return false;
    }
    const user = await User.findById(userId).select('email');
    if (!user || !user.email) return false;

    try {
      await sendEmail({
        to: user.email,
        subject: broadcast.emailSubject,
        html: broadcast.emailHtml
      });
      return true;
    } catch (err) {
      logger.warn(`Broadcast email send failed for ${userId}: ${err.message}`);
      return false;
    }
  }

  async getBroadcasts(filters = {}) {
    const { status, page = 1, limit = 20 } = filters;
    const query = {};
    if (status) query.status = status;

    const skip = (page - 1) * limit;
    const broadcasts = await Broadcast.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('createdBy', 'username email');

    const total = await Broadcast.countDocuments(query);

    return {
      broadcasts,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async getBroadcastStats(id) {
    const broadcast = await Broadcast.findById(id);
    if (!broadcast) throw new Error('Broadcast not found');
    return {
      deliveryStats: broadcast.deliveryStats,
      status: broadcast.status,
      totalRecipients: broadcast.recipients.length,
      channels: broadcast.channels
    };
  }

  async getDeliveryDetails(id, status) {
    const broadcast = await Broadcast.findById(id);
    if (!broadcast) throw new Error('Broadcast not found');

    let recipients = broadcast.recipients;
    if (status) {
      recipients = recipients.filter(r => r.status === status);
    }

    return {
      broadcastId: id,
      total: recipients.length,
      recipients
    };
  }
}

module.exports = new BroadcastService();
