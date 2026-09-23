const broadcastService = require('../services/broadcastService');
const Broadcast = require('../models/broadcastModel');
const logger = require('../utils/logger');

function sendError(res, error) {
  const status = error && error.cause === 404 ? 404 : 400;
  res.status(status).json({ error: error.message });
}

exports.createBroadcast = async (req, res) => {
  try {
    const { broadcast } = await broadcastService.createBroadcast({
      data: req.body,
      adminId: req.admin.adminId,
      reqIp: req.ip
    });
    res.status(201).json({ broadcast });
  } catch (error) {
    logger.error(`Create broadcast error: ${error.message}`);
    sendError(res, error);
  }
};

exports.updateBroadcast = async (req, res) => {
  try {
    const { broadcast } = await broadcastService.updateBroadcast({
      id: req.params.id,
      data: req.body,
      adminId: req.admin.adminId,
      reqIp: req.ip
    });
    res.json({ broadcast });
  } catch (error) {
    logger.error(`Update broadcast error: ${error.message}`);
    sendError(res, error);
  }
};

exports.deleteBroadcast = async (req, res) => {
  try {
    const result = await broadcastService.deleteBroadcast({
      id: req.params.id,
      adminId: req.admin.adminId,
      reqIp: req.ip
    });
    res.json(result);
  } catch (error) {
    logger.error(`Delete broadcast error: ${error.message}`);
    sendError(res, error);
  }
};

exports.scheduleBroadcast = async (req, res) => {
  try {
    const { scheduledAt } = req.body;
    if (!scheduledAt) {
      return res.status(400).json({ error: 'scheduledAt is required' });
    }
    const { broadcast } = await broadcastService.scheduleBroadcast({
      id: req.params.id,
      scheduledAt,
      adminId: req.admin.adminId,
      reqIp: req.ip
    });
    res.json({ broadcast });
  } catch (error) {
    logger.error(`Schedule broadcast error: ${error.message}`);
    sendError(res, error);
  }
};

exports.cancelBroadcast = async (req, res) => {
  try {
    const { broadcast } = await broadcastService.cancelBroadcast({
      id: req.params.id,
      adminId: req.admin.adminId,
      reqIp: req.ip
    });
    res.json({ broadcast });
  } catch (error) {
    logger.error(`Cancel broadcast error: ${error.message}`);
    sendError(res, error);
  }
};

exports.sendBroadcastNow = async (req, res) => {
  try {
    const { broadcast, queued, recipients } = await broadcastService.sendBroadcast({
      id: req.params.id,
      adminId: req.admin.adminId,
      reqIp: req.ip
    });
    res.json({ broadcast, queued: true, recipients, message: `Broadcast queued for ${recipients || 0} recipients` });
  } catch (error) {
    logger.error(`Send broadcast error: ${error.message}`);
    sendError(res, error);
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
    const { status, page, limit, q, sort } = req.query;
    const result = await broadcastService.getBroadcasts({
      status,
      q,
      sort,
      page: Number(page) || 1,
      limit: Math.min(Number(limit) || 20, 100)
    });
    res.json(result);
  } catch (error) {
    logger.error(`Get broadcasts error: ${error.message}`);
    res.status(400).json({ error: error.message });
  }
};

exports.getOverallStats = async (req, res) => {
  try {
    const stats = await broadcastService.getGlobalStats();
    res.json(stats);
  } catch (error) {
    logger.error(`Get broadcast stats error: ${error.message}`);
    res.status(400).json({ error: error.message });
  }
};

exports.getBroadcastStats = async (req, res) => {
  try {
    const stats = await broadcastService.getBroadcastStats(req.params.id);
    res.json(stats);
  } catch (error) {
    logger.error(`Get broadcast stats error: ${error.message}`);
    sendError(res, error);
  }
};

exports.getDeliveryDetails = async (req, res) => {
  try {
    const { status, page, limit } = req.query;
    const details = await broadcastService.getDeliveryDetails(req.params.id, {
      status,
      page: Number(page) || 1,
      limit: Math.min(Number(limit) || 20, 100)
    });
    res.json(details);
  } catch (error) {
    logger.error(`Get delivery details error: ${error.message}`);
    sendError(res, error);
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