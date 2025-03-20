const User = require('../models/userModel');
const Card = require('../models/cardModel');
const SavedCard = require('../models/savedCardModel');
const logger = require('../utils/logger');

class UserService {
  async getAllUsers({ page = 1, limit = 20, search, sortBy = 'createdAt', sortOrder = 'desc' }) {
    try {
      const skip = (page - 1) * limit;
      const query = {};

      if (search) {
        query.$or = [
          { username: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { name: { $regex: search, $options: 'i' } }
        ];
      }

      const sortOptions = {};
      sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

      const users = await User.find(query)
        .select('-password')
        .sort(sortOptions)
        .skip(skip)
        .limit(limit);

      const total = await User.countDocuments(query);

      return {
        users,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error(`Get all users error: ${error.message}`);
      throw error;
    }
  }

  async getUserById(userId) {
    try {
      const user = await User.findById(userId).select('-password');
      if (!user) {
        throw new Error('User not found');
      }
      return user;
    } catch (error) {
      logger.error(`Get user by ID error: ${error.message}`);
      throw error;
    }
  }

  async updateUser(userId, updateData) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Update allowed fields
      const allowedFields = ['username', 'email', 'name', 'phone', 'location', 'website', 'bio', 'isActive'];
      allowedFields.forEach(field => {
        if (updateData[field] !== undefined) {
          user[field] = updateData[field];
        }
      });

      await user.save();
      logger.info(`User updated: ${userId}`);
      return user;
    } catch (error) {
      logger.error(`Update user error: ${error.message}`);
      throw error;
    }
  }

  async deleteUser(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Soft delete user
      user.isActive = false;
      await user.save();

      // Soft delete user's cards
      await Card.updateMany(
        { ownerUserId: userId },
        { isActive: false }
      );

      // Delete user's saved cards
      await SavedCard.deleteMany({ userId });

      logger.info(`User deleted: ${userId}`);
      return { message: 'User deleted successfully' };
    } catch (error) {
      logger.error(`Delete user error: ${error.message}`);
      throw error;
    }
  }

  async toggleUserBan(userId, { banned, reason }) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      user.isActive = !banned;
      user.banReason = banned ? reason : null;
      user.bannedAt = banned ? new Date() : null;

      await user.save();
      logger.info(`User ${banned ? 'banned' : 'unbanned'}: ${userId}`);
      return user;
    } catch (error) {
      logger.error(`Toggle user ban error: ${error.message}`);
      throw error;
    }
  }

  async getUserAnalytics(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Get user's cards
      const userCards = await Card.find({ ownerUserId: userId, isActive: true });
      const totalCards = userCards.length;
      const publicCards = userCards.filter(card => card.isPublic).length;

      // Calculate total engagement
      const totalViews = userCards.reduce((sum, card) => sum + card.views, 0);
      const totalLoves = userCards.reduce((sum, card) => sum + card.loveCount, 0);
      const totalShares = userCards.reduce((sum, card) => sum + card.shares, 0);
      const totalDownloads = userCards.reduce((sum, card) => sum + card.downloads, 0);

      // Get saved cards count
      const savedCardsCount = await SavedCard.countDocuments({ userId });

      // Get recent activity (last 30 days)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const recentCards = await Card.countDocuments({
        ownerUserId: userId,
        createdAt: { $gte: thirtyDaysAgo }
      });

      return {
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          name: user.name,
          createdAt: user.createdAt,
          lastLoginAt: user.lastLoginAt
        },
        cards: {
          total: totalCards,
          public: publicCards,
          private: totalCards - publicCards,
          recent: recentCards
        },
        engagement: {
          totalViews,
          totalLoves,
          totalShares,
          totalDownloads
        },
        savedCards: savedCardsCount
      };
    } catch (error) {
      logger.error(`Get user analytics error: ${error.message}`);
      throw error;
    }
  }

  async getPopularUsers(limit = 10) {
    try {
      const popularUsers = await Card.aggregate([
        {
          $match: { isActive: true }
        },
        {
          $group: {
            _id: '$ownerUserId',
            totalCards: { $sum: 1 },
            totalViews: { $sum: '$views' },
            totalLoves: { $sum: '$loveCount' },
            totalShares: { $sum: '$shares' },
            totalDownloads: { $sum: '$downloads' }
          }
        },
        {
          $sort: { totalViews: -1, totalLoves: -1 }
        },
        {
          $limit: limit
        },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'user'
          }
        },
        {
          $unwind: '$user'
        },
        {
          $project: {
            userId: '$_id',
            username: '$user.username',
            name: '$user.name',
            email: '$user.email',
            totalCards: 1,
            totalViews: 1,
            totalLoves: 1,
            totalShares: 1,
            totalDownloads: 1
          }
        }
      ]);

      return popularUsers;
    } catch (error) {
      logger.error(`Get popular users error: ${error.message}`);
      throw error;
    }
  }
}

module.exports = new UserService(); 