const authService = require('../services/authService');
const imageService = require('../services/imageService');
const logger = require('../utils/logger');
const auditService = require('../services/auditService');

// Add input validation
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  return typeof password === 'string' && password.length >= 8;
};

exports.register = async (req, res, next) => {
  try {
    const { username, email, password, name } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required' });
    }
    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    if (!validatePassword(password)) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }
    const result = await authService.register({ username, email, password, name });
    res.status(201).json(result);
  } catch (error) {
    logger.error(`Registration error: ${error.message}`);
    res.status(400).json({ error: error.message });
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    const result = await authService.login({ email, password });
    res.status(200).json(result);
  } catch (error) {
    logger.error(`Login error: ${error.message}`);
    res.status(401).json({ error: error.message });
  }
};

exports.logout = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.userId;
    await authService.logout(userId);
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    logger.error(`Logout error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

exports.getProfile = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.userId;
    const user = await authService.getUserProfile(userId);
    res.status(200).json({ user });
  } catch (error) {
    logger.error(`Get profile error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { name, email, phone, location, website, bio, avatar } = req.body;
    const userId = req.user._id || req.user.userId;

    // --- Input validation & sanitization ---
    const stripHtml = (str) => {
      if (typeof str !== 'string') return str;
      return str.replace(/<[^>]*>/g, '').trim();
    };

    if (name !== undefined) {
      if (typeof name !== 'string') return res.status(400).json({ error: 'Name must be a string' });
      if (name.trim().length === 0) return res.status(400).json({ error: 'Name cannot be empty' });
      if (name.length > 100) return res.status(400).json({ error: 'Name must be at most 100 characters' });
    }

    if (email !== undefined) {
      if (typeof email !== 'string') return res.status(400).json({ error: 'Email must be a string' });
      if (!validateEmail(email)) return res.status(400).json({ error: 'Invalid email format' });
    }

    if (phone !== undefined && phone !== null && phone !== '') {
      if (typeof phone !== 'string') return res.status(400).json({ error: 'Phone must be a string' });
      const phoneClean = phone.replace(/[\s\-\(\)\.]/g, '');
      if (!/^\+?\d{7,15}$/.test(phoneClean)) {
        return res.status(400).json({ error: 'Invalid phone number format' });
      }
    }

    if (bio !== undefined && bio !== null && bio !== '') {
      if (typeof bio !== 'string') return res.status(400).json({ error: 'Bio must be a string' });
      if (bio.length > 500) return res.status(400).json({ error: 'Bio must be at most 500 characters' });
    }

    // Sanitize: strip HTML tags from string fields
    const sanitized = {
      name: name !== undefined ? stripHtml(name).trim() : undefined,
      email: email !== undefined ? email.toLowerCase().trim() : undefined,
      phone: phone !== undefined ? (phone || '').trim() : undefined,
      location: location !== undefined ? stripHtml(location).trim() : undefined,
      website: website !== undefined ? (website || '').trim() : undefined,
      bio: bio !== undefined ? stripHtml(bio).trim() : undefined,
      avatar,
    };

    const user = await authService.updateUserProfile(userId, sanitized);
    res.status(200).json({ user });
  } catch (error) {
    logger.error(`Update profile error: ${error.message}`);
    res.status(400).json({ error: error.message });
  }
};

exports.uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }
    if (!imageService.validateImageFile(req.file)) {
      return res.status(400).json({ error: 'Image must be PNG or JPEG and under 5MB' });
    }
    const userId = req.user._id || req.user.userId;
    const user = await authService.updateUserAvatar(userId, req.file.buffer);
    res.status(200).json({ user });
  } catch (error) {
    logger.error(`Upload avatar error: ${error.message}`);
    res.status(400).json({ error: error.message });
  }
};

exports.removeAvatar = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.userId;
    const user = await authService.removeUserAvatar(userId);
    res.status(200).json({ user });
  } catch (error) {
    logger.error(`Remove avatar error: ${error.message}`);
    res.status(400).json({ error: error.message });
  }
};

