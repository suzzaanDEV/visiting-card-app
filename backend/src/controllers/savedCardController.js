const savedCardService = require('../services/savedCardService');
const logger = require('../utils/logger');

exports.saveCard = async (req, res, next) => {
  try {
    const { cardId, notes, tags } = req.body;
    const userId = req.user.userId;

    if (!cardId) {
      return res.status(400).json({ error: 'Card ID is required' });
    }

    const result = await savedCardService.saveCard(userId, cardId, { notes, tags });
    res.status(201).json(result);
  } catch (error) {
    logger.error(`Save card error: ${error.message}`);
    res.status(400).json({ error: error.message });
  }
};

exports.getSavedCards = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 12 } = req.query;

    const result = await savedCardService.getSavedCards(userId, {
      page: parseInt(page),
      limit: parseInt(limit)
    });

    res.status(200).json(result);
  } catch (error) {
    logger.error(`Get saved cards error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

exports.getLibraryStats = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const stats = await savedCardService.getLibraryStats(userId);
    res.status(200).json(stats);
  } catch (error) {
    logger.error(`Get library stats error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

exports.removeFromLibrary = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const cardId = req.params.cardId;

    await savedCardService.removeFromLibrary(userId, cardId);
    res.status(200).json({ message: 'Card removed from library' });
  } catch (error) {
    logger.error(`Remove from library error: ${error.message}`);
    res.status(400).json({ error: error.message });
  }
};

exports.updateSavedCard = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const cardId = req.params.cardId;
    const { notes, tags } = req.body;

    const result = await savedCardService.updateSavedCard(userId, cardId, { notes, tags });
    res.status(200).json(result);
  } catch (error) {
    logger.error(`Update saved card error: ${error.message}`);
    res.status(400).json({ error: error.message });
  }
};

exports.isCardSaved = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const cardId = req.params.cardId;

    const isSaved = await savedCardService.isCardSaved(userId, cardId);
    res.status(200).json({ isSaved });
  } catch (error) {
    logger.error(`Check if card saved error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};