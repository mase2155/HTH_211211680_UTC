const { z } = require('zod');
const AppError = require('../utils/AppError');
const { ERROR_CODES } = require('../constants/errorCodes');

// Thông báo lỗi mặc định bằng tiếng Việt cho toàn bộ schema Zod
z.setErrorMap((issue, ctx) => {
  switch (issue.code) {
    case z.ZodIssueCode.invalid_type:
      return {
        message: issue.received === 'undefined' ? 'Trường này là bắt buộc' : 'Kiểu dữ liệu không hợp lệ',
      };
    case z.ZodIssueCode.too_small:
      return {
        message:
          issue.type === 'string'
            ? `Tối thiểu ${issue.minimum} ký tự`
            : `Giá trị tối thiểu là ${issue.minimum}`,
      };
    case z.ZodIssueCode.too_big:
      return {
        message:
          issue.type === 'string'
            ? `Tối đa ${issue.maximum} ký tự`
            : `Giá trị tối đa là ${issue.maximum}`,
      };
    case z.ZodIssueCode.invalid_enum_value:
      return { message: `Giá trị phải là một trong: ${issue.options.join(', ')}` };
    case z.ZodIssueCode.invalid_string:
      return { message: issue.validation === 'email' ? 'Email không hợp lệ' : 'Định dạng không hợp lệ' };
    default:
      return { message: ctx.defaultError };
  }
});

const SOURCES = ['params', 'query', 'body'];

// validate({ params, query, body }) → kết quả đã parse nằm ở req.validated.{params,query,body}
// (Express 5: req.query chỉ đọc nên không ghi đè trực tiếp)
const validate = (schemas) => (req, res, next) => {
  const validated = {};
  const details = [];

  SOURCES.forEach((source) => {
    if (!schemas[source]) return;
    const result = schemas[source].safeParse(req[source] ?? {});
    if (result.success) {
      validated[source] = result.data;
    } else {
      result.error.issues.forEach((issue) => {
        details.push({ source, field: issue.path.join('.'), message: issue.message });
      });
    }
  });

  if (details.length > 0) {
    throw new AppError(400, ERROR_CODES.VALIDATION_ERROR, 'Dữ liệu gửi lên không hợp lệ', details);
  }

  req.validated = validated;
  next();
};

module.exports = validate;
