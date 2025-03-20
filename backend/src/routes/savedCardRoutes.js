const express = require('express');
const router = express.Router();
const savedCardController = require('../controllers/savedCardController');
const { authenticateToken } = require('../middleware/authMiddleware');
const logger = require('../utils/logger');

// Save card to library
router.post('/', authenticateToken, savedCardController.saveCard);

// Get user's saved cards (library)
router.get('/', authenticateToken, savedCardController.getSavedCards);

// Get library stats
router.get('/stats', authenticateToken, savedCardController.getLibraryStats);

// Check if card is saved
router.get('/:cardId/check', authenticateToken, savedCardController.isCardSaved);

// Update saved card (notes, tags)
router.put('/:cardId', authenticateToken, savedCardController.updateSavedCard);

// Remove card from library
router.delete('/:cardId', authenticateToken, savedCardController.removeFromLibrary);

module.exports = router;