const jwt = require('jsonwebtoken');
const {
  signAccessToken,
  verifyAccessToken,
  generateRefreshToken,
  hashToken,
} = require('../../src/utils/token');

describe('token', () => {
  test('ký và kiểm tra access token', () => {
    const token = signAccessToken({ id: 7, role: 'Admin' });
    expect(verifyAccessToken(token)).toEqual({ id: 7, role: 'Admin' });
  });

  test('token sai chữ ký bị từ chối với mã UNAUTHORIZED', () => {
    const forged = jwt.sign({ role: 'Admin' }, 'another_secret_another_secret_12345', { subject: '1' });
    expect(() => verifyAccessToken(forged)).toThrow(expect.objectContaining({ status: 401, code: 'UNAUTHORIZED' }));
  });

  test('token hết hạn trả mã TOKEN_EXPIRED', () => {
    const expired = jwt.sign({ role: 'Customer' }, process.env.JWT_ACCESS_SECRET, {
      subject: '1',
      issuer: 'sport-booking-api',
      expiresIn: -10,
    });
    expect(() => verifyAccessToken(expired)).toThrow(expect.objectContaining({ code: 'TOKEN_EXPIRED' }));
  });

  test('refresh token ngẫu nhiên, băm SHA-256 ổn định', () => {
    const a = generateRefreshToken();
    const b = generateRefreshToken();
    expect(a).not.toBe(b);
    expect(hashToken(a)).toHaveLength(64);
    expect(hashToken(a)).toBe(hashToken(a));
  });
});
