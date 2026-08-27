const express = require('express');
const router = express.Router();
const cardController = require('../controllers/cardController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { authenticateAdmin } = require('../middleware/adminMiddleware');
const { filterSensitiveData, addPrivacyHeaders } = require('../middleware/privacyMiddleware');
const { upload, handleMulterError } = require('../utils/multerConfig');
const { cardCreationLimiter } = require('../middleware/rateLimiter');
const mongoose = require('mongoose');

const validateObjectId = (paramName) => (req, res, next) => {
  const id = req.params[paramName];
  if (id && !mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: `Invalid ${paramName} format` });
  }
  next();
};

const validatePositiveInt = (queryName) => (req, res, next) => {
  const val = req.query[queryName];
  if (val !== undefined && (isNaN(Number(val)) || Number(val) < 1)) {
    return res.status(400).json({ error: `${queryName} must be a positive number` });
  }
  next();
};



// Public routes (no authentication required) - Apply privacy filtering
router.get('/public', addPrivacyHeaders, filterSensitiveData, validatePositiveInt('page'), validatePositiveInt('limit'), cardController.getPublicCards);
router.get('/trending', addPrivacyHeaders, filterSensitiveData, validatePositiveInt('limit'), cardController.getTrendingCards);
router.get('/suggestions', validatePositiveInt('limit'), cardController.getSuggestions);

// Public card viewing routes - Controller handles privacy logic
router.get('/c/:shortLink', cardController.getCardByShortLink);
router.get('/public/view/:cardId', validateObjectId('cardId'), cardController.getCardById);

// Public actions (no sensitive data)
router.post('/:cardId/share', validateObjectId('cardId'), cardController.shareCard);
router.post('/:cardId/download', validateObjectId('cardId'), cardController.downloadCard);
router.get('/:cardId/export', validateObjectId('cardId'), cardController.exportContact);
router.get('/:cardId/save-contact', validateObjectId('cardId'), cardController.saveContact);

// Access request management (card owners can manage their requests)
router.get('/access-requests', authenticateToken, cardController.getAccessRequests);
router.post('/access-requests/:requestId/approve', authenticateToken, cardController.approveAccessRequest);
router.post('/access-requests/:requestId/reject', authenticateToken, cardController.rejectAccessRequest);

// Protected routes (user authentication required) - NO privacy filtering
router.use(authenticateToken);

// Card CRUD operations - Full data access for authenticated users
router.post('/', cardCreationLimiter, upload.single('cardImage'), handleMulterError, cardController.createCard);
router.post('/from-template', cardCreationLimiter, upload.single('cardImage'), handleMulterError, cardController.createCardFromTemplate);
router.get('/my', cardController.getUserCards);
router.get('/my/stats', cardController.getUserCardStats);
router.get('/loved', cardController.getLovedCards);
// Love and save functionality
router.post('/:cardId/love', validateObjectId('cardId'), cardController.toggleLove);
router.post('/:cardId/save', validateObjectId('cardId'), cardController.saveCard);
router.delete('/:cardId/save', validateObjectId('cardId'), cardController.unsaveCard);

// Static paths BEFORE parameterized :cardId routes
router.get('/saved', cardController.getSavedCards);
router.get('/access/check/:cardId', validateObjectId('cardId'), cardController.checkCardAccess);
router.get('/archived', cardController.getArchivedCards);

router.get('/:cardId', validateObjectId('cardId'), cardController.getCard);
router.get('/:cardId/enhanced', validateObjectId('cardId'), cardController.getCardWithEnhancedInfo);
router.get('/:cardId/completion', validateObjectId('cardId'), cardController.getCardCompletionScore);
router.put('/:cardId', validateObjectId('cardId'), upload.single('cardImage'), handleMulterError, cardController.updateCard);
router.delete('/:cardId', validateObjectId('cardId'), cardController.deleteCard);

// Archive/Restore/Duplicate
router.post('/:cardId/archive', validateObjectId('cardId'), cardController.archiveCard);
router.post('/:cardId/restore', validateObjectId('cardId'), cardController.restoreCard);
router.post('/:cardId/duplicate', validateObjectId('cardId'), cardController.duplicateCard);

// Access request functionality (user routes)
router.post('/:cardId/request-access', validateObjectId('cardId'), cardController.requestCardAccess);
router.post('/:cardId/grant-qr-access', validateObjectId('cardId'), cardController.grantQRAccess);

// QR code generation
router.post('/:cardId/qr', validateObjectId('cardId'), cardController.generateQRCode);

// Analytics
router.get('/:cardId/analytics', validateObjectId('cardId'), cardController.getCardAnalytics);

// Privacy management
router.patch('/:cardId/privacy', validateObjectId('cardId'), cardController.updateCardPrivacy);

module.exports = router;