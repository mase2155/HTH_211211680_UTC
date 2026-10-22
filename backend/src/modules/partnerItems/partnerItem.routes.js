const express = require('express');
const validate = require('../../middlewares/validate');
const { authenticate } = require('../../middlewares/authenticate');
const authorize = require('../../middlewares/authorize');
const { ROLES } = require('../../constants/roles');
const partnerItemController = require('./partnerItem.controller');
const { listQuery, createBody, updateBody, idParams } = require('./partnerItem.validation');

const router = express.Router();

router.get('/', validate({ query: listQuery }), partnerItemController.list);
router.get('/:id', validate({ params: idParams }), partnerItemController.getById);

router.post(
  '/',
  authenticate,
  authorize(ROLES.ADMIN),
  validate({ body: createBody }),
  partnerItemController.create,
);
router.patch(
  '/:id',
  authenticate,
  authorize(ROLES.ADMIN),
  validate({ params: idParams, body: updateBody }),
  partnerItemController.update,
);
router.delete(
  '/:id',
  authenticate,
  authorize(ROLES.ADMIN),
  validate({ params: idParams }),
  partnerItemController.remove,
);

module.exports = router;
