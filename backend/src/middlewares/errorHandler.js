const multer = require('multer');
const logger = require('../config/logger');
const AppError = require('../utils/AppError');
const { isUniqueViolation } = require('../utils/sql');
const { ERROR_CODES } = require('../constants/errorCodes');

// Chuyển mọi loại lỗi thành AppError để trả response thống nhất
function normalizeError(error) {
  if (error instanceof AppError) return error;

  if (error.type === 'entity.parse.failed') {
    return new AppError(400, ERROR_CODES.VALIDATION_ERROR, 'Dữ liệu JSON không hợp lệ');
  }
  if (error.type === 'entity.too.large') {
    return new AppError(413, ERROR_CODES.PAYLOAD_TOO_LARGE, 'Dữ liệu gửi lên quá lớn');
  }
  if (error instanceof multer.MulterError) {
    const message =
      error.code === 'LIMIT_FILE_SIZE'
        ? 'Dung lượng ảnh vượt quá giới hạn cho phép'
        : 'Tệp tải lên không hợp lệ';
    return new AppError(400, ERROR_CODES.INVALID_FILE, message);
  }
  if (isUniqueViolation(error)) {
    return new AppError(409, ERROR_CODES.CONFLICT, 'Dữ liệu đã tồn tại');
  }
  return new AppError(500, ERROR_CODES.INTERNAL_ERROR, 'Đã xảy ra lỗi hệ thống, vui lòng thử lại sau');
}

// Express nhận diện error handler qua đủ 4 tham số
function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);

  const appError = normalizeError(error);

  if (appError.status >= 500) {
    (req.log || logger).error({ err: error }, 'Lỗi không mong đợi');
  }

  const body = { success: false, error: { code: appError.code, message: appError.message } };
  if (appError.details) body.error.details = appError.details;

  return res.status(appError.status).json(body);
}

module.exports = errorHandler;
