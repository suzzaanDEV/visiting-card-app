const notificationTemplateService = require('../services/notificationTemplateService');
const { availableVariables } = require('../utils/notificationTemplateVariables');
const logger = require('../utils/logger');

exports.getAvailableVariables = async (req, res) => {
  try {
    res.json({ variables: availableVariables });
  } catch (error) {
    logger.error(`Get available variables error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

exports.createTemplate = async (req, res) => {
  try {
    const template = await notificationTemplateService.createTemplate(req.body, req.admin.adminId);
    res.status(201).json({ template });
  } catch (error) {
    logger.error(`Create template error: ${error.message}`);
    res.status(400).json({ error: error.message });
  }
};

exports.updateTemplate = async (req, res) => {
  try {
    const template = await notificationTemplateService.updateTemplate(req.params.id, req.body);
    res.json({ template });
  } catch (error) {
    logger.error(`Update template error: ${error.message}`);
    res.status(400).json({ error: error.message });
  }
};

exports.deleteTemplate = async (req, res) => {
  try {
    await notificationTemplateService.deleteTemplate(req.params.id);
    res.json({ message: 'Template deleted' });
  } catch (error) {
    logger.error(`Delete template error: ${error.message}`);
    res.status(400).json({ error: error.message });
  }
};

exports.getTemplateById = async (req, res) => {
  try {
    const template = await notificationTemplateService.getTemplateById(req.params.id);
    res.json({ template });
  } catch (error) {
    logger.error(`Get template error: ${error.message}`);
    res.status(400).json({ error: error.message });
  }
};

exports.getTemplates = async (req, res) => {
  try {
    const { type, isActive, page, limit } = req.query;
    const result = await notificationTemplateService.getTemplates({
      type,
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
      page: Number(page) || 1,
      limit: Number(limit) || 20
    });
    res.json(result);
  } catch (error) {
    logger.error(`Get templates error: ${error.message}`);
    res.status(400).json({ error: error.message });
  }
};

exports.renderTemplate = async (req, res) => {
  try {
    const { variables } = req.body;
    const rendered = await notificationTemplateService.renderTemplate(req.params.id, variables || {});
    res.json({ rendered });
  } catch (error) {
    logger.error(`Render template error: ${error.message}`);
    res.status(400).json({ error: error.message });
  }
};