exports.getUserStats = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.userId;
    const stats = await authService.getUserStats(userId);
    res.status(200).json(stats);
  } catch (error) {
    logger.error(`Get user stats error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

exports.checkAuth = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.userId;
    const user = await authService.getUserProfile(userId);
    res.status(200).json({ user });
  } catch (error) {
    logger.error(`Check auth error: ${error.message}`);
    res.status(401).json({ error: error.message });
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    // Allow dev-only debug token when testing: ?debug=true
    const allowDebug = req.query.debug === 'true' && process.env.NODE_ENV !== 'production';
    const result = await authService.forgotPassword(email, { forceDevToken: allowDebug });
    res.status(200).json(result);
  } catch (error) {
    logger.error(`Forgot password error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token and new password are required' });
    }
    if (!validatePassword(newPassword)) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }

    const result = await authService.resetPassword(token, newPassword);
    res.status(200).json(result);
  } catch (error) {
    logger.error(`Reset password error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

exports.requestEmailOtp = async (req, res, next) => {
  try {
    const { email, pendingId } = req.body;

    // Accept either an email or a pending registration id
    if (!email && !pendingId) {
      return res.status(400).json({ error: 'Email or pendingId is required' });
    }

    if (email && !validateEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    const identifier = pendingId || email;
    const result = await authService.requestEmailOtp(identifier, { suppressErrors: false });
    res.status(200).json(result);
  } catch (error) {
    logger.error(`Request email OTP error: ${error.message}`);
    const status = error.message.includes('wait') ? 429 : 500;
    res.status(status).json({ error: error.message });
  }
};

exports.cancelRegistration = async (req, res, next) => {
  try {
    const { email, pendingId } = req.body;
    if (!email && !pendingId) return res.status(400).json({ error: 'Email or pendingId is required' });

    if (email) {
      if (!validateEmail(email)) return res.status(400).json({ error: 'Invalid email format' });
      const normalizedEmail = email.toLowerCase().trim();
      const User = require('../models/userModel');
      const user = await User.findOne({ email: normalizedEmail });
      if (!user) return res.status(200).json({ message: 'If that account existed, it has been cancelled.' });
      if (user.isEmailVerified) return res.status(400).json({ error: 'Account already verified' });

      await User.findByIdAndDelete(user._id);
      return res.json({ message: 'Registration cancelled' });
    }

    // pendingId path
    const PendingRegistration = require('../models/pendingRegistrationModel');
    if (!/^[0-9a-fA-F]{24}$/.test(String(pendingId))) return res.status(400).json({ error: 'Invalid pendingId' });
    const pending = await PendingRegistration.findById(pendingId);
    if (!pending) return res.status(200).json({ message: 'If that pending registration existed, it has been cancelled.' });
    await PendingRegistration.findByIdAndDelete(pendingId);
    return res.json({ message: 'Pending registration cancelled' });
  } catch (error) {
    logger.error(`Cancel registration error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

exports.verifyTwoFactor = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ error: 'Email and OTP are required' });
    if (!validateEmail(email)) return res.status(400).json({ error: 'Invalid email format' });
    if (!/^\d{6}$/.test(String(otp).trim())) return res.status(400).json({ error: 'OTP must be a 6-digit code' });

    const result = await authService.verifyTwoFactor(email, otp);
    
    // Audit log for successful 2FA verification
    try {
      const User = require('../models/userModel');
      const user = await User.findOne({ email: email.toLowerCase().trim() });
      if (user) {
        await auditService.log({
          action: 'auth.two_factor_login',
          entityType: 'user',
          entityId: user._id,
          userId: user._id,
          metadata: { email: user.email },
          severity: 'info',
          success: true
        });
      }
    } catch (auditError) {
      logger.error(`Failed to log 2FA login audit: ${auditError.message}`);
    }
    
    res.status(200).json(result);
  } catch (error) {
    logger.error(`Verify 2FA error: ${error.message}`);
    
    // Audit log for failed 2FA attempt
    try {
      const User = require('../models/userModel');
      const user = await User.findOne({ email: email.toLowerCase().trim() });
      if (user) {
        await auditService.log({
          action: 'auth.two_factor_login_failed',
          entityType: 'user',
          entityId: user._id,
          userId: user._id,
          metadata: { email: user.email, error: error.message },
          severity: 'warning',
          success: false
        });
      }
    } catch (auditError) {
      logger.error(`Failed to log failed 2FA attempt audit: ${auditError.message}`);
    }
    
    const status = error.message.includes('expired') || error.message.includes('Invalid') ? 400 : 500;
    res.status(status).json({ error: error.message });
  }
};

