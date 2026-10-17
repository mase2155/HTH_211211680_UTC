const express = require('express');
const router = express.Router();
const priceController = require('../controllers/priceController');
const { authenticate } = require('../middlewares/authMiddleware');
const { requireRole } = require('../middlewares/roleMiddleware');

router.get('/', priceController.list);
router.post('/', authenticate, requireRole('Admin'), priceController.create);
router.put('/:id', authenticate, requireRole('Admin'), priceController.update);
router.delete('/:id', authenticate, requireRole('Admin'), priceController.remove);

module.exports = router;
