const config = require('../../config/env');
const AppError = require('../../utils/AppError');
const { ERROR_CODES } = require('../../constants/errorCodes');
const { ROLES } = require('../../constants/roles');
const { hashPassword, comparePassword } = require('../../utils/password');
const { signAccessToken, generateRefreshToken, hashToken } = require('../../utils/token');
const { isUniqueViolationOf } = require('../../utils/sql');
const { withTransaction } = require('../../config/database');
const userRepository = require('../users/user.repository');
const refreshTokenRepository = require('./refreshToken.repository');

function refreshExpiresAt() {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + config.refreshToken.expiresDays);
  return date;
}

async function createSession(userId, role, tx) {
  const refreshToken = generateRefreshToken();
  await refreshTokenRepository.insertToken(
    {
      userId,
      tokenHash: hashToken(refreshToken),
      expiresAt: refreshExpiresAt(),
    },
    tx,
  );
  return {
    accessToken: signAccessToken({ id: userId, role }),
    refreshToken,
  };
}

async function register({ fullName, email, password, phone }) {
  const normalizedEmail = email.toLowerCase();
  const passwordHash = await hashPassword(password);

  try {
    return await withTransaction(async (tx) => {
      const user = await userRepository.createUser(
        {
          fullName,
          email: normalizedEmail,
          passwordHash,
          phone,
          role: ROLES.CUSTOMER,
        },
        tx,
      );
      const session = await createSession(user.id, user.role, tx);
      return { user, session };
    });
  } catch (error) {
    if (isUniqueViolationOf(error, 'UQ_Users_Email')) {
      throw new AppError(409, ERROR_CODES.EMAIL_ALREADY_EXISTS, 'Email đã được sử dụng');
    }
    throw error;
  }
}

async function login({ email, password }) {
  const normalizedEmail = email.toLowerCase();
  const authUser = await userRepository.findAuthByEmail(normalizedEmail);
  if (!authUser || !(await comparePassword(password, authUser.passwordHash))) {
    throw new AppError(401, ERROR_CODES.INVALID_CREDENTIALS, 'Email hoặc mật khẩu không đúng');
  }
  if (!authUser.isActive) {
    throw new AppError(403, ERROR_CODES.ACCOUNT_DISABLED, 'Tài khoản đã bị khóa');
  }

  const session = await createSession(authUser.id, authUser.role);
  const user = await userRepository.findById(authUser.id);
  return { user, session };
}

async function refresh(refreshToken) {
  if (!refreshToken) {
    throw new AppError(401, ERROR_CODES.UNAUTHORIZED, 'Phiên đăng nhập không hợp lệ');
  }

  const tokenHash = hashToken(refreshToken);
  const stored = await refreshTokenRepository.findValidByHash(tokenHash);
  if (!stored) {
    throw new AppError(401, ERROR_CODES.UNAUTHORIZED, 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn');
  }

  const user = await userRepository.findById(stored.userId);
  if (!user || !user.isActive) {
    throw new AppError(403, ERROR_CODES.ACCOUNT_DISABLED, 'Tài khoản đã bị khóa');
  }

  await refreshTokenRepository.revokeByHash(tokenHash);
  const session = await createSession(user.id, user.role);
  return { user, session };
}

async function logout(refreshToken) {
  if (!refreshToken) return;
  await refreshTokenRepository.revokeByHash(hashToken(refreshToken));
}

async function getMe(userId) {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new AppError(404, ERROR_CODES.NOT_FOUND, 'Không tìm thấy người dùng');
  }
  if (!user.isActive) {
    throw new AppError(403, ERROR_CODES.ACCOUNT_DISABLED, 'Tài khoản đã bị khóa');
  }
  return user;
}

module.exports = { register, login, refresh, logout, getMe };
