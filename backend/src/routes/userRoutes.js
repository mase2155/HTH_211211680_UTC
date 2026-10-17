const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate } = require('../middlewares/authMiddleware');
const { requireRole } = require('../middlewares/roleMiddleware');

router.get('/me', authenticate, userController.getProfile);
router.put('/me', authenticate, userController.updateProfile);
router.get('/', authenticate, requireRole('Admin'), userController.listUsers);
router.put('/:id', authenticate, requireRole('Admin'), userController.updateUser);
router.delete('/:id', authenticate, requireRole('Admin'), userController.deleteUser);

module.exports = router;
