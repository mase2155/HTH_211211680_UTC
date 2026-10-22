const { ok, created, noContent } = require('../../utils/response');
const fieldService = require('./field.service');

async function list(req, res) {
  const { items, meta } = await fieldService.list(req.validated.query);
  return ok(res, items, meta);
}

async function getById(req, res) {
  return ok(res, await fieldService.getById(req.validated.params.id));
}

async function create(req, res) {
  return created(res, await fieldService.create(req.validated.body, req.file));
}

async function update(req, res) {
  return ok(res, await fieldService.update(req.validated.params.id, req.validated.body, req.file));
}

async function remove(req, res) {
  await fieldService.remove(req.validated.params.id);
  return noContent(res);
}

module.exports = { list, getById, create, update, remove };
