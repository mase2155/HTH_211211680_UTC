const AppError = require('../../utils/AppError');
const { ERROR_CODES } = require('../../constants/errorCodes');
const { buildMeta } = require('../../utils/pagination');
const { getDayType } = require('../../utils/datetime');
const { isUniqueViolationOf, isForeignKeyViolation } = require('../../utils/sql');
const { toFieldImageUrl, deleteFieldImage } = require('../../utils/fileStorage');
const fieldTypeRepository = require('../fieldTypes/fieldType.repository');
const fieldRepository = require('./field.repository');

function mapListQuery(query) {
  const filters = { ...query };
  if (filters.bookingDate && filters.timeSlotId) {
    filters.dayType = getDayType(filters.bookingDate);
  } else if (filters.bookingDate || filters.timeSlotId) {
    throw new AppError(
      400,
      ERROR_CODES.VALIDATION_ERROR,
      'Lọc theo lịch cần đồng thời bookingDate và timeSlotId',
    );
  }
  return filters;
}

async function list(query) {
  const filters = mapListQuery(query);
  const { items, total } = await fieldRepository.list(filters);
  return { items, meta: buildMeta({ page: query.page, limit: query.limit, total }) };
}

async function getById(id) {
  const item = await fieldRepository.findById(id);
  if (!item) {
    throw new AppError(404, ERROR_CODES.NOT_FOUND, 'Không tìm thấy sân');
  }
  return item;
}

async function create(body, file) {
  const type = await fieldTypeRepository.findById(body.fieldTypeId);
  if (!type || !type.isActive) {
    throw new AppError(404, ERROR_CODES.NOT_FOUND, 'Loại sân không hợp lệ hoặc đã ngừng hoạt động');
  }
  const payload = { ...body, imageUrl: file ? toFieldImageUrl(file.filename) : null };
  try {
    return await fieldRepository.insert(payload);
  } catch (error) {
    if (isUniqueViolationOf(error, 'UQ_Fields_Name')) {
      throw new AppError(409, ERROR_CODES.CONFLICT, 'Tên sân đã tồn tại');
    }
    throw error;
  }
}

async function update(id, body, file) {
  const current = await getById(id);
  if (body.fieldTypeId) {
    const type = await fieldTypeRepository.findById(body.fieldTypeId);
    if (!type) {
      throw new AppError(404, ERROR_CODES.NOT_FOUND, 'Không tìm thấy loại sân');
    }
  }
  const payload = { ...body };
  if (file) {
    payload.imageUrl = toFieldImageUrl(file.filename);
    await deleteFieldImage(current.imageUrl);
  }
  try {
    return await fieldRepository.update(id, payload);
  } catch (error) {
    if (isUniqueViolationOf(error, 'UQ_Fields_Name')) {
      throw new AppError(409, ERROR_CODES.CONFLICT, 'Tên sân đã tồn tại');
    }
    throw error;
  }
}

async function remove(id) {
  await getById(id);
  const used = await fieldRepository.countActiveBookings(id);
  if (used > 0) {
    throw new AppError(
      409,
      ERROR_CODES.RESOURCE_IN_USE,
      'Sân đang có đơn đặt, không thể xóa. Hãy chuyển sang trạng thái ngừng hoạt động.',
    );
  }
  try {
    const current = await getById(id);
    await fieldRepository.remove(id);
    await deleteFieldImage(current.imageUrl);
  } catch (error) {
    if (isForeignKeyViolation(error)) {
      throw new AppError(409, ERROR_CODES.RESOURCE_IN_USE, 'Sân đang được tham chiếu, không thể xóa');
    }
    throw error;
  }
}

module.exports = { list, getById, create, update, remove };
