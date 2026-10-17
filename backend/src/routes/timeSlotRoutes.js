const express = require('express');
const router = express.Router();
const timeSlotController = require('../controllers/timeSlotController');
const { authenticate } = require('../middlewares/authMiddleware');
const { requireRole } = require('../middlewares/roleMiddleware');

router.get('/', timeSlotController.list);
router.post('/', authenticate, requireRole('Admin'), timeSlotController.create);
router.put('/:id', authenticate, requireRole('Admin'), timeSlotController.update);
router.delete('/:id', authenticate, requireRole('Admin'), timeSlotController.remove);

module.exports = router;
