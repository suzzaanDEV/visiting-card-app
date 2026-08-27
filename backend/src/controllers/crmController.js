const crmService = require('../services/crmService');

exports.getAllMessages = async (req, res) => {
  try {
    const result = await crmService.getAll(req.query);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMessageById = async (req, res) => {
  try {
    const message = await crmService.getById(req.params.id);
    if (!message) return res.status(404).json({ error: 'Message not found' });
    if (message.status === 'unread') await crmService.markAsRead(req.params.id);
    res.json(message);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.replyToMessage = async (req, res) => {
  try {
    const { replyMessage } = req.body;
    if (!replyMessage) return res.status(400).json({ error: 'Reply message is required' });
    const message = await crmService.markAsReplied(req.params.id, req.admin._id, replyMessage);
    if (!message) return res.status(404).json({ error: 'Message not found' });
    res.json(message);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.archiveMessage = async (req, res) => {
  try {
    const message = await crmService.archive(req.params.id);
    if (!message) return res.status(404).json({ error: 'Message not found' });
    res.json(message);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.markAsSpam = async (req, res) => {
  try {
    const message = await crmService.markAsSpam(req.params.id);
    if (!message) return res.status(404).json({ error: 'Message not found' });
    res.json(message);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteMessage = async (req, res) => {
  try {
    const message = await crmService.delete(req.params.id);
    if (!message) return res.status(404).json({ error: 'Message not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getStats = async (req, res) => {
  try {
    const stats = await crmService.getStats();
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.bulkUpdate = async (req, res) => {
  try {
    const { ids, updateData } = req.body;
    if (!ids || !Array.isArray(ids) || !updateData) return res.status(400).json({ error: 'ids array and updateData required' });
    const result = await crmService.bulkUpdate(ids, updateData);
    res.json({ modified: result.modifiedCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.bulkDelete = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids)) return res.status(400).json({ error: 'ids array required' });
    const result = await crmService.bulkDelete(ids);
    res.json({ deleted: result.deletedCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
