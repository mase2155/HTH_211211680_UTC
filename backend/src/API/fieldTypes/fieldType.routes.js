const express = require('express');
const validate = require('../../middlewares/validate');
const { authenticate } = require('../../middlewares/authenticate');
const authorize = require('../../middlewares/authorize');
const { ROLES } = require('../../constants/roles');
const fieldTypeController = require('./fieldType.controller');
const { listQuery, createBody, updateBody, idParams } = require('../../modules/fieldTypes/fieldType.validation');

const router = express.Router();

router.get('/', validate({ query: listQuery }), fieldTypeController.list);
router.get('/:id', validate({ params: idParams }), fieldTypeController.getById);

router.post(
  '/',
  authenticate,
  authorize(ROLES.ADMIN),
  validate({ body: createBody }),
  fieldTypeController.create,
);
router.patch(
  '/:id',
  authenticate,
  authorize(ROLES.ADMIN),
  validate({ params: idParams, body: updateBody }),
  fieldTypeController.update,
);
router.delete(
  '/:id',
  authenticate,
  authorize(ROLES.ADMIN),
  validate({ params: idParams }),
  fieldTypeController.remove,
);

module.exports = router;
