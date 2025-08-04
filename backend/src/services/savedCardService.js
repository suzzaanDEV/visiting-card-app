const SavedCard = require('../models/savedCardModel');
const Card = require('../models/cardModel');
const cardAccessService = require('./cardAccessService');
const logger = require('../utils/logger');

class SavedCardService {
  // Save a card to user's library
  async saveCard(userId, cardId, { notes, tags } = {}) {
    try {
      // Check if card exists
      const card = await Card.findById(cardId);
      if (!card) {
        throw new Error('Card not found');
      }

      // Check if already saved
      const existingSave = await SavedCard.findOne({ userId, cardId });
      if (existingSave) {
        throw new Error('Card is already saved');
      }

      // Create saved card entry
      const savedCard = new SavedCard({
        userId,
        cardId,
        notes,
        tags: tags || []
      });

      await savedCard.save();
      
      logger.info(`Card ${cardId} saved to user ${userId}'s library`);
      return { message: 'Card saved to library', savedCard };
    } catch (error) {
      logger.error(`Save card error: ${error.message}`);
      throw error;
    }
  }

  // Remove card from user's library
  async removeFromLibrary(userId, cardId) {
    try {
      const result = await SavedCard.findOneAndDelete({ userId, cardId });
      if (!result) {
        throw new Error('Card not found in library');
      }
      
      logger.info(`Card ${cardId} removed from user ${userId}'s library`);
      return { message: 'Card removed from library' };
    } catch (error) {
      logger.error(`Remove from library error: ${error.message}`);
      throw error;
    }
  }

  // Get user's saved cards with pagination
  async getSavedCards(userId, { page = 1, limit = 12 } = {}) {
    try {
      const skip = (page - 1) * limit;
      
      const savedCards = await SavedCard.find({ userId })
        .populate({
          path: 'cardId',
          select: 'title shortLink qrCode loveCount views shares downloads createdAt ownerUserId templateId privacy fullName jobTitle company email phone website address bio',
          populate: {
            path: 'ownerUserId',
            select: 'username name'
          }
        })
        .sort({ savedAt: -1 })
        .skip(skip)
        .limit(limit);

      // Check access permissions for each saved card
      const cardsWithAccess = await Promise.all(
        savedCards.map(async (savedCard) => {
          const card = savedCard.cardId;
          if (!card) return savedCard;

          // Check if user has access to private cards
          let hasApprovedAccess = false;
          if (card.privacy === 'private') {
            const accessCheck = await cardAccessService.checkAccess(card._id, userId);
            hasApprovedAccess = accessCheck.access && (accessCheck.reason === 'approved_request' || accessCheck.reason === 'owner');
          }

          // Add access information to the card
          const cardWithAccess = card.toObject ? card.toObject() : card;
          cardWithAccess.hasApprovedAccess = hasApprovedAccess;
          cardWithAccess.fullContactInfo = card.privacy === 'public' || hasApprovedAccess;

          // Filter sensitive data if no access
          if (card.privacy === 'private' && !hasApprovedAccess) {
            if (cardWithAccess.email) {
              const [localPart, domain] = cardWithAccess.email.split('@');
              if (localPart && domain) {
                const maskedLocal = localPart.charAt(0) + '*'.repeat(localPart.length - 2) + localPart.charAt(localPart.length - 1);
                cardWithAccess.email = `${maskedLocal}@${domain}`;
              }
            }

            if (cardWithAccess.phone) {
              const cleaned = cardWithAccess.phone.replace(/\D/g, '');
              if (cleaned.length >= 4) {
                cardWithAccess.phone = `***-***-${cleaned.slice(-4)}`;
              } else {
                cardWithAccess.phone = '***-***-****';
              }
            }

            if (cardWithAccess.address) {
              cardWithAccess.address = 'Address hidden for privacy';
            }

            if (cardWithAccess.website) {
              cardWithAccess.website = 'Website hidden for privacy';
            }
          }

          return {
            ...savedCard.toObject(),
            cardId: cardWithAccess
          };
        })
      );

      const total = await SavedCard.countDocuments({ userId });
      const totalPages = Math.ceil(total / limit);

      return {
        savedCards: cardsWithAccess,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: total,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      };
    } catch (error) {
      logger.error(`Get saved cards error: ${error.message}`);
      throw error;
    }
  }

  // Get library statistics
  async getLibraryStats(userId) {
    try {
      const totalSaved = await SavedCard.countDocuments({ userId });
      const recentSaves = await SavedCard.countDocuments({
        userId,
        savedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
      });

      // Get most saved categories
      const categoryStats = await SavedCard.aggregate([
        { $match: { userId: userId } },
        {
          $lookup: {
            from: 'cards',
            localField: 'cardId',
            foreignField: '_id',
            as: 'card'
          }
        },
        { $unwind: '$card' },
        {
          $group: {
            _id: '$card.templateId',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ]);

      return {
        totalSaved,
        recentSaves,
        categoryStats
      };
    } catch (error) {
      logger.error(`Get library stats error: ${error.message}`);
      throw error;
    }
  }

  // Check if user has saved a specific card
  async isCardSaved(userId, cardId) {
    try {
      const savedCard = await SavedCard.findOne({ userId, cardId });
      return !!savedCard;
    } catch (error) {
      logger.error(`Check if card saved error: ${error.message}`);
      throw error;
    }
  }

  // Update saved card notes and tags
  async updateSavedCard(userId, cardId, { notes, tags }) {
    try {
      const savedCard = await SavedCard.findOneAndUpdate(
        { userId, cardId },
        { notes, tags },
        { new: true }
      );

      if (!savedCard) {
        throw new Error('Saved card not found');
      }

      return savedCard;
    } catch (error) {
      logger.error(`Update saved card error: ${error.message}`);
      throw error;
    }
  }

  // Get popular saved cards (cards saved by many users)
  async getPopularSavedCards(limit = 10) {
    try {
      const popularCards = await SavedCard.aggregate([
        {
          $group: {
            _id: '$cardId',
            saveCount: { $sum: 1 }
          }
        },
        {
          $sort: { saveCount: -1 }
        },
        {
          $limit: limit
        },
        {
          $lookup: {
            from: 'cards',
            localField: '_id',
            foreignField: '_id',
            as: 'card'
          }
        },
        {
          $unwind: '$card'
        },
        {
          $project: {
            cardId: '$_id',
            saveCount: 1,
            title: '$card.title',
            shortLink: '$card.shortLink',
            loveCount: '$card.loveCount',
            views: '$card.views'
          }
        }
      ]);

      return popularCards;
    } catch (error) {
      logger.error(`Get popular saved cards error: ${error.message}`);
      throw error;
    }
  }
}

module.exports = new SavedCardService(); 