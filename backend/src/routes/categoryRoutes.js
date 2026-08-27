const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const { authenticateAdmin, requireRole } = require('../middleware/adminMiddleware');
const ctrl = require('../controllers/categoryController');

router.get('/', ctrl.getAll);
router.get('/:slug', ctrl.getBySlug);

router.get('/admin/all', authenticateAdmin, ctrl.getAllForAdmin);
router.post('/admin', authenticateAdmin, requireRole('super_admin'), ctrl.create);
router.put('/admin/:id', authenticateAdmin, requireRole('super_admin'), ctrl.update);
router.delete('/admin/:id', authenticateAdmin, requireRole('super_admin'), ctrl.remove);
router.patch('/admin/:id/toggle', authenticateAdmin, requireRole('super_admin'), ctrl.toggleActive);

module.exports = router;
