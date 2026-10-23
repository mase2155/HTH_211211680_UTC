const express = require('express');
const validate = require('../../middlewares/validate');
const { authenticate } = require('../../middlewares/authenticate');
const authorize = require('../../middlewares/authorize');
const { ROLES } = require('../../constants/roles');
const bookingController = require('./booking.controller');
const {
  createBody,
  listMineQuery,
  listAllQuery,
  cancelBody,
  adminStatusBody,
  adminUpdateBody,
  adminDeleteBody,
  idParams,
} = require('./booking.validation');

const router = express.Router();

router.get(
  '/',
  authenticate,
  authorize(ROLES.ADMIN),
  validate({ query: listAllQuery }),
  bookingController.listAll,
);

router.post('/', authenticate, validate({ body: createBody }), bookingController.create);
router.get('/me', authenticate, validate({ query: listMineQuery }), bookingController.listMine);
router.get('/:id', authenticate, validate({ params: idParams }), bookingController.getById);
router.post('/:id/payment', authenticate, validate({ params: idParams }), bookingController.simulatePayment);
router.patch(
  '/:id/cancel',
  authenticate,
  validate({ params: idParams, body: cancelBody }),
  bookingController.cancel,
);

router.patch(
  '/:id/status',
  authenticate,
  authorize(ROLES.ADMIN),
  validate({ params: idParams, body: adminStatusBody }),
  bookingController.adminUpdateStatus,
);

router.patch(
  '/:id',
  authenticate,
  authorize(ROLES.ADMIN),
  validate({ params: idParams, body: adminUpdateBody }),
  bookingController.adminUpdate,
);

router.delete(
  '/:id',
  authenticate,
  authorize(ROLES.ADMIN),
  validate({ params: idParams, body: adminDeleteBody }),
  bookingController.adminRemove,
);

module.exports = router;
