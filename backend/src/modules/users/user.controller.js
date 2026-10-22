const { ok, noContent } = require('../../utils/response');
const userService = require('./user.service');

async function updateMe(req, res) {
  const user = await userService.updateMe(req.user.id, req.validated.body);
  return ok(res, user);
}

async function changePassword(req, res) {
  await userService.changePassword(req.user.id, req.validated.body);
  return noContent(res);
}

async function listUsers(req, res) {
  const { items, meta } = await userService.listUsers(req.validated.query);
  return ok(res, items, meta);
}

async function adminUpdate(req, res) {
  const user = await userService.adminUpdate(req.validated.params.id, req.validated.body);
  return ok(res, user);
}

module.exports = { updateMe, changePassword, listUsers, adminUpdate };
