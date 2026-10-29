const { ok, created, noContent } = require('../../utils/response');
const newsPostService = require('../../modules/newsPosts/newsPost.service');

async function list(req, res) {
  const { items, meta } = await newsPostService.list(req.validated.query);
  return ok(res, items, meta);
}

async function getById(req, res) {
  return ok(res, await newsPostService.getById(req.validated.params.id));
}

async function create(req, res) {
  return created(res, await newsPostService.create(req.validated.body));
}

async function update(req, res) {
  return ok(res, await newsPostService.update(req.validated.params.id, req.validated.body));
}

async function remove(req, res) {
  await newsPostService.remove(req.validated.params.id);
  return noContent(res);
}

module.exports = { list, getById, create, update, remove };
