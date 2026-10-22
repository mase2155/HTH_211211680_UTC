const AppError = require('../../utils/AppError');
const { ERROR_CODES } = require('../../constants/errorCodes');
const fieldRepository = require('../fields/field.repository');
const timeSlotRepository = require('../timeSlots/timeSlot.repository');
const priceRepository = require('./price.repository');

async function listByField(fieldId) {
  const field = await fieldRepository.findById(fieldId);
  if (!field) {
    throw new AppError(404, ERROR_CODES.NOT_FOUND, 'Không tìm thấy sân');
  }
  return priceRepository.listByFieldId(fieldId);
}

async function replaceForField(fieldId, { items }) {
  const field = await fieldRepository.findById(fieldId);
  if (!field) {
    throw new AppError(404, ERROR_CODES.NOT_FOUND, 'Không tìm thấy sân');
  }

  for (const item of items) {
    const slot = await timeSlotRepository.findById(item.timeSlotId);
    if (!slot || slot.fieldTypeId !== field.fieldTypeId) {
      throw new AppError(
        400,
        ERROR_CODES.VALIDATION_ERROR,
        'Khung giờ không thuộc loại sân của sân này',
      );
    }
  }

  await priceRepository.replaceForField(fieldId, items);
  return priceRepository.listByFieldId(fieldId);
}

module.exports = { listByField, replaceForField };
