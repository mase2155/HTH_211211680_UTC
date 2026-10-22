const AppError = require('../../utils/AppError');
const { ERROR_CODES } = require('../../constants/errorCodes');
const { buildMeta } = require('../../utils/pagination');
const { today } = require('../../utils/datetime');
const { isUniqueViolationOf, isForeignKeyViolation } = require('../../utils/sql');
const fieldTypeRepository = require('../fieldTypes/fieldType.repository');
const timeSlotRepository = require('./timeSlot.repository');

async function ensureFieldType(fieldTypeId) {
  const type = await fieldTypeRepository.findById(fieldTypeId);
  if (!type) {
    throw new AppError(404, ERROR_CODES.NOT_FOUND, 'Không tìm thấy loại sân');
  }
  return type;
}

async function ensureNoOverlap(payload, excludeId) {
  const overlap = await timeSlotRepository.hasOverlap({ ...payload, excludeId });
  if (overlap) {
    throw new AppError(409, ERROR_CODES.TIME_SLOT_OVERLAP, 'Khung giờ bị chồng lấn với khung giờ khác');
  }
}

async function list(query) {
  const { items, total } = await timeSlotRepository.list(query);
  return { items, meta: buildMeta({ page: query.page, limit: query.limit, total }) };
}

async function getById(id) {
  const item = await timeSlotRepository.findById(id);
  if (!item) {
    throw new AppError(404, ERROR_CODES.NOT_FOUND, 'Không tìm thấy khung giờ');
  }
  return item;
}

async function create(body) {
  await ensureFieldType(body.fieldTypeId);
  await ensureNoOverlap(body);
  try {
    return await timeSlotRepository.insert(body);
  } catch (error) {
    if (isUniqueViolationOf(error, 'UQ_TimeSlots_Type_Range')) {
      throw new AppError(409, ERROR_CODES.CONFLICT, 'Khung giờ này đã tồn tại');
    }
    throw error;
  }
}

async function update(id, body) {
  const current = await getById(id);
  const next = {
    fieldTypeId: current.fieldTypeId,
    startTime: body.startTime ?? current.startTime,
    endTime: body.endTime ?? current.endTime,
  };
  if (body.startTime !== undefined || body.endTime !== undefined) {
    const futureBookings = await timeSlotRepository.countFutureBookings(id, today());
    if (futureBookings > 0) {
      throw new AppError(
        409,
        ERROR_CODES.RESOURCE_IN_USE,
        'Khung giờ đang có đơn đặt tương lai, không thể đổi giờ',
      );
    }
    await ensureNoOverlap(next, id);
  }
  try {
    return await timeSlotRepository.update(id, body);
  } catch (error) {
    if (isUniqueViolationOf(error, 'UQ_TimeSlots_Type_Range')) {
      throw new AppError(409, ERROR_CODES.CONFLICT, 'Khung giờ này đã tồn tại');
    }
    throw error;
  }
}

async function remove(id) {
  await getById(id);
  const futureBookings = await timeSlotRepository.countFutureBookings(id, today());
  if (futureBookings > 0) {
    throw new AppError(409, ERROR_CODES.RESOURCE_IN_USE, 'Khung giờ đang có đơn đặt, không thể xóa');
  }
  try {
    await timeSlotRepository.remove(id);
  } catch (error) {
    if (isForeignKeyViolation(error)) {
      throw new AppError(409, ERROR_CODES.RESOURCE_IN_USE, 'Khung giờ đang được tham chiếu, không thể xóa');
    }
    throw error;
  }
}

module.exports = { list, getById, create, update, remove };
