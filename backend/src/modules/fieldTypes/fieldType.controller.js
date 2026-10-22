const { ok, created, noContent } = require('../../utils/response');
const fieldTypeService = require('./fieldType.service');

async function list(req, res) {
  const { items, meta } = await fieldTypeService.list(req.validated.query);
  return ok(res, items, meta);
}

async function getById(req, res) {
  const item = await fieldTypeService.getById(req.validated.params.id);
  return ok(res, item);
}

async function create(req, res) {
  const item = await fieldTypeService.create(req.validated.body);
  return created(res, item);
}

async function update(req, res) {
  const item = await fieldTypeService.update(req.validated.params.id, req.validated.body);
  return ok(res, item);
}

async function remove(req, res) {
  await fieldTypeService.remove(req.validated.params.id);
  return noContent(res);
}

module.exports = { list, getById, create, update, remove };
