const { ok, created, noContent } = require('../../utils/response');
const timeSlotService = require('./timeSlot.service');

async function list(req, res) {
  const { items, meta } = await timeSlotService.list(req.validated.query);
  return ok(res, items, meta);
}

async function getById(req, res) {
  return ok(res, await timeSlotService.getById(req.validated.params.id));
}

async function create(req, res) {
  return created(res, await timeSlotService.create(req.validated.body));
}

async function update(req, res) {
  return ok(res, await timeSlotService.update(req.validated.params.id, req.validated.body));
}

async function remove(req, res) {
  await timeSlotService.remove(req.validated.params.id);
  return noContent(res);
}

module.exports = { list, getById, create, update, remove };
