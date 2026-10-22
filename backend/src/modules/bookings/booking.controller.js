const { ok, created } = require('../../utils/response');
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

module.exports = { create, getById, listMine, listAll, simulatePayment, cancel, adminUpdateStatus };
