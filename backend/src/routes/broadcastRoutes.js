const express = require('express');
const router = express.Router();
const { authenticateAdmin } = require('../middleware/adminMiddleware');
const broadcastController = require('../controllers/broadcastController');
const { broadcastLimiter } = require('../middleware/rateLimiter');

router.use(authenticateAdmin);

router.get('/stats', broadcastController.getOverallStats);
router.post('/preview', broadcastController.previewBroadcast);
router.get('/', broadcastController.getBroadcasts);
router.post('/', broadcastLimiter, broadcastController.createBroadcast);
router.get('/:id', broadcastController.getBroadcastById);
router.put('/:id', broadcastController.updateBroadcast);
router.delete('/:id', broadcastController.deleteBroadcast);
router.post('/:id/send', broadcastLimiter, broadcastController.sendBroadcastNow);
router.post('/:id/schedule', broadcastLimiter, broadcastController.scheduleBroadcast);
router.post('/:id/cancel', broadcastController.cancelBroadcast);
router.get('/:id/delivery', broadcastController.getDeliveryDetails);

module.exports = router;
