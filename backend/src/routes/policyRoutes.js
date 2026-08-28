const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const { authenticateAdmin } = require('../middleware/adminMiddleware');
const ctrl = require('../controllers/policyController');

router.get('/', ctrl.getAllPolicies);
router.get('/:slug', ctrl.getPolicy);
router.post('/:slug/accept', authenticateToken, ctrl.acceptPolicy);
router.get('/:slug/check', authenticateToken, ctrl.checkPolicyAccepted);

router.get('/admin/all', authenticateAdmin, ctrl.getAllPoliciesAdmin);
router.get('/admin/:slug', authenticateAdmin, ctrl.getPolicyForAdmin);
router.post('/admin', authenticateAdmin, ctrl.createPolicy);
router.put('/admin/:slug', authenticateAdmin, ctrl.updatePolicy);
router.post('/admin/:slug/publish', authenticateAdmin, ctrl.publishPolicy);
router.delete('/admin/:slug', authenticateAdmin, ctrl.deletePolicy);

module.exports = router;
