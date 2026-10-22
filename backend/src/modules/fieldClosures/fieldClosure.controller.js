const { ok, created, noContent } = require('../../utils/response');
const fieldClosureService = require('./fieldClosure.service');

async function list(req, res) {
  return ok(res, await fieldClosureService.list(req.validated.params.id));
}

async function create(req, res) {
  return created(res, await fieldClosureService.create(req.validated.params.id, req.validated.body));
}

async function remove(req, res) {
  await fieldClosureService.remove(req.validated.params.id, req.validated.params.closureId);
  return noContent(res);
}

module.exports = { list, create, remove };
