const express = require('express');
const router = express.Router();
const { authenticateAdmin } = require('../middleware/adminMiddleware');
const notificationTemplateController = require('../controllers/notificationTemplateController');

router.use(authenticateAdmin);

router.get('/', notificationTemplateController.getTemplates);
router.post('/', notificationTemplateController.createTemplate);
router.get('/variables', notificationTemplateController.getAvailableVariables);
router.get('/:id', notificationTemplateController.getTemplateById);
router.put('/:id', notificationTemplateController.updateTemplate);
router.delete('/:id', notificationTemplateController.deleteTemplate);
router.post('/:id/render', notificationTemplateController.renderTemplate);

module.exports = router;
