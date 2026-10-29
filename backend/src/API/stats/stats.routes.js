const express = require('express');
const validate = require('../../middlewares/validate');
const { authenticate } = require('../../middlewares/authenticate');
const authorize = require('../../middlewares/authorize');
const { ROLES } = require('../../constants/roles');
const statsController = require('./stats.controller');
const { revenueQuery } = require('../../modules/stats/stats.validation');

const router = express.Router();

router.use(authenticate, authorize(ROLES.ADMIN));

router.get('/overview', statsController.overview);
router.get('/revenue', validate({ query: revenueQuery }), statsController.revenue);
router.get('/fields', statsController.fields);

module.exports = router;
