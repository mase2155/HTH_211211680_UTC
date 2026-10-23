const AppError = require('../../utils/AppError');
const { ERROR_CODES } = require('../../constants/errorCodes');
const { buildMeta } = require('../../utils/pagination');
const partnerItemRepository = require('./partnerItem.repository');

async function list(query) {
  const { items, total } = await partnerItemRepository.list(query);
  return { items, meta: buildMeta({ page: query.page, limit: query.limit, total }) };
}

async function getById(id) {
  const item = await partnerItemRepository.findById(id);
  if (!item) throw new AppError(404, ERROR_CODES.NOT_FOUND, 'Không tìm thấy đối tác');
  return item;
}

async function create(body) {
  const item = await partnerItemRepository.insert(body);
  if (item.sortOrder !== item.id) {
    return partnerItemRepository.update(item.id, { sortOrder: item.id });
  }
  return item;
}

async function update(id, body) {
  await getById(id);
  return partnerItemRepository.update(id, body);
}

async function remove(id) {
  await getById(id);
  await partnerItemRepository.remove(id);
}

module.exports = { list, getById, create, update, remove };
