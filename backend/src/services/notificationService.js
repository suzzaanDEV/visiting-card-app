const Notification = require('../models/notificationModel');
const User = require('../models/userModel');
const Card = require('../models/cardModel');
const CardAccessRequest = require('../models/cardAccessRequestModel');
const pushService = require('../utils/pushNotification');
const logger = require('../utils/logger');

class NotificationService {
  // Send push notification after creating in-app notification
  async _deliverPush(userId, notification) {
    try {
      const user = await User.findById(userId).select('notificationPreferences');
      if (!user || !user.notificationPreferences?.pushEnabled) return;

      const prefs = user.notificationPreferences;
      const typeMap = {
        access_request: prefs.accessRequests,
        access_approved: prefs.accessUpdates,
        access_rejected: prefs.accessUpdates,
        card_loved: prefs.cardLoved,
        card_shared: prefs.cardShared,
        system: prefs.systemAlerts
      };

      if (typeMap[notification.type] === false) return;

      await pushService.sendToUser(userId, {
        title: notification.title,
        body: notification.message,
        data: {
          notificationId: notification._id.toString(),
          type: notification.type,
          actionUrl: notification.data?.actionUrl || '/notifications'
        },
        tag: `cardly-${notification.type}-${notification._id}`
      });
    } catch (error) {
      logger.warn(`Push delivery failed: ${error.message}`);
    }
  }

  // Get user's notifications
  async getUserNotifications(userId, { page = 1, limit = 20, unreadOnly = false } = {}) {
    try {
      const skip = (page - 1) * limit;
      
      const query = {
        recipientId: userId,
        isDeleted: false
      };

      if (unreadOnly) {
        query.isRead = false;
      }

      const notifications = await Notification.find(query)
        .populate('senderId', 'name username email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Notification.countDocuments(query);
      const unreadCount = await Notification.countDocuments({
        recipientId: userId,
        isRead: false,
        isDeleted: false
      });

      return {
        notifications,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        },
        unreadCount
      };
    } catch (error) {
      logger.error(`Get user notifications error: ${error.message}`);
      throw error;
    }
  }

  // Mark notification as read
  async markAsRead(notificationId, userId) {
    try {
      const notification = await Notification.findOne({
        _id: notificationId,
        recipientId: userId,
        isDeleted: false
      });

      if (!notification) {
        throw new Error('Notification not found');
      }

      if (notification.isRead) return notification;

      await notification.markAsRead();
      return notification;
    } catch (error) {
      logger.error(`Mark notification as read error: ${error.message}`);
      throw error;
    }
  }

  // Mark all notifications as read
  async markAllAsRead(userId) {
    try {
      await Notification.updateMany(
        { recipientId: userId, isRead: false, isDeleted: false },
        { isRead: true }
      );

      return { success: true };
    } catch (error) {
      logger.error(`Mark all notifications as read error: ${error.message}`);
      throw error;
    }
  }

  // Delete notification
  async deleteNotification(notificationId, userId) {
    try {
      const notification = await Notification.findOne({
        _id: notificationId,
        recipientId: userId
      });

      if (!notification) {
        throw new Error('Notification not found');
      }

      await notification.markAsDeleted();
      return notification;
    } catch (error) {
      logger.error(`Delete notification error: ${error.message}`);
      throw error;
    }
  }

  // Create access request notification
  async createAccessRequestNotification(cardId, requesterId, requestId) {
    try {
      // Get the card to find the owner
      const card = await Card.findById(cardId).populate('ownerUserId', 'name username email');
      if (!card) {
        throw new Error('Card not found');
      }

      // Get requester info
      const requester = await User.findById(requesterId);
      if (!requester) {
        throw new Error('Requester not found');
      }

      // Create notification
      const notification = await Notification.createAccessRequestNotification(
        card.ownerUserId._id,
        requesterId,
        cardId,
        requestId
      );

      // Update notification with more specific message
      notification.message = `${requester.name || requester.username} has requested access to your private card "${card.title}"`;
      await notification.save();

      logger.info(`Access request notification created for card ${cardId} from ${requesterId} to ${card.ownerUserId._id}`);
      await this._deliverPush(card.ownerUserId._id, notification);
      return notification;
    } catch (error) {
      logger.error(`Create access request notification error: ${error.message}`);
      throw error;
    }
  }

