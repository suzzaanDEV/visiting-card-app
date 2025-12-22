const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Card = require('../models/cardModel');
const SavedCard = require('../models/savedCardModel');
const logger = require('../utils/logger');
const { sendEmail } = require('../utils/emailService');
const { generateOtp, generateResetToken, hashValue } = require('../utils/tokenUtils');

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

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
        name: name || username, // Use provided name or fallback to username
        isEmailVerified: false
      });

      await user.save();

      // Send verification OTP (best-effort)
      try {
        await this.requestEmailOtp(email, { suppressErrors: true });
      } catch (otpError) {
        logger.warn(`Failed to send verification OTP during registration: ${otpError.message}`);
      }

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

  // ----------------------------
  // Email verification via OTP
  // ----------------------------
  async requestEmailOtp(email, options = {}) {
    const { suppressErrors = false } = options;
    try {
      if (!email) throw new Error('Email is required');
      const user = await User.findOne({ email });
      if (!user) {
        // Avoid user enumeration
        return { message: 'If that email exists, an OTP has been sent.' };
      }

      const { otp, hash } = generateOtp();
      user.emailVerificationOtpHash = hash;
      user.emailVerificationOtpExpires = Date.now() + 15 * 60 * 1000; // 15 minutes
      await user.save();

      await sendEmail({
        to: email,
        subject: 'Your Cardly email verification code',
        text: `Your verification code is ${otp}. It expires in 15 minutes.`,
        html: `<p>Your verification code is <strong>${otp}</strong>.</p><p>It expires in 15 minutes.</p>`
      });

      return { message: 'Verification code sent' };
    } catch (error) {
      logger.error(`Request email OTP error: ${error.message}`);
      if (suppressErrors) return { message: 'OTP send skipped' };
      throw error;
    }
  }

  async verifyEmailOtp(email, otp) {
    try {
      if (!email || !otp) throw new Error('Email and OTP are required');

      const user = await User.findOne({ email });
      if (!user) throw new Error('Invalid email or OTP');

      if (!user.emailVerificationOtpHash || !user.emailVerificationOtpExpires) {
        throw new Error('No OTP requested');
      }

      if (user.emailVerificationOtpExpires.getTime() < Date.now()) {
        throw new Error('OTP expired');
      }

      const incomingHash = hashValue(otp);
      if (incomingHash !== user.emailVerificationOtpHash) {
        throw new Error('Invalid OTP');
      }

      user.isEmailVerified = true;
      user.emailVerificationOtpHash = undefined;
      user.emailVerificationOtpExpires = undefined;
      await user.save();

      return { message: 'Email verified successfully' };
    } catch (error) {
      logger.error(`Verify email OTP error: ${error.message}`);
      throw error;
    }
  }

  // ----------------------------
  // Password reset
  // ----------------------------
  async forgotPassword(email) {
    try {
      if (!email) throw new Error('Email is required');
      const user = await User.findOne({ email });
      if (!user) {
        // Avoid user enumeration
        return { message: 'If that email exists, a reset link has been sent.' };
      }

      const { token, hash } = generateResetToken();
      user.passwordResetTokenHash = hash;
      user.passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1 hour
      await user.save();

      const resetUrl = `${FRONTEND_URL}/reset-password?token=${token}`;
      await sendEmail({
        to: email,
        subject: 'Reset your password',
        text: `Reset your password using this link (valid for 1 hour): ${resetUrl}`,
        html: `<p>Reset your password using this link (valid for 1 hour):</p><p><a href="${resetUrl}">${resetUrl}</a></p>`
      });

      return { message: 'Password reset link sent' };
    } catch (error) {
      logger.error(`Forgot password error: ${error.message}`);
      throw error;
    }
  }

  async resetPassword(token, newPassword) {
    try {
      if (!token || !newPassword) {
        throw new Error('Token and new password are required');
      }

      const hashedToken = hashValue(token);
      const user = await User.findOne({
        passwordResetTokenHash: hashedToken,
        passwordResetExpires: { $gt: Date.now() }
      });

      if (!user) {
        throw new Error('Invalid or expired reset token');
      }

      const hashedPassword = await bcrypt.hash(newPassword, 12);
      user.password = hashedPassword;
      user.passwordResetTokenHash = undefined;
      user.passwordResetExpires = undefined;
      await user.save();

      return { message: 'Password reset successfully' };
    } catch (error) {
      logger.error(`Reset password error: ${error.message}`);
      throw error;
    }
  }
}

module.exports = new AuthService();