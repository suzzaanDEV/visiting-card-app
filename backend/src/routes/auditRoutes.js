const express = require('express');
const router = express.Router();
const { authenticateAdmin } = require('../middleware/adminMiddleware');
const ctrl = require('../controllers/auditController');

router.use(authenticateAdmin);
router.get('/', ctrl.getRecentLogs);
router.get('/stats', ctrl.getStats);
router.get('/actions', ctrl.getActionList);
router.get('/timeline', ctrl.getTimeline);
router.get('/export', ctrl.exportLogs);
router.get('/entity/:entityType/:entityId', ctrl.getByEntity);

module.exports = router;
