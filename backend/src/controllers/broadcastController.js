const broadcastService = require('../services/broadcastService');
const Broadcast = require('../models/broadcastModel');
const logger = require('../utils/logger');

exports.createBroadcast = async (req, res) => {
  try {
    const broadcast = await broadcastService.createBroadcast(req.body, req.admin.adminId);
    res.status(201).json({ broadcast });
  } catch (error) {
    logger.error(`Create broadcast error: ${error.message}`);
    res.status(400).json({ error: error.message });
  }
};

exports.updateBroadcast = async (req, res) => {
  try {
    const broadcast = await broadcastService.updateBroadcast(req.params.id, req.body, req.admin.adminId);
    res.json({ broadcast });
  } catch (error) {
    logger.error(`Update broadcast error: ${error.message}`);
    res.status(400).json({ error: error.message });
  }
};

exports.deleteBroadcast = async (req, res) => {
  try {
    await broadcastService.deleteBroadcast(req.params.id);
    res.json({ message: 'Broadcast deleted' });
  } catch (error) {
    logger.error(`Delete broadcast error: ${error.message}`);
    res.status(400).json({ error: error.message });
  }
};

exports.scheduleBroadcast = async (req, res) => {
  try {
    const { scheduledAt } = req.body;
    if (!scheduledAt) {
      return res.status(400).json({ error: 'scheduledAt is required' });
    }
    const broadcast = await broadcastService.scheduleBroadcast(req.params.id, scheduledAt);
    res.json({ broadcast });
  } catch (error) {
    logger.error(`Schedule broadcast error: ${error.message}`);
    res.status(400).json({ error: error.message });
  }
};

exports.cancelBroadcast = async (req, res) => {
  try {
    const broadcast = await broadcastService.cancelBroadcast(req.params.id);
    res.json({ broadcast });
  } catch (error) {
    logger.error(`Cancel broadcast error: ${error.message}`);
    res.status(400).json({ error: error.message });
  }
};

exports.sendBroadcastNow = async (req, res) => {
  try {
    const broadcast = await broadcastService.sendBroadcast(req.params.id);
    res.json({ broadcast, message: 'Broadcast sent' });
  } catch (error) {
    logger.error(`Send broadcast error: ${error.message}`);
    res.status(400).json({ error: error.message });
  }
};

exports.getBroadcastById = async (req, res) => {
  try {
    const broadcast = await Broadcast.findById(req.params.id)
      .populate('createdBy', 'username email');
    if (!broadcast) {
      return res.status(404).json({ error: 'Broadcast not found' });
    }
    res.json({ broadcast });
  } catch (error) {
    logger.error(`Get broadcast error: ${error.message}`);
    res.status(400).json({ error: error.message });
  }
};

exports.getBroadcasts = async (req, res) => {
  try {
    const { status, page, limit } = req.query;
    const result = await broadcastService.getBroadcasts({ status, page: Number(page) || 1, limit: Number(limit) || 20 });
    res.json(result);
  } catch (error) {
    logger.error(`Get broadcasts error: ${error.message}`);
    res.status(400).json({ error: error.message });
  }
};

exports.getOverallStats = async (req, res) => {
  try {
    const totalBroadcasts = await Broadcast.countDocuments();
    const sentBroadcasts = await Broadcast.countDocuments({ status: 'sent' });
    const draftBroadcasts = await Broadcast.countDocuments({ status: 'draft' });
    const scheduledBroadcasts = await Broadcast.countDocuments({ status: 'scheduled' });

    const statsAgg = await Broadcast.aggregate([
      {
        $group: {
          _id: null,
          totalDelivered: { $sum: '$deliveryStats.delivered' },
          totalFailed: { $sum: '$deliveryStats.failed' },
          totalOpened: { $sum: '$deliveryStats.opened' },
          totalClicked: { $sum: '$deliveryStats.clicked' }
        }
      }
    ]);

    const delivery = statsAgg[0] || { totalDelivered: 0, totalFailed: 0, totalOpened: 0, totalClicked: 0 };

    res.json({
      totalBroadcasts,
      sentBroadcasts,
      draftBroadcasts,
      scheduledBroadcasts,
      delivery
    });
  } catch (error) {
    logger.error(`Get broadcast stats error: ${error.message}`);
    res.status(400).json({ error: error.message });
  }
};

exports.getDeliveryDetails = async (req, res) => {
  try {
    const { status } = req.query;
    const details = await broadcastService.getDeliveryDetails(req.params.id, status);
    res.json(details);
  } catch (error) {
    logger.error(`Get delivery details error: ${error.message}`);
    res.status(400).json({ error: error.message });
  }
};

exports.previewBroadcast = async (req, res) => {
  try {
    const { title, message, imageUrl, ctaText, ctaUrl } = req.body;
    const templates = require('../utils/emailTemplates');
    const html = templates.renderBroadcast({ title, message, imageUrl, ctaText, ctaUrl });
    res.json({ html });
  } catch (error) {
    logger.error(`Preview broadcast error: ${error.message}`);
    res.status(400).json({ error: error.message });
  }
};
