const AppError = require('../../utils/AppError');
const { ERROR_CODES } = require('../../constants/errorCodes');
const { buildMeta } = require('../../utils/pagination');
const { hashPassword, comparePassword } = require('../../utils/password');
const userRepository = require('./user.repository');

async function updateMe(userId, body) {
  return userRepository.updateProfile(userId, body);
}

async function changePassword(userId, { currentPassword, newPassword }) {
  const profile = await userRepository.findById(userId);
  if (!profile) {
    throw new AppError(404, ERROR_CODES.NOT_FOUND, 'Không tìm thấy người dùng');
  }
  const auth = await userRepository.findAuthByEmail(profile.email);
  if (!auth || !(await comparePassword(currentPassword, auth.passwordHash))) {
    throw new AppError(400, ERROR_CODES.INVALID_CREDENTIALS, 'Mật khẩu hiện tại không đúng');
  }
  await userRepository.updatePasswordHash(userId, await hashPassword(newPassword));
}

async function listUsers(query) {
  const { items, total } = await userRepository.listUsers(query);
  return { items, meta: buildMeta({ page: query.page, limit: query.limit, total }) };
}

async function adminUpdate(id, body) {
  const user = await userRepository.findById(id);
  if (!user) {
    throw new AppError(404, ERROR_CODES.NOT_FOUND, 'Không tìm thấy người dùng');
  }
  return userRepository.updateByAdmin(id, body);
}

module.exports = { updateMe, changePassword, listUsers, adminUpdate };
