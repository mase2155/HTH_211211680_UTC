const express = require('express');
const validate = require('../../middlewares/validate');
const { authenticate } = require('../../middlewares/authenticate');
const { authLimiter } = require('../../middlewares/rateLimiter');
const authController = require('./auth.controller');
const { registerBody, loginBody } = require('./auth.validation');

const router = express.Router();

router.post('/register', authLimiter, validate({ body: registerBody }), authController.register);
router.post('/login', authLimiter, validate({ body: loginBody }), authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);
router.get('/me', authenticate, authController.me);

module.exports = router;
