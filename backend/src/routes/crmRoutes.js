const express = require('express');
const router = express.Router();
const { authenticateAdmin } = require('../middleware/adminMiddleware');
const ctrl = require('../controllers/crmController');

router.use(authenticateAdmin);
router.get('/', ctrl.getAllMessages);
router.get('/stats', ctrl.getStats);
router.post('/bulk/update', ctrl.bulkUpdate);
router.post('/bulk/delete', ctrl.bulkDelete);
router.get('/:id', ctrl.getMessageById);
router.post('/:id/reply', ctrl.replyToMessage);
router.post('/:id/archive', ctrl.archiveMessage);
router.post('/:id/spam', ctrl.markAsSpam);
router.delete('/:id', ctrl.deleteMessage);

module.exports = router;
