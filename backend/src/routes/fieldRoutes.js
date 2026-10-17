const express = require('express');
const router = express.Router();
const fieldController = require('../controllers/fieldController');
const { authenticate } = require('../middlewares/authMiddleware');
const { requireRole } = require('../middlewares/roleMiddleware');

router.get('/', fieldController.search);
router.get('/:id', fieldController.getById);
router.post('/', authenticate, requireRole('Admin'), fieldController.create);
router.put('/:id', authenticate, requireRole('Admin'), fieldController.update);
router.delete('/:id', authenticate, requireRole('Admin'), fieldController.remove);

module.exports = router;
