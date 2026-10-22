const AppError = require('../../utils/AppError');
const { ERROR_CODES } = require('../../constants/errorCodes');
const { isUniqueViolationOf } = require('../../utils/sql');
const fieldRepository = require('../fields/field.repository');
const fieldClosureRepository = require('./fieldClosure.repository');

async function list(fieldId) {
  if (!(await fieldRepository.findById(fieldId))) {
    throw new AppError(404, ERROR_CODES.NOT_FOUND, 'Không tìm thấy sân');
  }
  return fieldClosureRepository.listByFieldId(fieldId);
}

async function create(fieldId, body) {
  if (!(await fieldRepository.findById(fieldId))) {
    throw new AppError(404, ERROR_CODES.NOT_FOUND, 'Không tìm thấy sân');
  }
  try {
    return await fieldClosureRepository.insert({ fieldId, ...body });
  } catch (error) {
    if (isUniqueViolationOf(error, 'UQ_FieldClosures_Field_Date')) {
      throw new AppError(409, ERROR_CODES.CONFLICT, 'Ngày nghỉ này đã được khai báo');
    }
    throw error;
  }
}

async function remove(fieldId, closureId) {
  const removed = await fieldClosureRepository.remove(fieldId, closureId);
  if (!removed) {
    throw new AppError(404, ERROR_CODES.NOT_FOUND, 'Không tìm thấy ngày nghỉ');
  }
}

module.exports = { list, create, remove };
