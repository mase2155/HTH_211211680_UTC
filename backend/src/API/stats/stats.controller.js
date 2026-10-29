const { ok } = require('../../utils/response');
const statsService = require('../../modules/stats/stats.service');

async function overview(req, res) {
  return ok(res, await statsService.getOverview());
}

async function revenue(req, res) {
  return ok(res, await statsService.getRevenue(req.validated.query));
}

async function fields(req, res) {
  return ok(res, await statsService.getFieldPerformance());
}

module.exports = { overview, revenue, fields };
