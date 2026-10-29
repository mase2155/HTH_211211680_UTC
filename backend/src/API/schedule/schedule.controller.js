const { ok } = require('../../utils/response');
const scheduleService = require('../../modules/schedule/schedule.service');

async function byField(req, res) {
  const data = await scheduleService.byField(req.validated.params.id, req.validated.query.date);
  return ok(res, data);
}

async function board(req, res) {
  const data = await scheduleService.board(req.validated.query);
  return ok(res, data);
}

module.exports = { byField, board };