  // Create access approved notification
  async createAccessApprovedNotification(requestId) {
    try {
      const request = await CardAccessRequest.findById(requestId)
        .populate('cardId', 'title fullName')
        .populate('requesterId', 'name username email');

      if (!request) {
        throw new Error('Access request not found');
      }

      const notification = await Notification.createAccessApprovedNotification(
        request.requesterId._id,
        request.cardId._id,
        request.cardId.title || request.cardId.fullName
      );

      logger.info(`Access approved notification created for request ${requestId}`);
      await this._deliverPush(request.requesterId._id, notification);
      return notification;
    } catch (error) {
      logger.error(`Create access approved notification error: ${error.message}`);
      throw error;
    }
  }

  // Create access rejected notification
  async createAccessRejectedNotification(requestId, reason = '') {
    try {
      const request = await CardAccessRequest.findById(requestId)
        .populate('cardId', 'title fullName')
        .populate('requesterId', 'name username email');

      if (!request) {
        throw new Error('Access request not found');
      }

      const notification = await Notification.createAccessRejectedNotification(
        request.requesterId._id,
        request.cardId._id,
        request.cardId.title || request.cardId.fullName,
        reason
      );

      logger.info(`Access rejected notification created for request ${requestId}`);
      await this._deliverPush(request.requesterId._id, notification);
      return notification;
    } catch (error) {
      logger.error(`Create access rejected notification error: ${error.message}`);
      throw error;
    }
  }

  // Create card loved notification
  async createCardLovedNotification(cardId, loverId) {
    try {
      const card = await Card.findById(cardId).populate('ownerUserId', 'name username email');
      if (!card) {
        throw new Error('Card not found');
      }

      // Prevent duplicate notifications: check if one already exists within 5 min
      const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
      const existing = await Notification.findOne({
        recipientId: card.ownerUserId._id,
        senderId: loverId,
        type: 'card_loved',
        'data.cardId': cardId,
        createdAt: { $gte: fiveMinAgo }
      });
      if (existing) return existing;

      const lover = await User.findById(loverId);
      if (!lover) {
        throw new Error('Lover not found');
      }

      const notification = new Notification({
        recipientId: card.ownerUserId._id,
        senderId: loverId,
        type: 'card_loved',
        title: 'Card Loved',
        message: `${lover.name || lover.username} loved your card "${card.title}"`,
        data: {
          cardId,
          actionUrl: `/c/${card.shortLink}`
        }
      });

      await notification.save();
      logger.info(`Card loved notification created for card ${cardId}`);
      await this._deliverPush(card.ownerUserId._id, notification);
      return notification;
    } catch (error) {
      logger.error(`Create card loved notification error: ${error.message}`);
      throw error;
    }
  }

  // Create card shared notification
  async createCardSharedNotification(cardId, sharerId) {
    try {
      const card = await Card.findById(cardId).populate('ownerUserId', 'name username email');
      if (!card) {
        throw new Error('Card not found');
      }

      // Prevent duplicate notifications: check if one already exists within 5 min
      const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
      const existing = await Notification.findOne({
        recipientId: card.ownerUserId._id,
        senderId: sharerId,
        type: 'card_shared',
        'data.cardId': cardId,
        createdAt: { $gte: fiveMinAgo }
      });
      if (existing) return existing;

      const sharer = await User.findById(sharerId);
      if (!sharer) {
        throw new Error('Sharer not found');
      }

      const notification = new Notification({
        recipientId: card.ownerUserId._id,
        senderId: sharerId,
        type: 'card_shared',
        title: 'Card Shared',
        message: `${sharer.name || sharer.username} shared your card "${card.title}"`,
        data: {
          cardId,
          actionUrl: `/c/${card.shortLink}`
        }
      });

      await notification.save();
      logger.info(`Card shared notification created for card ${cardId}`);
      await this._deliverPush(card.ownerUserId._id, notification);
      return notification;
    } catch (error) {
      logger.error(`Create card shared notification error: ${error.message}`);
      throw error;
    }
  }

