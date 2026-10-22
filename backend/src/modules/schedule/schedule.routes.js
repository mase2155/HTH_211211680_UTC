const express = require('express');
const validate = require('../../middlewares/validate');
const scheduleController = require('./schedule.controller');
const { boardQuery } = require('./schedule.validation');

const router = express.Router();

router.get('/', validate({ query: boardQuery }), scheduleController.board);

module.exports = router;
