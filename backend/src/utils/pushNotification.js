const webPush = require('web-push');
const User = require('../models/userModel');
const logger = require('./logger');

// Configure VAPID keys
const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
const vapidEmail = process.env.VAPID_EMAIL || 'mailto:admin@cardly.app';

if (vapidPublicKey && vapidPrivateKey) {
  webPush.setVapidDetails(vapidEmail, vapidPublicKey, vapidPrivateKey);
}

class PushNotificationService {
  // Get VAPID public key for frontend
  getVapidPublicKey() {
    return vapidPublicKey;
  }

  // Save push subscription for a user
  async saveSubscription(userId, subscription) {
    try {
      const user = await User.findById(userId);
      if (!user) throw new Error('User not found');

      // Check if this endpoint already exists
      const existing = user.pushSubscriptions.find(
        s => s.endpoint === subscription.endpoint
      );

      if (existing) {
        existing.keys = subscription.keys;
        existing.createdAt = new Date();
      } else {
        user.pushSubscriptions.push({
          endpoint: subscription.endpoint,
          keys: subscription.keys
        });
      }

      // Keep max 3 subscriptions per user (different browsers/devices)
      if (user.pushSubscriptions.length > 3) {
        user.pushSubscriptions = user.pushSubscriptions.slice(-3);
      }

      await user.save();
      logger.info(`Push subscription saved for user ${userId}`);
      return true;
    } catch (error) {
      logger.error(`Save push subscription error: ${error.message}`);
      throw error;
    }
  }

  // Remove push subscription
  async removeSubscription(userId, endpoint) {
    try {
      await User.findByIdAndUpdate(userId, {
        $pull: { pushSubscriptions: { endpoint } }
      });
      logger.info(`Push subscription removed for user ${userId}`);
      return true;
    } catch (error) {
      logger.error(`Remove push subscription error: ${error.message}`);
      throw error;
    }
  }

  // Send push notification to a specific user
  async sendToUser(userId, payload) {
    try {
      if (!vapidPublicKey || !vapidPrivateKey) {
        logger.warn('VAPID keys not configured, skipping push notification');
        return { sent: 0, failed: 0 };
      }

      const user = await User.findById(userId);
      if (!user || !user.pushSubscriptions.length) {
        return { sent: 0, failed: 0 };
      }

      // Check user preferences
      const prefs = user.notificationPreferences || {};
      if (prefs.pushEnabled === false) {
        return { sent: 0, failed: 0 };
      }

      const pushPayload = JSON.stringify({
        title: payload.title,
        body: payload.body,
        icon: payload.icon || '/vite.svg',
        badge: payload.badge || '/vite.svg',
        data: payload.data || {},
        tag: payload.tag || 'cardly-notification',
        renotify: true
      });

      let sent = 0;
      let failed = 0;
      const endpointsToRemove = [];

      for (const sub of user.pushSubscriptions) {
        try {
          await webPush.sendNotification(
            { endpoint: sub.endpoint, keys: sub.keys },
            pushPayload
          );
          sent++;
        } catch (error) {
          failed++;
          // If subscription is expired or invalid, mark for removal
          if (error.statusCode === 404 || error.statusCode === 410) {
            endpointsToRemove.push(sub.endpoint);
          }
          logger.warn(`Push delivery failed for ${sub.endpoint}: ${error.statusCode}`);
        }
      }

      // Clean up invalid subscriptions
      if (endpointsToRemove.length > 0) {
        await User.findByIdAndUpdate(userId, {
          $pull: { pushSubscriptions: { endpoint: { $in: endpointsToRemove } } }
        });
      }

      return { sent, failed };
    } catch (error) {
      logger.error(`Send push notification error: ${error.message}`);
      return { sent: 0, failed: 0 };
    }
  }

  // Send push notification to multiple users
  async sendToUsers(userIds, payload) {
    const results = [];
    for (const userId of userIds) {
      const result = await this.sendToUser(userId, payload);
      results.push({ userId, ...result });
    }
    return results;
  }

  // Get user notification preferences
  async getPreferences(userId) {
    const user = await User.findById(userId).select('notificationPreferences');
    if (!user) throw new Error('User not found');
    return user.notificationPreferences || {};
  }

  // Update user notification preferences
  async updatePreferences(userId, preferences) {
    const user = await User.findByIdAndUpdate(
      userId,
      { notificationPreferences: preferences },
      { new: true }
    ).select('notificationPreferences');
    if (!user) throw new Error('User not found');
    logger.info(`Notification preferences updated for user ${userId}`);
    return user.notificationPreferences;
  }
}

module.exports = new PushNotificationService();
