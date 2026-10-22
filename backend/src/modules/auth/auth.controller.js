const config = require('../../config/env');
const { ok, created, noContent } = require('../../utils/response');
const authService = require('./auth.service');

function refreshCookieOptions() {
  const maxAge = config.refreshToken.expiresDays * 24 * 60 * 60 * 1000;
  return {
    httpOnly: true,
    secure: config.isProduction,
    sameSite: 'strict',
    path: config.refreshToken.cookiePath,
    maxAge,
  };
}

function setRefreshCookie(res, refreshToken) {
  res.cookie(config.refreshToken.cookieName, refreshToken, refreshCookieOptions());
}

function clearRefreshCookie(res) {
  res.clearCookie(config.refreshToken.cookieName, {
    httpOnly: true,
    secure: config.isProduction,
    sameSite: 'strict',
    path: config.refreshToken.cookiePath,
  });
}

function authPayload(user, session) {
  return { user, accessToken: session.accessToken };
}

async function register(req, res) {
  const result = await authService.register(req.validated.body);
  setRefreshCookie(res, result.session.refreshToken);
  return created(res, authPayload(result.user, result.session));
}

async function login(req, res) {
  const result = await authService.login(req.validated.body);
  setRefreshCookie(res, result.session.refreshToken);
  return ok(res, authPayload(result.user, result.session));
}

async function refresh(req, res) {
  const token = req.cookies[config.refreshToken.cookieName];
  const result = await authService.refresh(token);
  setRefreshCookie(res, result.session.refreshToken);
  return ok(res, authPayload(result.user, result.session));
}

async function logout(req, res) {
  const token = req.cookies[config.refreshToken.cookieName];
  await authService.logout(token);
  clearRefreshCookie(res);
  return noContent(res);
}

async function me(req, res) {
  const user = await authService.getMe(req.user.id);
  return ok(res, user);
}

module.exports = { register, login, refresh, logout, me };
