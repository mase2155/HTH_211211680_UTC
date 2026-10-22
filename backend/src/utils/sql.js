const { sql } = require('../config/database');

const SQL_ERROR = Object.freeze({
  UNIQUE_INDEX: 2601,
  UNIQUE_CONSTRAINT: 2627,
  FOREIGN_KEY: 547,
});

// Dùng kèm mệnh đề: LIKE @keyword ESCAPE '\'
const LIKE_ESCAPE_CLAUSE = "ESCAPE '\\'";

const escapeLike = (value) => String(value).replace(/[\\%_[]/g, '\\$&');

// Sinh tham số động cho IN (...): trả về chuỗi "@prefix0, @prefix1, ..."
function addInParams(request, prefix, values, sqlType = sql.Int) {
  return values
    .map((value, index) => {
      const name = `${prefix}${index}`;
      request.input(name, sqlType, value);
      return `@${name}`;
    })
    .join(', ');
}

// Sinh danh sách "Cột = @tham_số" cho câu UPDATE từ các trường client gửi lên.
// columns: { fieldName: { column: 'Name', type: sql.NVarChar(150) } }
// Trả về mảng rỗng nếu không có trường nào cần cập nhật. Luôn thêm UpdatedAt.
function buildUpdateSet(request, columns, data) {
  const assignments = [];
  Object.entries(columns).forEach(([field, { column, type }]) => {
    if (data[field] === undefined) return;
    request.input(field, type, data[field]);
    assignments.push(`${column} = @${field}`);
  });
  if (assignments.length > 0) assignments.push('UpdatedAt = SYSUTCDATETIME()');
  return assignments;
}

const isUniqueViolation = (error) =>
  error?.number === SQL_ERROR.UNIQUE_INDEX || error?.number === SQL_ERROR.UNIQUE_CONSTRAINT;

// Kiểm tra vi phạm đúng tên ràng buộc/index (vd: 'UX_Bookings_ActiveSlot')
const isUniqueViolationOf = (error, name) =>
  isUniqueViolation(error) && String(error.message).includes(name);

const isForeignKeyViolation = (error) => error?.number === SQL_ERROR.FOREIGN_KEY;

// Tách script SQL thành các batch theo dòng "GO" (giống SSMS)
const splitSqlBatches = (script) =>
  script
    .split(/^\s*GO\s*$/gim)
    .map((batch) => batch.trim())
    .filter(Boolean);

async function executeSqlScript(executor, script) {
  const batches = splitSqlBatches(script);
  for (const batch of batches) {
    const request = executor instanceof sql.Transaction ? new sql.Request(executor) : executor.request();
    // eslint-disable-next-line no-await-in-loop -- các batch phải chạy tuần tự
    await request.batch(batch);
  }
}

module.exports = {
  LIKE_ESCAPE_CLAUSE,
  escapeLike,
  addInParams,
  buildUpdateSet,
  isUniqueViolation,
  isUniqueViolationOf,
  isForeignKeyViolation,
  splitSqlBatches,
  executeSqlScript,
};
