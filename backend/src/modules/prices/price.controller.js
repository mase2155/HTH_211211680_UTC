const { ok } = require('../../utils/response');
const priceService = require('./price.service');

async function listByField(req, res) {
  return ok(res, await priceService.listByField(req.validated.params.id));
}

async function replaceForField(req, res) {
  return ok(res, await priceService.replaceForField(req.validated.params.id, req.validated.body));
}

module.exports = { listByField, replaceForField };