exports.verifyEmail = async (req, res, next) => {
  try {
    const { email, otp, userId } = req.body;
    if (!otp) return res.status(400).json({ error: 'OTP is required' });
    if (!/^\d{6}$/.test(String(otp).trim())) return res.status(400).json({ error: 'OTP must be a 6-digit code' });

    // Prefer `userId` when supplied (safer) otherwise fallback to `email`.
    let identifier = userId;
    if (!identifier) {
      if (!email) return res.status(400).json({ error: 'Email or userId/pendingId is required' });
      if (!validateEmail(email)) return res.status(400).json({ error: 'Invalid email format' });
      identifier = email;
    }

    const result = await authService.verifyEmailOtp(identifier, otp);
    res.status(200).json(result);
  } catch (error) {
    logger.error(`Email verification error: ${error.message}`);
    const status = error.message.includes('expired') || error.message.includes('Invalid') ? 400 : 500;
    res.status(status).json({ error: error.message });
  }
};

exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token is required' });
    }
    const result = await authService.refreshAccessToken(refreshToken);
    res.status(200).json(result);
  } catch (error) {
    logger.error(`Refresh token error: ${error.message}`);
    res.status(401).json({ error: error.message });
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }
    const userId = req.user._id || req.user.userId;
    await authService.changePassword(userId, currentPassword, newPassword);
    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    logger.error(`Change password error: ${error.message}`);
    res.status(400).json({ error: error.message });
  }
};

