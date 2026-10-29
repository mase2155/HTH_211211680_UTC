const { ok, created, noContent } = require('../../utils/response');
const partnerItemService = require('../../modules/partnerItems/partnerItem.service');

async function list(req, res) {
  const { items, meta } = await partnerItemService.list(req.validated.query);
  return ok(res, items, meta);
}

async function getById(req, res) {
  return ok(res, await partnerItemService.getById(req.validated.params.id));
}

async function create(req, res) {
  return created(res, await partnerItemService.create(req.validated.body));
}

async function update(req, res) {
  return ok(res, await partnerItemService.update(req.validated.params.id, req.validated.body));
}

async function remove(req, res) {
  await partnerItemService.remove(req.validated.params.id);
  return noContent(res);
}

module.exports = { list, getById, create, update, remove };
