const AppError = require('../utils/AppError');
const { ERROR_CODES } = require('../constants/errorCodes');

// Dùng sau authenticate: authorize(ROLES.ADMIN)
const authorize =
  (...allowedRoles) =>
  (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      throw new AppError(403, ERROR_CODES.FORBIDDEN, 'Bạn không có quyền thực hiện thao tác này');
    }
    next();
  };

module.exports = authorize;
