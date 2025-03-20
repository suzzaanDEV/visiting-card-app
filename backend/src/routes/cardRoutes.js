const express = require('express');
const router = express.Router();
const cardController = require('../controllers/cardController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { upload, handleMulterError } = require('../utils/multerConfig');

// Public routes (no authentication required) - MUST BE BEFORE AUTHENTICATION MIDDLEWARE
router.get('/public', cardController.getPublicCards);
router.get('/trending', cardController.getTrendingCards);
router.get('/c/:shortLink', cardController.getCardByShortLink);
router.get('/public/view/:cardId', cardController.getCardById);
router.get('/view/:cardId', cardController.getCardById);
router.post('/:cardId/share', cardController.shareCard);
router.post('/:cardId/download', cardController.downloadCard);
router.get('/:cardId/export', cardController.exportContact);
router.post('/:cardId/save-contact', cardController.saveContact);

// Protected routes (authentication required)
router.use(authenticateToken);

// Card CRUD operations
router.post('/', upload.single('cardImage'), handleMulterError, cardController.createCard);
router.post('/from-template', upload.single('cardImage'), handleMulterError, cardController.createCardFromTemplate);
router.get('/my', cardController.getUserCards);
router.get('/loved', cardController.getLovedCards);
router.get('/:cardId', cardController.getCard);
router.put('/:cardId', upload.single('cardImage'), handleMulterError, cardController.updateCard);
router.delete('/:cardId', cardController.deleteCard);

// Love and save functionality
router.post('/:cardId/love', cardController.toggleLove);
router.post('/:cardId/save', cardController.saveCard);
router.delete('/:cardId/save', cardController.unsaveCard);
router.get('/saved', cardController.getSavedCards);

// QR code generation
router.post('/:cardId/qr', cardController.generateQRCode);

// Analytics
router.get('/:cardId/analytics', cardController.getCardAnalytics);

module.exports = router;