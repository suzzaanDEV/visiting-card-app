const Notification = require('../models/notificationModel');
const User = require('../models/userModel');
const Card = require('../models/cardModel');
const CardAccessRequest = require('../models/cardAccessRequestModel');
const logger = require('../utils/logger');

class NotificationService {
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
        recipientId: userId
      });

      if (!notification) {
        throw new Error('Notification not found');
      }

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
      return notification;
    } catch (error) {
      logger.error(`Create card shared notification error: ${error.message}`);
      throw error;
    }
  }

  // Clean up expired notifications
  async cleanupExpiredNotifications() {
    try {
      const result = await Notification.deleteMany({
        expiresAt: { $lt: new Date() }
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
}

module.exports = new NotificationService(); 