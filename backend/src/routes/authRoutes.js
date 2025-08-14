const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate, checkUserActive } = require('../middleware/authMiddleware');
const logger = require('../utils/logger');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/verify-email', authController.verifyEmail);

// Protected routes
router.get('/profile', authenticate, authController.getProfile);
router.put('/profile', authenticate, authController.updateProfile);
router.post('/change-password', authenticate, authController.changePassword);
router.post('/logout', authenticate, authController.logout);

// Check user status (for frontend to verify if user is blocked)
router.get('/check-status', checkUserActive, (req, res) => {
  res.status(200).json({ 
    message: 'User is active',
    user: req.user 
  });
});

module.exports = router;