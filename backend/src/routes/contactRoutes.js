const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.post('/', contactController.submitContact);
router.get('/', authenticateToken, contactController.getContacts);

module.exports = router;
