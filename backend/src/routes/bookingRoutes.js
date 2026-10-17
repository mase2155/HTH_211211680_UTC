const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { authenticate } = require('../middlewares/authMiddleware');
const { requireRole } = require('../middlewares/roleMiddleware');

router.post('/', authenticate, bookingController.create);
router.get('/me', authenticate, bookingController.getMine);
router.patch('/:id/cancel', authenticate, bookingController.cancel);
router.get('/', authenticate, requireRole('Admin'), bookingController.listAll);
router.patch('/:id/status', authenticate, requireRole('Admin'), bookingController.updateStatus);

module.exports = router;
