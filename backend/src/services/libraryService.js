const SavedCard = require('../models/savedCardModel');
const Card = require('../models/cardModel');
const logger = require('../utils/logger');

class LibraryService {
  async saveCard(userId, cardId) {
    try {
      const existing = await SavedCard.findOne({ userId, cardId });
      if (existing) {
        throw new Error('Card already saved');
      }

      const card = await Card.findById(cardId);
      if (!card) {
        throw new Error('Card not found');
      }

      const savedCard = new SavedCard({
        userId,
        cardId,
        savedAt: new Date()
      });

      await savedCard.save();
      logger.info(`Card ${cardId} saved to library by user ${userId}`);
      return savedCard;
    } catch (error) {
      logger.error(`Save card error: ${error.message}`);
      throw error;
    }
  }

  async removeFromLibrary(userId, cardId) {
    try {
      const result = await SavedCard.findOneAndDelete({ userId, cardId });
      if (!result) {
        throw new Error('Card not found in library');
      }

      logger.info(`Card ${cardId} removed from library by user ${userId}`);
      return result;
    } catch (error) {
      logger.error(`Remove card error: ${error.message}`);
      throw error;
    }
  }

  async getUserLibrary(userId, page = 1, limit = 20) {
    try {
      const skip = (page - 1) * limit;
      
      const savedCards = await SavedCard.find({ userId })
        .populate({
          path: 'cardId',
          populate: {
            path: 'ownerUserId',
            select: 'name email'
          }
        })
        .sort({ savedAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await SavedCard.countDocuments({ userId });

      return {
        savedCards,
        total,
        hasMore: skip + savedCards.length < total,
        currentPage: page,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      logger.error(`Get user library error: ${error.message}`);
      throw error;
    }
  }

  async isCardSaved(userId, cardId) {
    try {
      const savedCard = await SavedCard.findOne({ userId, cardId });
      return !!savedCard;
    } catch (error) {
      logger.error(`Check saved card error: ${error.message}`);
      return false;
    }
  }

  async getLibraryStats(userId) {
    try {
      const totalSaved = await SavedCard.countDocuments({ userId });
      const recentSaved = await SavedCard.countDocuments({
        userId,
        savedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      });

      return {
        totalSaved,
        recentSaved
      };
    } catch (error) {
      logger.error(`Library stats error: ${error.message}`);
      throw error;
    }
  }
}

module.exports = new LibraryService(); 