  // Clean up expired notifications (30-day retention)
  async cleanupExpiredNotifications() {
    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      const result = await Notification.deleteMany({
        $or: [
          { expiresAt: { $lt: new Date() } },
          { createdAt: { $lt: thirtyDaysAgo } }
        ]
      });

      logger.info(`Cleaned up ${result.deletedCount} expired notifications`);
      return result.deletedCount;
    } catch (error) {
      logger.error(`Cleanup expired notifications error: ${error.message}`);
      throw error;
    }
  }

  // Get notification statistics
  async getNotificationStats(userId) {
    try {
      const total = await Notification.countDocuments({
        recipientId: userId,
        isDeleted: false
      });

      const unread = await Notification.countDocuments({
        recipientId: userId,
        isRead: false,
        isDeleted: false
      });

      const today = await Notification.countDocuments({
        recipientId: userId,
        createdAt: { $gte: new Date().setHours(0, 0, 0, 0) },
        isDeleted: false
      });

      return {
        total,
        unread,
        today
      };
    } catch (error) {
      logger.error(`Get notification stats error: ${error.message}`);
      throw error;
    }
  }

  // Get user notification preferences
  async getPreferences(userId) {
    try {
      const user = await User.findById(userId).select('notificationPreferences');
      if (!user) throw new Error('User not found');
      return user.notificationPreferences || {};
    } catch (error) {
      logger.error(`Get preferences error: ${error.message}`);
      throw error;
    }
  }

  // Update user notification preferences
  async updatePreferences(userId, preferences) {
    try {
      const allowed = ['pushEnabled', 'cardLoved', 'cardShared', 'accessRequests', 'accessUpdates', 'systemAlerts', 'weeklyDigest'];
      const filtered = {};
      for (const key of allowed) {
        if (preferences[key] !== undefined) {
          filtered[`notificationPreferences.${key}`] = Boolean(preferences[key]);
        }
      }

      const user = await User.findByIdAndUpdate(
        userId,
        { $set: filtered },
        { new: true }
      ).select('notificationPreferences');
      if (!user) throw new Error('User not found');
      logger.info(`Preferences updated for user ${userId}`);
      return user.notificationPreferences;
    } catch (error) {
      logger.error(`Update preferences error: ${error.message}`);
      throw error;
    }
  }

  // Save push subscription
  async savePushSubscription(userId, subscription) {
    try {
      const pushService = require('../utils/pushNotification');
      await pushService.saveSubscription(userId, subscription);
      return true;
    } catch (error) {
      logger.error(`Save push subscription error: ${error.message}`);
      throw error;
    }
  }

  // Remove push subscription
  async removePushSubscription(userId, endpoint) {
    try {
      const pushService = require('../utils/pushNotification');
      await pushService.removeSubscription(userId, endpoint);
      return true;
    } catch (error) {
      logger.error(`Remove push subscription error: ${error.message}`);
      throw error;
    }
  }

  // Get VAPID public key
  getVapidPublicKey() {
    const pushService = require('../utils/pushNotification');
    return pushService.getVapidPublicKey();
  }

  // Create in-app notification from a broadcast
  async createBroadcastNotification(broadcast, userId) {
    try {
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
    } catch (error) {
      logger.error(`Create broadcast notification error: ${error.message}`);
      throw error;
    }
  }

  // Get paginated notification history for a user
  async getNotificationHistory(userId, page = 1, limit = 20) {
    try {
      const skip = (page - 1) * limit;
      const query = { recipientId: userId, isDeleted: false };

      const notifications = await Notification.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Notification.countDocuments(query);

      return {
        notifications,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error(`Get notification history error: ${error.message}`);
      throw error;
    }
  }

  // Clean up stale push subscriptions across all users
  async cleanupExpiredSubscriptions() {
    try {
      const staleThreshold = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
      const result = await User.updateMany(
        {},
        { $pull: { pushSubscriptions: { createdAt: { $lt: staleThreshold } } } }
      );
      logger.info(`Cleaned up stale push subscriptions for ${result.modifiedCount} users`);
      return result.modifiedCount;
    } catch (error) {
      logger.error(`Cleanup expired subscriptions error: ${error.message}`);
      throw error;
    }
  }
}

module.exports = new NotificationService(); 