const AppError = require('../../utils/AppError');
const { ERROR_CODES } = require('../../constants/errorCodes');
const { buildMeta } = require('../../utils/pagination');
const { isUniqueViolationOf, isForeignKeyViolation } = require('../../utils/sql');
const fieldTypeRepository = require('./fieldType.repository');

async function list(query) {
  const { items, total } = await fieldTypeRepository.list(query);
  return { items, meta: buildMeta({ page: query.page, limit: query.limit, total }) };
}

async function getById(id) {
  const item = await fieldTypeRepository.findById(id);
  if (!item) {
    throw new AppError(404, ERROR_CODES.NOT_FOUND, 'Không tìm thấy loại sân');
  }
  return item;
}

async function create(body) {
  try {
    return await fieldTypeRepository.insert(body);
  } catch (error) {
    if (isUniqueViolationOf(error, 'UQ_FieldTypes_Name')) {
      throw new AppError(409, ERROR_CODES.CONFLICT, 'Tên loại sân đã tồn tại');
    }
    throw error;
  }
}

async function update(id, body) {
  await getById(id);
  try {
    return await fieldTypeRepository.update(id, body);
  } catch (error) {
    if (isUniqueViolationOf(error, 'UQ_FieldTypes_Name')) {
      throw new AppError(409, ERROR_CODES.CONFLICT, 'Tên loại sân đã tồn tại');
    }
    throw error;
  }
}

async function remove(id) {
  await getById(id);
  const used = await fieldTypeRepository.countFieldsUsingType(id);
  if (used > 0) {
    throw new AppError(
      409,
      ERROR_CODES.RESOURCE_IN_USE,
      'Loại sân đang được sử dụng, không thể xóa. Hãy chuyển sang trạng thái ngừng hoạt động.',
    );
  }
  try {
    await fieldTypeRepository.remove(id);
  } catch (error) {
    if (isForeignKeyViolation(error)) {
      throw new AppError(409, ERROR_CODES.RESOURCE_IN_USE, 'Loại sân đang được tham chiếu, không thể xóa');
    }
    throw error;
  }
}

module.exports = { list, getById, create, update, remove };
