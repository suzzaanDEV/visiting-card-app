const express = require('express');
const router = express.Router();
const cardController = require('../controllers/cardController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { authenticateAdmin } = require('../middleware/adminMiddleware');
const { filterSensitiveData, addPrivacyHeaders } = require('../middleware/privacyMiddleware');
const { upload, handleMulterError } = require('../utils/multerConfig');

console.log('🔒 Card routes loaded with privacy middleware');

// Public routes (no authentication required) - Apply privacy filtering
router.get('/public', addPrivacyHeaders, filterSensitiveData, cardController.getPublicCards);
router.get('/trending', addPrivacyHeaders, filterSensitiveData, cardController.getTrendingCards);

// Public card viewing routes - Controller handles privacy logic
router.get('/c/:shortLink', cardController.getCardByShortLink);
router.get('/public/view/:cardId', cardController.getCardById);

// Public actions (no sensitive data)
router.post('/:cardId/share', cardController.shareCard);
router.post('/:cardId/download', cardController.downloadCard);
router.get('/:cardId/export', cardController.exportContact);
router.get('/:cardId/save-contact', cardController.saveContact);

// Access request management (card owners can manage their requests)
router.get('/access-requests', authenticateToken, cardController.getAccessRequests);
router.post('/access-requests/:requestId/approve', authenticateToken, cardController.approveAccessRequest);
router.post('/access-requests/:requestId/reject', authenticateToken, cardController.rejectAccessRequest);

// Protected routes (user authentication required) - NO privacy filtering
router.use(authenticateToken);

// Card CRUD operations - Full data access for authenticated users
router.post('/', upload.single('cardImage'), handleMulterError, cardController.createCard);
router.post('/from-template', upload.single('cardImage'), handleMulterError, cardController.createCardFromTemplate);
router.get('/my', cardController.getUserCards);
router.get('/loved', cardController.getLovedCards);
router.get('/:cardId', cardController.getCard);
router.get('/:cardId/enhanced', cardController.getCardWithEnhancedInfo);
router.put('/:cardId', upload.single('cardImage'), handleMulterError, cardController.updateCard);
router.delete('/:cardId', cardController.deleteCard);

// Love and save functionality
router.post('/:cardId/love', cardController.toggleLove);
router.post('/:cardId/save', cardController.saveCard);
router.delete('/:cardId/save', cardController.unsaveCard);
router.get('/saved', cardController.getSavedCards);

// Access request functionality (user routes)
router.get('/access/check/:cardId', cardController.checkCardAccess);
router.post('/:cardId/request-access', cardController.requestCardAccess);
router.post('/:cardId/grant-qr-access', cardController.grantQRAccess);

// QR code generation
router.post('/:cardId/qr', cardController.generateQRCode);

// Analytics
router.get('/:cardId/analytics', cardController.getCardAnalytics);

module.exports = router;