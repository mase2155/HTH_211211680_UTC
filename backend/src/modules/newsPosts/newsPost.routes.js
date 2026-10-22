const express = require('express');
const validate = require('../../middlewares/validate');
const { authenticate } = require('../../middlewares/authenticate');
const authorize = require('../../middlewares/authorize');
const { ROLES } = require('../../constants/roles');
const newsPostController = require('./newsPost.controller');
const { listQuery, createBody, updateBody, idParams } = require('./newsPost.validation');

const router = express.Router();

router.get('/', validate({ query: listQuery }), newsPostController.list);
router.get('/:id', validate({ params: idParams }), newsPostController.getById);

router.post(
  '/',
  authenticate,
  authorize(ROLES.ADMIN),
  validate({ body: createBody }),
  newsPostController.create,
);
router.patch(
  '/:id',
  authenticate,
  authorize(ROLES.ADMIN),
  validate({ params: idParams, body: updateBody }),
  newsPostController.update,
);
router.delete(
  '/:id',
  authenticate,
  authorize(ROLES.ADMIN),
  validate({ params: idParams }),
  newsPostController.remove,
);

module.exports = router;