exports.toggleTwoFactor = async (req, res) => {
  try {
    const User = require('../models/userModel');
    const userId = req.user._id || req.user.userId;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    // If enabling 2FA, start a verification flow instead of toggling immediately
    if (!user.twoFactorEnabled) {
      const { otp, hash } = require('../utils/tokenUtils').generateOtp();
      user.twoFactorEnablePendingHash = hash;
      user.twoFactorEnablePendingExpires = new Date(Date.now() + 5 * 60 * 1000);
      await user.save();

      // Send OTP email
      try {
        const { render2fa } = require('../utils/emailTemplates');
        const html = render2fa({ otp, name: user.name || user.username, minutes: 5 });
        await require('../utils/emailService').sendEmail({
          to: user.email,
          subject: 'Your Cardly two-factor enable code',
          text: `Your code is ${otp}. It expires in 5 minutes.`,
          html,
        });
      } catch (e) {
        // Log but don't fail the toggle API — user can retry
        require('../utils/logger').error(`2FA enable email failed: ${e.message}`);
      }

      const responsePayload = { message: '2FA enable code sent', requiresVerification: true };
      if (process.env.NODE_ENV !== 'production' && process.env.EMAIL_ENABLED !== 'true') {
        responsePayload.devOtp = otp;
      }
      return res.json(responsePayload);
    }

    // Disabling 2FA: turn off directly
    user.twoFactorEnabled = false;
    await user.save();
    
    // Audit log for 2FA disable
    try {
      await auditService.log({
        action: 'auth.two_factor_disable',
        entityType: 'user',
        entityId: user._id,
        userId: user._id,
        metadata: { email: user.email },
        severity: 'info',
        success: true
      });
    } catch (auditError) {
      logger.error(`Failed to log 2FA disable audit: ${auditError.message}`);
    }
    
    res.json({ twoFactorEnabled: false });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.verifyEnableTwoFactor = async (req, res) => {
  try {
    const User = require('../models/userModel');
    const { otp } = req.body;
    const userId = req.user._id || req.user.userId;
    if (!otp) return res.status(400).json({ error: 'OTP is required' });
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (!user.twoFactorEnablePendingHash || !user.twoFactorEnablePendingExpires) return res.status(400).json({ error: 'No 2FA enable pending' });
    if (user.twoFactorEnablePendingExpires < new Date()) return res.status(400).json({ error: 'OTP expired' });
    const incomingHash = require('../utils/tokenUtils').hashValue(String(otp).trim());
    if (incomingHash !== user.twoFactorEnablePendingHash) return res.status(400).json({ error: 'Invalid OTP' });
    user.twoFactorEnabled = true;
    user.twoFactorEnablePendingHash = undefined;
    user.twoFactorEnablePendingExpires = undefined;
    await user.save();
    
    // Audit log for successful 2FA enablement
    try {
      await auditService.log({
        action: 'auth.two_factor_enable',
        entityType: 'user',
        entityId: user._id,
        userId: user._id,
        metadata: { email: user.email },
        severity: 'info',
        success: true
      });
    } catch (auditError) {
      logger.error(`Failed to log 2FA enable audit: ${auditError.message}`);
    }
    
    res.json({ message: 'Two-factor enabled', twoFactorEnabled: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.resendTwoFactorOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });
    if (!validateEmail(email)) return res.status(400).json({ error: 'Invalid email format' });

    const User = require('../models/userModel');
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (!user.twoFactorEnabled) return res.status(400).json({ error: 'Two-factor authentication is not enabled for this account' });

    const { otp, hash } = require('../utils/tokenUtils').generateOtp();
    user.twoFactorOtpHash = hash;
    user.twoFactorOtpExpires = new Date(Date.now() + 5 * 60 * 1000);
    user.twoFactorOtpRequestedAt = new Date();
    await user.save();

    logger.info(`2FA OTP resent for user: ${email}`);

    let emailDelivered = false;
    try {
      const { render2fa } = require('../utils/emailTemplates');
      const html = render2fa({ otp, name: user.name || user.username, minutes: 5 });
      await require('../utils/emailService').sendEmail({
        to: user.email,
        subject: 'Your Cardly Two-Factor Authentication Code',
        text: `Your 2FA code is ${otp}. It expires in 5 minutes.`,
        html,
      });
      emailDelivered = true;
    } catch (e) {
      logger.error(`2FA resend email failed: ${e.message}`);
    }

    const responsePayload = { 
      message: '2FA code resent to your email', 
      emailDelivered,
      expiresInMinutes: 5 
    };
    if (process.env.NODE_ENV !== 'production' && process.env.EMAIL_ENABLED !== 'true') {
      responsePayload.devOtp = otp;
    }
    return res.json(responsePayload);
  } catch (error) {
    logger.error(`Resend 2FA OTP error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

exports.resendEnableTwoFactorOtp = async (req, res) => {
  try {
    const User = require('../models/userModel');
    const userId = req.user._id || req.user.userId;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (!user.twoFactorEnablePendingHash || !user.twoFactorEnablePendingExpires) {
      return res.status(400).json({ error: 'No 2FA enable pending. Please start the enable process first.' });
    }

    const { otp, hash } = require('../utils/tokenUtils').generateOtp();
    user.twoFactorEnablePendingHash = hash;
    user.twoFactorEnablePendingExpires = new Date(Date.now() + 5 * 60 * 1000);
    await user.save();

    logger.info(`2FA enable OTP resent for user: ${user.email}`);

    let emailDelivered = false;
    try {
      const { render2fa } = require('../utils/emailTemplates');
      const html = render2fa({ otp, name: user.name || user.username, minutes: 5 });
      await require('../utils/emailService').sendEmail({
        to: user.email,
        subject: 'Your Cardly two-factor enable code',
        text: `Your code is ${otp}. It expires in 5 minutes.`,
        html,
      });
      emailDelivered = true;
    } catch (e) {
      logger.error(`2FA enable resend email failed: ${e.message}`);
    }

    const responsePayload = { 
      message: '2FA enable code resent to your email', 
      emailDelivered,
      expiresInMinutes: 5 
    };
    if (process.env.NODE_ENV !== 'production' && process.env.EMAIL_ENABLED !== 'true') {
      responsePayload.devOtp = otp;
    }
    return res.json(responsePayload);
  } catch (error) {
    logger.error(`Resend enable 2FA OTP error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    const User = require('../models/userModel');
    const Card = require('../models/cardModel');
    const userId = req.user._id || req.user.userId;
    await Card.deleteMany({ ownerUserId: userId });
    await User.findByIdAndDelete(userId);
    res.json({ message: 'Account deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPrivacySettings = async (req, res) => {
  try {
    const User = require('../models/userModel');
    const userId = req.user._id || req.user.userId;
    const user = await User.findById(userId).select('privacySettings');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ privacySettings: user.privacySettings || {} });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updatePrivacySettings = async (req, res) => {
  try {
    const User = require('../models/userModel');
    const userId = req.user._id || req.user.userId;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const { defaultCardVisibility, showEmail, showPhone, showAddress, profileVisible } = req.body;
    if (defaultCardVisibility !== undefined) user.privacySettings.defaultCardVisibility = defaultCardVisibility;
    if (showEmail !== undefined) user.privacySettings.showEmail = showEmail;
    if (showPhone !== undefined) user.privacySettings.showPhone = showPhone;
    if (showAddress !== undefined) user.privacySettings.showAddress = showAddress;
    if (profileVisible !== undefined) user.privacySettings.profileVisible = profileVisible;
    await user.save();
    res.json({ privacySettings: user.privacySettings });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};