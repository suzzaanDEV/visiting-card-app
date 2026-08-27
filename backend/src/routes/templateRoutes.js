const express = require('express');
const router = express.Router();
const templateController = require('../controllers/templateController');
const { authenticateToken, authenticateAdmin } = require('../middleware/authMiddleware');
const { upload, handleMulterError } = require('../utils/multerConfig');

// Public routes (no authentication required)
router.get('/', templateController.getAllTemplates);
router.get('/featured', templateController.getFeaturedTemplates);
router.get('/category/:category', templateController.getTemplatesByCategory);
router.get('/search', templateController.searchTemplates);

// Admin list routes BEFORE /:templateId (route-order fix)
router.get('/admin/all', authenticateToken, authenticateAdmin, templateController.getAllTemplatesAdmin);
router.get('/admin/stats', authenticateToken, authenticateAdmin, templateController.getTemplateStats);

router.get('/:templateId', templateController.getTemplateById);
router.post('/:templateId/generate', templateController.generateDesignFromTemplate);

// Admin mutation routes
router.use(authenticateToken);
router.use(authenticateAdmin);

router.post('/', templateController.createTemplate);
router.put('/:templateId', templateController.updateTemplate);
router.delete('/:templateId', templateController.deleteTemplate);
router.put('/:templateId/featured', templateController.toggleFeatured);
router.post('/:templateId/background', upload.single('image'), handleMulterError, templateController.uploadBackground);

module.exports = router; 