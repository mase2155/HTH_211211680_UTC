const express = require('express');
const validate = require('../../middlewares/validate');
const { authenticate } = require('../../middlewares/authenticate');
const authorize = require('../../middlewares/authorize');
const { ROLES } = require('../../constants/roles');
const timeSlotController = require('./timeSlot.controller');
const { listQuery, createBody, updateBody, idParams } = require('./timeSlot.validation');

const router = express.Router();

router.get('/', validate({ query: listQuery }), timeSlotController.list);
router.get('/:id', validate({ params: idParams }), timeSlotController.getById);

router.post(
  '/',
  authenticate,
  authorize(ROLES.ADMIN),
  validate({ body: createBody }),
  timeSlotController.create,
);
router.patch(
  '/:id',
  authenticate,
  authorize(ROLES.ADMIN),
  validate({ params: idParams, body: updateBody }),
  timeSlotController.update,
);
router.delete(
  '/:id',
  authenticate,
  authorize(ROLES.ADMIN),
  validate({ params: idParams }),
  timeSlotController.remove,
);

module.exports = router;
