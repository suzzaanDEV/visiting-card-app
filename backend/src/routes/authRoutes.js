const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/authMiddleware');
const logger = require('../utils/logger');

// Authentication routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authenticateToken, authController.logout);

// User profile routes
router.get('/profile', authenticateToken, authController.getProfile);
router.put('/profile', authenticateToken, authController.updateProfile);

// User stats routes
router.get('/stats', authenticateToken, authController.getUserStats);

// Check auth status
router.get('/check', authenticateToken, authController.checkAuth);

module.exports = router;