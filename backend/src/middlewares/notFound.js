const AppError = require('../utils/AppError');
const { ERROR_CODES } = require('../constants/errorCodes');

function notFound(req, res, next) {
  next(
    new AppError(404, ERROR_CODES.ROUTE_NOT_FOUND, `Không tìm thấy đường dẫn ${req.method} ${req.path}`),
  );
}

module.exports = notFound;
