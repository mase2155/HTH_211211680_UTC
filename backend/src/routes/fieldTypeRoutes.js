const express = require('express');
const router = express.Router();
const fieldTypeController = require('../controllers/fieldTypeController');
const { authenticate } = require('../middlewares/authMiddleware');
const { requireRole } = require('../middlewares/roleMiddleware');

router.get('/', fieldTypeController.list);
router.post('/', authenticate, requireRole('Admin'), fieldTypeController.create);
router.put('/:id', authenticate, requireRole('Admin'), fieldTypeController.update);
router.delete('/:id', authenticate, requireRole('Admin'), fieldTypeController.remove);

module.exports = router;
