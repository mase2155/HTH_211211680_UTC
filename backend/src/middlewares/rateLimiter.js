const rateLimit = require('express-rate-limit');
const config = require('../config/env');
const AppError = require('../utils/AppError');
const { ERROR_CODES } = require('../constants/errorCodes');

const WINDOW_MS = 15 * 60 * 1000;

const createLimiter = ({ limit, message, skipSuccessfulRequests = false }) =>
  rateLimit({
    windowMs: WINDOW_MS,
    limit,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    skipSuccessfulRequests,
    skip: () => config.isTest,
    handler: (req, res, next) => next(new AppError(429, ERROR_CODES.TOO_MANY_REQUESTS, message)),
  });

// Giới hạn chung cho toàn bộ /api
const apiLimiter = createLimiter({
  limit: 600,
  message: 'Bạn gửi quá nhiều yêu cầu, vui lòng thử lại sau ít phút',
});

// Chặt hơn cho đăng nhập/đăng ký (chỉ tính các request thất bại để chống dò mật khẩu)
const authLimiter = createLimiter({
  limit: 20,
  skipSuccessfulRequests: true,
  message: 'Bạn thử đăng nhập quá nhiều lần, vui lòng thử lại sau 15 phút',
});

module.exports = { apiLimiter, authLimiter };
