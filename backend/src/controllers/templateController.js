const templateService = require('../services/templateService');
const logger = require('../utils/logger');

// Public routes

// Get all active templates
exports.getAllTemplates = async (req, res, next) => {
  try {
    const { category, featured, search } = req.query;
    const filters = { category, featured: featured === 'true', search };
    
    const templates = await templateService.getAllTemplates(filters);
    res.status(200).json(templates);
  } catch (error) {
    logger.error(`Get all templates error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

// Get template by ID
exports.getTemplateById = async (req, res, next) => {
  try {
    const { templateId } = req.params;
    const template = await templateService.getTemplateById(templateId);
    res.status(200).json(template);
  } catch (error) {
    logger.error(`Get template by ID error: ${error.message}`);
    res.status(404).json({ error: error.message });
  }
};

// Get featured templates
exports.getFeaturedTemplates = async (req, res, next) => {
  try {
    const { limit = 6 } = req.query;
    const templates = await templateService.getFeaturedTemplates(parseInt(limit));
    res.status(200).json(templates);
  } catch (error) {
    logger.error(`Get featured templates error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

// Get templates by category
exports.getTemplatesByCategory = async (req, res, next) => {
  try {
    const { category } = req.params;
    const { limit = 10 } = req.query;
    const templates = await templateService.getTemplatesByCategory(category, parseInt(limit));
    res.status(200).json(templates);
  } catch (error) {
    logger.error(`Get templates by category error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

// Search templates
exports.searchTemplates = async (req, res, next) => {
  try {
    const { q } = req.query;
    const { limit = 20 } = req.query;
    
    if (!q) {
      return res.status(400).json({ error: 'Search query is required' });
    }
    
    const templates = await templateService.searchTemplates(q, parseInt(limit));
    res.status(200).json(templates);
  } catch (error) {
    logger.error(`Search templates error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

// Generate design from template
exports.generateDesignFromTemplate = async (req, res, next) => {
  try {
    const { templateId } = req.params;
    const cardData = req.body;
    
    const design = await templateService.generateDesignFromTemplate(templateId, cardData);
    
    // Increment usage count
    await templateService.incrementUsage(templateId);
    
    res.status(200).json(design);
  } catch (error) {
    logger.error(`Generate design from template error: ${error.message}`);
    res.status(400).json({ error: error.message });
  }
};

// Admin routes

// Create new template
exports.createTemplate = async (req, res, next) => {
  try {
    const templateData = req.body;
    const adminId = req.user.userId;
    
    const template = await templateService.createTemplate(templateData, adminId);
    res.status(201).json(template);
  } catch (error) {
    logger.error(`Create template error: ${error.message}`);
    res.status(400).json({ error: error.message });
  }
};

// Update template
exports.updateTemplate = async (req, res, next) => {
  try {
    const { templateId } = req.params;
    const updateData = req.body;
    
    const template = await templateService.updateTemplate(templateId, updateData);
    res.status(200).json(template);
  } catch (error) {
    logger.error(`Update template error: ${error.message}`);
    res.status(400).json({ error: error.message });
  }
};

// Delete template
exports.deleteTemplate = async (req, res, next) => {
  try {
    const { templateId } = req.params;
    
    const template = await templateService.deleteTemplate(templateId);
    res.status(200).json({ message: 'Template deleted successfully', template });
  } catch (error) {
    logger.error(`Delete template error: ${error.message}`);
    res.status(400).json({ error: error.message });
  }
};

// Get template statistics
exports.getTemplateStats = async (req, res, next) => {
  try {
    const stats = await templateService.getTemplateStats();
    res.status(200).json(stats);
  } catch (error) {
    logger.error(`Get template stats error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

// Toggle template featured status
exports.toggleFeatured = async (req, res, next) => {
  try {
    const { templateId } = req.params;
    const { isFeatured } = req.body;
    
    const template = await templateService.updateTemplate(templateId, { isFeatured });
    res.status(200).json(template);
  } catch (error) {
    logger.error(`Toggle template featured error: ${error.message}`);
    res.status(400).json({ error: error.message });
  }
};

// Get all templates (admin view)
exports.getAllTemplatesAdmin = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, category, search, featured } = req.query;
    const filters = { category, featured: featured === 'true', search };
    
    const templates = await templateService.getAllTemplates(filters);
    
    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedTemplates = templates.slice(startIndex, endIndex);
    
    res.status(200).json({
      templates: paginatedTemplates,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(templates.length / limit),
        totalTemplates: templates.length,
        hasNext: endIndex < templates.length,
        hasPrev: startIndex > 0
      }
    });
  } catch (error) {
    logger.error(`Get all templates admin error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
}; 