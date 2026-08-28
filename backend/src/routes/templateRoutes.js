const express = require('express');
const router = express.Router();
const templateController = require('../controllers/templateController');
const { authenticateAdmin } = require('../middleware/authMiddleware');
const { upload, handleMulterError } = require('../utils/multerConfig');

// Public routes (no authentication required)
router.get('/', templateController.getAllTemplates);
router.get('/featured', templateController.getFeaturedTemplates);
router.get('/category/:category', templateController.getTemplatesByCategory);
router.get('/search', templateController.searchTemplates);

// Admin list routes BEFORE /:templateId (route-order fix)
router.get('/admin/all', authenticateAdmin, templateController.getAllTemplatesAdmin);
router.get('/admin/stats', authenticateAdmin, templateController.getTemplateStats);

router.get('/:templateId', templateController.getTemplateById);
router.post('/:templateId/generate', templateController.generateDesignFromTemplate);

// Admin mutation routes — admin JWT only (authenticateToken would reject
// admin tokens because admins live in the Admin collection, not User).
router.use(authenticateAdmin);

router.post('/', templateController.createTemplate);
router.put('/:templateId', templateController.updateTemplate);
router.delete('/:templateId', templateController.deleteTemplate);
router.put('/:templateId/featured', templateController.toggleFeatured);
router.post('/:templateId/background', upload.single('image'), handleMulterError, templateController.uploadBackground);

module.exports = router; 