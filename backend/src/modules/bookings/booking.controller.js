const { ok, created, noContent } = require('../../utils/response');
const bookingService = require('./booking.service');

async function create(req, res) {
  return created(res, await bookingService.create(req.user.id, req.validated.body));
}

async function getById(req, res) {
  return ok(res, await bookingService.getById(req.validated.params.id, req.user));
}

async function listMine(req, res) {
  const { items, meta } = await bookingService.listMine(req.user.id, req.validated.query);
  return ok(res, items, meta);
}

async function listAll(req, res) {
  const { items, meta } = await bookingService.listAll(req.validated.query);
  return ok(res, items, meta);
}

async function simulatePayment(req, res) {
  return ok(res, await bookingService.simulatePayment(req.validated.params.id, req.user));
}

async function cancel(req, res) {
  return ok(res, await bookingService.cancel(req.validated.params.id, req.user, req.validated.body.reason));
}

async function adminUpdateStatus(req, res) {
  return ok(
    res,
    await bookingService.adminUpdateStatus(req.validated.params.id, req.validated.body),
  );
}

async function adminUpdate(req, res) {
  return ok(res, await bookingService.adminUpdate(req.validated.params.id, req.validated.body));
}

async function adminRemove(req, res) {
  await bookingService.adminRemove(req.validated.params.id, req.user.id, req.validated.body);
  return noContent(res);
}

module.exports = {
  create,
  getById,
  listMine,
  listAll,
  simulatePayment,
  cancel,
  adminUpdateStatus,
  adminUpdate,
  adminRemove,
};
