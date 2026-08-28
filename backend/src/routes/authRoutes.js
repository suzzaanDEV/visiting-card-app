const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate, checkUserActive } = require('../middleware/authMiddleware');
const { profileUpdateLimiter } = require('../middleware/rateLimiter');
const { upload, handleMulterError } = require('../utils/multerConfig');

// In production impose a rate limit; in development bypass it for easier testing
const otpLimiter = process.env.NODE_ENV === 'production'
  ? rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { error: 'Too many OTP requests. Please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
  })
  : (req, res, next) => next();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many authentication attempts. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Public routes
router.post('/register', authLimiter, authController.register);
router.post('/login', authLimiter, authController.login);
router.post('/refresh', authController.refreshToken);
router.post('/forgot-password', authController.forgotPassword);
router.post('/cancel-registration', authController.cancelRegistration);
router.post('/reset-password', authController.resetPassword);
router.post('/verify-email/request', otpLimiter, authController.requestEmailOtp);
router.post('/verify-email', authController.verifyEmail);
router.post('/verify-2fa', otpLimiter, authController.verifyTwoFactor);
router.post('/resend-2fa-otp', otpLimiter, authController.resendTwoFactorOtp);

// Protected routes
router.post('/verify-enable-2fa', otpLimiter, authenticate, authController.verifyEnableTwoFactor);
router.post('/profile/2fa/resend', otpLimiter, authenticate, authController.resendEnableTwoFactorOtp);
router.get('/check', authenticate, authController.checkAuth);
router.get('/profile', authenticate, authController.getProfile);
router.get('/stats', authenticate, authController.getUserStats);
router.put('/profile', authenticate, profileUpdateLimiter, authController.updateProfile);
router.post('/profile/avatar', authenticate, profileUpdateLimiter, upload.single('avatar'), handleMulterError, authController.uploadAvatar);
router.delete('/profile/avatar', authenticate, authController.removeAvatar);
router.post('/change-password', authenticate, authController.changePassword);
router.post('/profile/2fa/toggle', authenticate, authController.toggleTwoFactor);
router.delete('/account', authenticate, authController.deleteAccount);
router.get('/privacy', authenticate, authController.getPrivacySettings);
router.put('/privacy', authenticate, authController.updatePrivacySettings);
router.post('/logout', authenticate, authController.logout);

// Check user status (for frontend to verify if user is blocked)
router.get('/check-status', checkUserActive, (req, res) => {
  res.status(200).json({
    message: 'User is active',
    user: req.user
  });
});

module.exports = router;