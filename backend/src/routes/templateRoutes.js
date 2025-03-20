const express = require('express');
const router = express.Router();
const templateController = require('../controllers/templateController');
const { authenticateToken, authenticateAdmin } = require('../middleware/authMiddleware');

// Public routes (no authentication required)
router.get('/', templateController.getAllTemplates);
router.get('/featured', templateController.getFeaturedTemplates);
router.get('/category/:category', templateController.getTemplatesByCategory);
router.get('/search', templateController.searchTemplates);
router.get('/:templateId', templateController.getTemplateById);
router.post('/:templateId/generate', templateController.generateDesignFromTemplate);

// Admin routes (authentication required)
router.use(authenticateToken);
router.use(authenticateAdmin);

router.post('/', templateController.createTemplate);
router.put('/:templateId', templateController.updateTemplate);
router.delete('/:templateId', templateController.deleteTemplate);
router.get('/admin/all', templateController.getAllTemplatesAdmin);
router.get('/admin/stats', templateController.getTemplateStats);
router.put('/:templateId/featured', templateController.toggleFeatured);

module.exports = router; 