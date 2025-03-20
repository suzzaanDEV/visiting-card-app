const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Card = require('../models/cardModel');
const SavedCard = require('../models/savedCardModel');
const logger = require('../utils/logger');

class AuthService {
  async register({ username, email, password, name }) {
    try {
      // Check if user already exists
      const existingUser = await User.findOne({ $or: [{ email }, { username }] });
      if (existingUser) {
        throw new Error('User already exists with this email or username');
      }

      // Hash password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create user
      const user = new User({
        username,
        email,
        password: hashedPassword,
        name: name || username // Use provided name or fallback to username
      });

      await user.save();

      // Generate JWT token
      const token = jwt.sign(
        { userId: user._id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
      );

      logger.info(`User registered: ${user._id}`);
      return {
        user: {
          userId: user._id,
          username: user.username,
          email: user.email,
          name: user.name
        },
        token
      };
    } catch (error) {
      logger.error(`Registration error: ${error.message}`);
      throw error;
    }
  }

  async login({ email, password }) {
    try {
      // Validate input
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      // Find user by email
      const user = await User.findOne({ email });
      if (!user) {
        logger.warn(`Login attempt with non-existent email: ${email}`);
        throw new Error('Invalid credentials');
      }

      // Check password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        logger.warn(`Login attempt with wrong password for email: ${email}`);
        throw new Error('Invalid credentials');
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user._id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
      );

      logger.info(`User logged in: ${user._id} (${email})`);
      return {
        user: {
          userId: user._id,
          username: user.username,
          email: user.email,
          name: user.name
        },
        token
      };
    } catch (error) {
      logger.error(`Login error: ${error.message}`);
      throw error;
    }
  }

  async logout(userId) {
    try {
      // In a real application, you might want to blacklist the token
      // For now, we'll just log the logout
      logger.info(`User logged out: ${userId}`);
      return true;
    } catch (error) {
      logger.error(`Logout error: ${error.message}`);
      throw error;
    }
  }

  async getUserProfile(userId) {
    try {
      const user = await User.findById(userId).select('-password');
      if (!user) {
        throw new Error('User not found');
      }
      return user;
    } catch (error) {
      logger.error(`Get user profile error: ${error.message}`);
      throw error;
    }
  }

  async updateUserProfile(userId, updateData) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Update allowed fields
      if (updateData.name) user.name = updateData.name;
      if (updateData.email) user.email = updateData.email;
      if (updateData.phone) user.phone = updateData.phone;
      if (updateData.location) user.location = updateData.location;
      if (updateData.website) user.website = updateData.website;
      if (updateData.bio) user.bio = updateData.bio;

      await user.save();
      logger.info(`User profile updated: ${userId}`);
      return user;
    } catch (error) {
      logger.error(`Update user profile error: ${error.message}`);
      throw error;
    }
  }

  async getUserStats(userId) {
    try {
      const totalCards = await Card.countDocuments({ ownerUserId: userId });
      const totalSaved = await SavedCard.countDocuments({ userId });
      const memberSince = await User.findById(userId).select('createdAt');

      return {
        totalCards,
        totalSaved,
        memberSince: memberSince?.createdAt || new Date()
      };
    } catch (error) {
      logger.error(`Get user stats error: ${error.message}`);
      throw error;
    }
  }

  async verifyToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password');
      if (!user) {
        throw new Error('User not found');
      }
      return user;
    } catch (error) {
      logger.error(`Token verification error: ${error.message}`);
      throw new Error('Invalid token');
    }
  }
}

module.exports = new AuthService();