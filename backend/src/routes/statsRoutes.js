const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');
const { authenticate } = require('../middlewares/authMiddleware');
const { requireRole } = require('../middlewares/roleMiddleware');

router.get('/', authenticate, requireRole('Admin'), statsController.getSummary);

module.exports = router;
