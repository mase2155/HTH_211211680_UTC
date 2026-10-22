const express = require('express');
const validate = require('../../middlewares/validate');
const { authenticate } = require('../../middlewares/authenticate');
const { optionalAuthenticate } = require('../../middlewares/authenticate');
const authorize = require('../../middlewares/authorize');
const { uploadFieldImage } = require('../../middlewares/upload');
const { ROLES } = require('../../constants/roles');
const { FIELD_STATUS } = require('../../constants/field');
const fieldController = require('./field.controller');
const priceController = require('../prices/price.controller');
const fieldClosureController = require('../fieldClosures/fieldClosure.controller');
const scheduleController = require('../schedule/schedule.controller');
const { listQuery, createBody, updateBody, idParams } = require('./field.validation');
const { replaceBody } = require('../prices/price.validation');
const { createBody: closureBody } = require('../fieldClosures/fieldClosure.validation');
const { fieldIdParams, closureIdParams } = require('../fieldClosures/fieldClosure.validation');
const { fieldScheduleQuery } = require('../schedule/schedule.validation');

const router = express.Router();

function applyPublicStatusDefault(req, res, next) {
  if (!req.validated.query.status && req.user?.role !== ROLES.ADMIN) {
    req.validated.query.status = FIELD_STATUS.ACTIVE;
  }
  next();
}

router.get(
  '/',
  optionalAuthenticate,
  validate({ query: listQuery }),
  applyPublicStatusDefault,
  fieldController.list,
);

router.get('/:id/schedule', validate({ params: idParams, query: fieldScheduleQuery }), scheduleController.byField);
router.get('/:id/prices', validate({ params: idParams }), priceController.listByField);
router.get(
  '/:id/closures',
  authenticate,
  authorize(ROLES.ADMIN),
  validate({ params: fieldIdParams }),
  fieldClosureController.list,
);

router.get('/:id', validate({ params: idParams }), fieldController.getById);

router.post(
  '/',
  authenticate,
  authorize(ROLES.ADMIN),
  uploadFieldImage,
  validate({ body: createBody }),
  fieldController.create,
);
router.put(
  '/:id/prices',
  authenticate,
  authorize(ROLES.ADMIN),
  validate({ params: idParams, body: replaceBody }),
  priceController.replaceForField,
);
router.post(
  '/:id/closures',
  authenticate,
  authorize(ROLES.ADMIN),
  validate({ params: fieldIdParams, body: closureBody }),
  fieldClosureController.create,
);
router.delete(
  '/:id/closures/:closureId',
  authenticate,
  authorize(ROLES.ADMIN),
  validate({ params: closureIdParams }),
  fieldClosureController.remove,
);

router.patch(
  '/:id',
  authenticate,
  authorize(ROLES.ADMIN),
  uploadFieldImage,
  validate({ params: idParams, body: updateBody }),
  fieldController.update,
);
router.delete(
  '/:id',
  authenticate,
  authorize(ROLES.ADMIN),
  validate({ params: idParams }),
  fieldController.remove,
);

module.exports = router;
