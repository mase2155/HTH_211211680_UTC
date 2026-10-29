const express = require('express');
const validate = require('../../middlewares/validate');
const { authenticate } = require('../../middlewares/authenticate');
const authorize = require('../../middlewares/authorize');
const { ROLES } = require('../../constants/roles');
const authController = require('../auth/auth.controller');
const userController = require('./user.controller');
const {
  updateProfileBody,
  changePasswordBody,
  listUsersQuery,
  adminUpdateBody,
  idParams,
} = require('../../modules/users/user.validation');

const router = express.Router();

router.get('/me', authenticate, authController.me);

router.patch('/me', authenticate, validate({ body: updateProfileBody }), userController.updateMe);
router.patch(
  '/me/password',
  authenticate,
  validate({ body: changePasswordBody }),
  userController.changePassword,
);

router.get(
  '/',
  authenticate,
  authorize(ROLES.ADMIN),
  validate({ query: listUsersQuery }),
  userController.listUsers,
);
router.patch(
  '/:id',
  authenticate,
  authorize(ROLES.ADMIN),
  validate({ params: idParams, body: adminUpdateBody }),
  userController.adminUpdate,
);

module.exports = router;
