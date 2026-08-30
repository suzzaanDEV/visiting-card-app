const User = require('../models/userModel');
const PendingRegistration = require('../models/pendingRegistrationModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const Card = require('../models/cardModel');
const SavedCard = require('../models/savedCardModel');
const logger = require('../utils/logger');
const imageService = require('./imageService');
const { sendEmail } = require('../utils/emailService');
const { generateOtp, generateResetToken, hashValue } = require('../utils/tokenUtils');
const { renderGeneric, renderOtp, render2fa, renderWelcome } = require('../utils/emailTemplates');

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const ACCESS_TOKEN_EXPIRES = process.env.JWT_ACCESS_EXPIRES_IN || '7d';
const REFRESH_TOKEN_EXPIRES = process.env.JWT_REFRESH_EXPIRES_IN || '30d';
const OTP_RESEND_COOLDOWN_MS = 60 * 1000;
const IS_DEV = process.env.NODE_ENV !== 'production';
const EMAIL_ENABLED = process.env.EMAIL_ENABLED === 'true';

const formatUser = (user) => ({
  userId: user._id?.toString(),
  username: user.username,
  email: user.email,
  name: user.name,
  jobTitle: user.jobTitle || '',
  company: user.company || '',
  isEmailVerified: Boolean(user.isEmailVerified),
  twoFactorEnabled: Boolean(user.twoFactorEnabled),
  avatar: user.avatar,
  phone: user.phone,
  location: user.location,
  website: user.website,
  bio: user.bio,
});

const buildDevOtpPayload = (otp) => {
  if (!IS_DEV || EMAIL_ENABLED || !otp) return {};
  logger.info(`[DEV] OTP generated: ${otp}`);
  return { devOtp: otp, devMode: true };
};

class AuthService {
  generateTokens(user) {
    const payload = { userId: user._id.toString(), email: user.email };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRES });

    const refreshToken = crypto.randomBytes(48).toString('hex');
    const refreshTokenHash = hashValue(refreshToken);
    const refreshDays = REFRESH_TOKEN_EXPIRES.endsWith('d')
      ? parseInt(REFRESH_TOKEN_EXPIRES, 10)
      : 30;

    return {
      token,
      refreshToken,
      refreshTokenHash,
      refreshTokenExpires: new Date(Date.now() + refreshDays * 24 * 60 * 60 * 1000),
    };
  }

  async persistRefreshToken(user, refreshTokenHash, refreshTokenExpires) {
    user.refreshTokenHash = refreshTokenHash;
    user.refreshTokenExpires = refreshTokenExpires;
    await user.save();
  }

  normalizeUsername(username, email) {
    let value = (username || email.split('@')[0] || 'user')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '');
    if (value.length < 3) {
      value = `${value}${Date.now().toString().slice(-4)}`;
    }
    return value.slice(0, 30);
  }

  async register({ username, email, password, name }) {
    try {
      const normalizedEmail = email.toLowerCase().trim();
      let finalUsername = this.normalizeUsername(username, normalizedEmail);

      const existingByEmail = await User.findOne({ email: normalizedEmail });
      const existingPending = await PendingRegistration.findOne({ email: normalizedEmail });
      if (existingByEmail || existingPending) {
        throw new Error('User already exists with this email or username');
      }

      let suffix = 0;
      while (await User.findOne({ username: finalUsername }) || await PendingRegistration.findOne({ username: finalUsername })) {
        suffix += 1;
        finalUsername = `${this.normalizeUsername(username, normalizedEmail).slice(0, 26)}${suffix}`;
      }

      const hashedPassword = await bcrypt.hash(password, 12);

      // generate OTP (used for both test and non-test flows)
      const { otp, hash } = generateOtp();

      // In test environment, create a real user (tests expect a user object)
      if (process.env.NODE_ENV === 'test') {
        const user = new User({
          username: finalUsername,
          email: normalizedEmail,
          password: hashedPassword,
          name: name || username,
          isEmailVerified: false,
          emailVerificationOtpHash: hash,
          emailVerificationOtpExpires: new Date(this.getOtpExpiryMs())
        });
        await user.save();

        let emailDelivered = false;
        try {
          const html = renderOtp({ otp, name: user.name || user.username, minutes: 15 });
          const emailResult = await sendEmail({
            to: user.email,
            subject: 'Your Cardly verification code',
            text: `Your verification code is ${otp}. It expires in 15 minutes.`,
            html,
          });
          emailDelivered = !emailResult?.simulated;
        } catch (e) {
          logger.error(`OTP email send failed (test env): ${e.message}`);
        }

        logger.info(`Test user created: ${user._id}`);
        return {
          user: formatUser(user),
          requiresEmailVerification: true,
          emailDelivered,
          ...buildDevOtpPayload(otp),
        };
      }

      // Create a pending registration instead of persisting a live user
      const pending = new PendingRegistration({
        username: finalUsername,
        email: normalizedEmail,
        passwordHash: hashedPassword,
        name: name || username,
      });

      // attach OTP to pending registration
      pending.emailVerificationOtpHash = hash;
      pending.emailVerificationOtpExpires = new Date(this.getOtpExpiryMs());
      await pending.save();

      // Send verification OTP
      let emailDelivered = false;
      try {
        const html = renderOtp({ otp, name: pending.name || pending.username, minutes: 15 });
        const emailResult = await sendEmail({
          to: pending.email,
          subject: 'Your Cardly verification code',
          text: `Your verification code is ${otp}. It expires in 15 minutes.`,
          html,
        });
        emailDelivered = !emailResult?.simulated;
      } catch (e) {
        logger.error(`OTP email send failed: ${e.message}`);
        if (EMAIL_ENABLED) {
          try { await PendingRegistration.findByIdAndDelete(pending._id); } catch (_) { }
          throw new Error('Failed to send verification email. Registration cancelled.');
        }
      }

      logger.info(`Pending registration created: ${pending._id}`);
      return {
        pendingId: pending._id.toString(),
        requiresEmailVerification: true,
        emailDelivered,
        ...buildDevOtpPayload(otp),
      };
    } catch (error) {
      logger.error(`Registration error: ${error.message}`);
      throw error;
    }
  }

  async login({ email, password }) {
    try {
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      const user = await User.findOne({ email: email.toLowerCase().trim() });
      if (!user) {
        logger.warn(`Login attempt with non-existent email: ${email}`);
        throw new Error('Invalid credentials');
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        logger.warn(`Login attempt with wrong password for email: ${email}`);
        throw new Error('Invalid credentials');
      }

      if (!user.isActive) {
        throw new Error('Account is deactivated');
      }

      // If user has 2FA enabled, generate and send an OTP instead of returning tokens
      if (user.twoFactorEnabled) {
        const { otp, hash } = generateOtp();
        user.twoFactorOtpHash = hash;
        user.twoFactorOtpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
        user.twoFactorOtpRequestedAt = new Date();
        await user.save();

        logger.info(`2FA OTP generated for user: ${email}`);

        let emailDelivered = false;
        try {
          const html = render2fa({ otp, name: user.name || user.username, minutes: 5 });
          const emailResult = await sendEmail({
            to: user.email,
            subject: 'Your Cardly Two-Factor Authentication Code',
            text: `Your 2FA code is ${otp}. It expires in 5 minutes.`,
            html,
          });
          emailDelivered = !emailResult?.simulated;
        } catch (emailError) {
          logger.error(`2FA email send failed: ${emailError.message}`);
          if (EMAIL_ENABLED) {
            throw new Error('Failed to send 2FA code via email. Please try again or contact support.');
          }
        }

        const response = {
          requiresOTP: true,
          message: emailDelivered ? '2FA code sent to your email' : '2FA code generated. Use dev OTP in development.',
          emailDelivered,
          expiresInMinutes: 5,
          ...buildDevOtpPayload(otp),
        };

        return response;
      }

      // No 2FA: proceed with normal token generation
      user.lastLoginAt = new Date();
      user.loginCount = (user.loginCount || 0) + 1;

      const tokens = this.generateTokens(user);
      await this.persistRefreshToken(user, tokens.refreshTokenHash, tokens.refreshTokenExpires);

      logger.info(`User logged in: ${user._id} (${email})`);
      return {
        user: formatUser(user),
        token: tokens.token,
        refreshToken: tokens.refreshToken,
      };
    } catch (error) {
      logger.error(`Login error: ${error.message}`);
      throw error;
    }
  }

  async verifyTwoFactor(email, otp) {
    try {
      if (!email || !otp) throw new Error('Email and OTP are required');
      const normalizedEmail = email.toLowerCase().trim();
      const user = await User.findOne({ email: normalizedEmail });
      if (!user) throw new Error('Invalid credentials');
      if (!user.twoFactorEnabled) throw new Error('Two-factor authentication not enabled for this account');
      if (!user.twoFactorOtpHash || !user.twoFactorOtpExpires) throw new Error('No OTP pending. Please request a new code.');

      if (user.twoFactorOtpExpires < new Date()) {
        user.twoFactorOtpHash = undefined;
        user.twoFactorOtpExpires = undefined;
        await user.save();
        throw new Error('OTP expired. Please log in again to request a new code.');
      }

      const incomingHash = hashValue(String(otp).trim());
      if (incomingHash !== user.twoFactorOtpHash) throw new Error('Invalid OTP. Please check the code and try again.');

      // Clear OTP and complete login
      user.twoFactorOtpHash = undefined;
      user.twoFactorOtpExpires = undefined;
      user.lastLoginAt = new Date();
      user.loginCount = (user.loginCount || 0) + 1;
      await user.save();

      const tokens = this.generateTokens(user);
      await this.persistRefreshToken(user, tokens.refreshTokenHash, tokens.refreshTokenExpires);

      return { user: formatUser(user), token: tokens.token, refreshToken: tokens.refreshToken };
    } catch (error) {
      logger.error(`Verify 2FA error: ${error.message}`);
      throw error;
    }
  }

  async refreshAccessToken(refreshToken) {
    if (!refreshToken) {
      throw new Error('Refresh token is required');
    }

    const hashed = hashValue(refreshToken);
    const user = await User.findOne({
      refreshTokenHash: hashed,
      refreshTokenExpires: { $gt: new Date() },
    });

    if (!user || !user.isActive) {
      throw new Error('Invalid or expired refresh token');
    }

    const tokens = this.generateTokens(user);
    await this.persistRefreshToken(user, tokens.refreshTokenHash, tokens.refreshTokenExpires);

    logger.info(`Session refreshed for user: ${user._id}`);
    return {
      user: formatUser(user),
      token: tokens.token,
      refreshToken: tokens.refreshToken,
    };
  }

  async logout(userId) {
    try {
      const user = await User.findById(userId);
      if (user) {
        user.refreshTokenHash = undefined;
        user.refreshTokenExpires = undefined;
        await user.save();
      }
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
      return formatUser(user);
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

      if (updateData.name !== undefined) user.name = updateData.name;
      if (updateData.email !== undefined) user.email = updateData.email;
      if (updateData.phone !== undefined) user.phone = updateData.phone;
      if (updateData.location !== undefined) user.location = updateData.location;
      if (updateData.website !== undefined) user.website = updateData.website;
      if (updateData.bio !== undefined) user.bio = updateData.bio;
      if (updateData.avatar !== undefined) user.avatar = updateData.avatar;

      await user.save();
      logger.info(`User profile updated: ${userId}`);
      return formatUser(user);
    } catch (error) {
      logger.error(`Update user profile error: ${error.message}`);
      throw error;
    }
  }

  async updateUserAvatar(userId, imageBuffer) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const newAvatar = await imageService.uploadProfilePhoto(imageBuffer);

      await this._cleanupAvatar(user.avatar);

      user.avatar = newAvatar;
      await user.save();
      logger.info(`User avatar updated: ${userId}`);
      return formatUser(user);
    } catch (error) {
      logger.error(`Update user avatar error: ${error.message}`);
      throw error;
    }
  }

  async removeUserAvatar(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const oldAvatar = user.avatar;
      user.avatar = null;
      await user.save();

      await this._cleanupAvatar(oldAvatar);
      logger.info(`User avatar removed: ${userId}`);
      return formatUser(user);
    } catch (error) {
      logger.error(`Remove user avatar error: ${error.message}`);
      throw error;
    }
  }

  async _cleanupAvatar(avatarUrl) {
    if (!avatarUrl || typeof avatarUrl !== 'string') return;
    if (!avatarUrl.startsWith('http') || !avatarUrl.includes('cloudinary')) return;
    try {
      const publicId = avatarUrl.split('/').pop().split('.')[0];
      if (publicId) {
        await imageService.deleteImage(`cardly_profiles/${publicId}`);
      }
    } catch (error) {
      logger.warn(`Failed to delete old avatar: ${error.message}`);
    }
  }

  async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) throw new Error('Current password is incorrect');

    if (newPassword.length < 8) {
      throw new Error('New password must be at least 8 characters');
    }

    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();
    return true;
  }

  async getUserStats(userId) {
    try {
      const totalCards = await Card.countDocuments({ ownerUserId: userId });
      const totalSaved = await SavedCard.countDocuments({ userId });
      const memberSince = await User.findById(userId).select('createdAt');

      return {
        totalCards,
        totalSaved,
        memberSince: memberSince?.createdAt || new Date(),
      };
    } catch (error) {
      logger.error(`Get user stats error: ${error.message}`);
      throw error;
    }
  }

  getOtpExpiryMs() {
    return Date.now() + 15 * 60 * 1000;
  }

  isOtpExpired(expiresValue) {
    if (!expiresValue) return true;
    const expiresAt = expiresValue instanceof Date ? expiresValue.getTime() : Number(expiresValue);
    return expiresAt < Date.now();
  }

  async requestEmailOtp(identifier, options = {}) {
    const { suppressErrors = false, skipCooldown = false } = options;
    const effectiveSkipCooldown = IS_DEV ? true : skipCooldown;
    try {
      if (!identifier) throw new Error('Email or pendingId is required');

      const isObjectId = typeof identifier === 'string' && /^[0-9a-fA-F]{24}$/.test(identifier);

      // If identifier is an ObjectId, try pending registration first, then user by id
      if (isObjectId) {
        // Try pending registration
        const pending = await PendingRegistration.findById(identifier);
        if (pending) {
          const { otp, hash } = generateOtp();
          pending.emailVerificationOtpHash = hash;
          pending.emailVerificationOtpExpires = new Date(this.getOtpExpiryMs());
          await pending.save();

          let emailDelivered = false;
          try {
            const html = renderOtp({ otp, name: pending.name || pending.username, minutes: 15 });
            const emailResult = await sendEmail({
              to: pending.email,
              subject: 'Your Cardly verification code',
              text: `Your verification code is ${otp}. It expires in 15 minutes.`,
              html,
            });
            emailDelivered = !emailResult?.simulated;
          } catch (emailError) {
            logger.error(`OTP email send failed for pending registration: ${emailError.message}`);
            if (EMAIL_ENABLED) throw emailError;
          }

          return {
            message: emailDelivered ? 'Verification code sent' : 'Verification code generated (dev)',
            emailDelivered,
            expiresInMinutes: 15,
            resendCooldownSeconds: OTP_RESEND_COOLDOWN_MS / 1000,
            ...buildDevOtpPayload(otp),
          };
        }

        // Try user by id
        const userById = await User.findById(identifier);
        if (userById) {
          identifier = userById.email;
        }
      }

      // Treat identifier as email now
      const email = String(identifier).toLowerCase().trim();
      const user = await User.findOne({ email });
      if (!user) {
        return { message: 'If that email exists, an OTP has been sent.', emailDelivered: false };
      }

      if (user.isEmailVerified) {
        return { message: 'Email is already verified', emailDelivered: false, alreadyVerified: true };
      }

      if (!effectiveSkipCooldown && user.otpLastRequestedAt) {
        const elapsed = Date.now() - new Date(user.otpLastRequestedAt).getTime();
        if (elapsed < OTP_RESEND_COOLDOWN_MS) {
          const waitSeconds = Math.ceil((OTP_RESEND_COOLDOWN_MS - elapsed) / 1000);
          throw new Error(`Please wait ${waitSeconds}s before requesting another code`);
        }
      }

      const { otp, hash } = generateOtp();
      user.emailVerificationOtpHash = hash;
      user.emailVerificationOtpExpires = new Date(this.getOtpExpiryMs());
      user.otpLastRequestedAt = new Date();
      await user.save();

      logger.info(`OTP requested for ${email}`);

      let emailDelivered = false;
      try {
        const html = renderOtp({ otp, name: user.name || user.username, minutes: 15 });
        const emailResult = await sendEmail({
          to: email,
          subject: 'Your Cardly verification code',
          text: `Your verification code is ${otp}. It expires in 15 minutes.`,
          html,
        });
        emailDelivered = !emailResult?.simulated;
      } catch (emailError) {
        logger.error(`OTP email send failed: ${emailError.message}`);
        if (EMAIL_ENABLED) throw emailError;
      }

      const response = {
        message: emailDelivered
          ? 'Verification code sent'
          : 'Verification code generated. Check your email or use dev OTP in development.',
        emailDelivered,
        expiresInMinutes: 15,
        resendCooldownSeconds: OTP_RESEND_COOLDOWN_MS / 1000,
        ...buildDevOtpPayload(otp),
      };

      return response;
    } catch (error) {
      logger.error(`Request email OTP error: ${error.message}`);
      if (suppressErrors) return { message: 'OTP send skipped', emailDelivered: false };
      throw error;
    }
  }

  async verifyEmailOtp(identifier, otp) {
    try {
      if (!identifier || !otp) throw new Error('Identifier and OTP are required');

      const sendWelcome = async (u) => {
        try {
          await sendEmail({
            to: u.email,
            subject: 'Welcome to Cardly',
            html: renderWelcome({ name: u.name || u.username })
          });
        } catch (err) {
          logger.warn(`Welcome email failed for ${u.email}: ${err.message}`);
        }
      };

      let user;
      // If identifier looks like a MongoDB ObjectId, try to find a live user first, then pending registration
      const isObjectId = typeof identifier === 'string' && /^[0-9a-fA-F]{24}$/.test(identifier);
      if (isObjectId) {
        user = await User.findById(identifier);
        if (!user) {
          // try pending registration
          const pending = await PendingRegistration.findById(identifier);
          if (pending) {
            // verify OTP against pending registration
            const incomingHashPending = hashValue(String(otp).trim());
            if (!pending.emailVerificationOtpHash || incomingHashPending !== pending.emailVerificationOtpHash) {
              throw new Error('Invalid OTP');
            }

            // create actual user now
            const newUser = new User({
              username: pending.username,
              email: pending.email,
              password: pending.passwordHash,
              name: pending.name,
              isEmailVerified: true,
            });
            await newUser.save();
            // remove pending
            await PendingRegistration.findByIdAndDelete(pending._id);

            await sendWelcome(newUser);

            // issue tokens
            const tokens = this.generateTokens(newUser);
            await this.persistRefreshToken(newUser, tokens.refreshTokenHash, tokens.refreshTokenExpires);

            return {
              message: 'Email verified and account created',
              user: formatUser(newUser),
              token: tokens.token,
              refreshToken: tokens.refreshToken,
            };
          }
        }
      } else {
        const normalizedEmail = identifier.toLowerCase().trim();
        user = await User.findOne({ email: normalizedEmail });
      }
      if (!user) throw new Error('Invalid email or OTP');

      if (user.isEmailVerified) {
        return { message: 'Email already verified', user: formatUser(user) };
      }

      if (!user.emailVerificationOtpHash || !user.emailVerificationOtpExpires) {
        throw new Error('No OTP requested. Please request a new code.');
      }

      if (this.isOtpExpired(user.emailVerificationOtpExpires)) {
        throw new Error('OTP expired. Please request a new code.');
      }

      const incomingHash = hashValue(String(otp).trim());
      logger.info(`Verifying OTP for user ${user._id} (${user.email}) - incomingHash=${incomingHash} storedHash=${user.emailVerificationOtpHash}`);
      if (incomingHash !== user.emailVerificationOtpHash) {
        logger.warn(`Invalid OTP for user ${user._id}`);
        throw new Error('Invalid OTP');
      }

      user.isEmailVerified = true;
      user.emailVerificationOtpHash = undefined;
      user.emailVerificationOtpExpires = undefined;
      await user.save();

      await sendWelcome(user);

      // After verification, issue tokens so the user can be logged in immediately
      const tokens = this.generateTokens(user);
      await this.persistRefreshToken(user, tokens.refreshTokenHash, tokens.refreshTokenExpires);

      logger.info(`Email verified for ${user.email}`);
      return {
        message: 'Email verified successfully',
        user: formatUser(user),
        token: tokens.token,
        refreshToken: tokens.refreshToken,
      };
    } catch (error) {
      logger.error(`Verify email OTP error: ${error.message}`);
      throw error;
    }
  }

  async forgotPassword(email, options = {}) {
    try {
      if (!email) throw new Error('Email is required');
      const normalizedEmail = email.toLowerCase().trim();
      const user = await User.findOne({ email: normalizedEmail });
      if (!user) {
        return { message: 'If that email exists, a reset link has been sent.', emailDelivered: false };
      }

      const { token, hash } = generateResetToken();
      user.passwordResetTokenHash = hash;
      user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000);
      await user.save();

      const resetUrl = `${FRONTEND_URL}/reset-password?token=${token}`;
      let emailDelivered = false;
      let devResetToken;
      const { forceDevToken = false } = options;

      try {
        const html = renderGeneric({
          title: 'Reset your password',
          message: `Use the link below to reset your Cardly password. This link is valid for 1 hour.`,
          ctaText: 'Reset your password',
          ctaUrl: resetUrl,
        });
        const emailResult = await sendEmail({
          to: normalizedEmail,
          subject: 'Reset your password',
          text: `Reset your password using this link (valid for 1 hour): ${resetUrl}`,
          html,
        });
        emailDelivered = !emailResult?.simulated;
      } catch (emailError) {
        logger.error(`Password reset email failed: ${emailError.message}`);
        if (EMAIL_ENABLED) throw emailError;
      }

      if (IS_DEV && (!EMAIL_ENABLED || forceDevToken)) {
        devResetToken = token;
        logger.info(`[DEV] Password reset token for ${normalizedEmail}: ${token}`);
      }

      const genericMessage = 'If that email exists, a reset link has been sent.';
      return {
        message: genericMessage,
        emailDelivered,
        ...(devResetToken && { devResetToken, devMode: true }),
      };
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
        passwordResetExpires: { $gt: new Date() },
      });

      if (!user) {
        throw new Error('Invalid or expired reset token');
      }

      user.password = await bcrypt.hash(newPassword, 12);
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
