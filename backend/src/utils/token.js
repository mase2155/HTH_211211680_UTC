const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const config = require('../config/env');
const AppError = require('./AppError');
const { ERROR_CODES } = require('../constants/errorCodes');

const JWT_ALGORITHM = 'HS256';

function signAccessToken({ id, role }) {
  return jwt.sign({ role }, config.jwt.accessSecret, {
    algorithm: JWT_ALGORITHM,
    subject: String(id),
    issuer: config.jwt.issuer,
    expiresIn: config.jwt.accessExpiresIn,
  });
}

function verifyAccessToken(token) {
  try {
    const payload = jwt.verify(token, config.jwt.accessSecret, {
      algorithms: [JWT_ALGORITHM],
      issuer: config.jwt.issuer,
    });
    return { id: Number(payload.sub), role: payload.role };
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new AppError(401, ERROR_CODES.TOKEN_EXPIRED, 'Phiên đăng nhập đã hết hạn');
    }
    throw new AppError(401, ERROR_CODES.UNAUTHORIZED, 'Token không hợp lệ');
  }
}

// Refresh token là chuỗi ngẫu nhiên; DB chỉ lưu bản băm SHA-256
const generateRefreshToken = () => crypto.randomBytes(48).toString('base64url');

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

module.exports = { signAccessToken, verifyAccessToken, generateRefreshToken, hashToken };
