const AppError = require('../utils/AppError');
const { verifyAccessToken } = require('../utils/token');
const { ERROR_CODES } = require('../constants/errorCodes');

function extractBearerToken(req) {
  const header = req.headers.authorization;
  if (!header) return null;
  const [scheme, token] = header.split(' ');
  return scheme === 'Bearer' && token ? token : null;
}

// Bắt buộc đăng nhập: gán req.user = { id, role }
function authenticate(req, res, next) {
  const token = extractBearerToken(req);
  if (!token) {
    throw new AppError(401, ERROR_CODES.UNAUTHORIZED, 'Vui lòng đăng nhập để tiếp tục');
  }
  req.user = verifyAccessToken(token);
  next();
}

// Đăng nhập tùy chọn: có token hợp lệ thì gán req.user, không có thì bỏ qua
function optionalAuthenticate(req, res, next) {
  const token = extractBearerToken(req);
  if (token) req.user = verifyAccessToken(token);
  next();
}

module.exports = { authenticate, optionalAuthenticate };
