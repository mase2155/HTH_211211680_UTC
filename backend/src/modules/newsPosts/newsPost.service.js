const AppError = require('../../utils/AppError');
const { ERROR_CODES } = require('../../constants/errorCodes');
const { buildMeta } = require('../../utils/pagination');
const newsPostRepository = require('./newsPost.repository');

async function list(query) {
  const { items, total } = await newsPostRepository.list(query);
  return { items, meta: buildMeta({ page: query.page, limit: query.limit, total }) };
}

async function getById(id) {
  const item = await newsPostRepository.findById(id);
  if (!item) throw new AppError(404, ERROR_CODES.NOT_FOUND, 'Không tìm thấy bài viết');
  return item;
}

async function create(body) {
  return newsPostRepository.insert(body);
}

async function update(id, body) {
  await getById(id);
  return newsPostRepository.update(id, body);
}

async function remove(id) {
  await getById(id);
  await newsPostRepository.remove(id);
}

module.exports = { list, getById, create, update, remove };
