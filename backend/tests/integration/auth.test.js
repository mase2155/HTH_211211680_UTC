const request = require('supertest');
const app = require('../../src/app');

describe('auth API', () => {
  test('đăng nhập Admin thành công', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({
      email: 'admin@sportbooking.vn',
      password: 'Admin@123456',
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.role).toBe('Admin');
    expect(res.body.data.accessToken).toEqual(expect.any(String));
    expect(res.headers['set-cookie']).toEqual(
      expect.arrayContaining([expect.stringContaining('refreshToken=')]),
    );
  });

  test('sai mật khẩu trả INVALID_CREDENTIALS', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({
      email: 'admin@sportbooking.vn',
      password: 'wrong-password',
    });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
  });
});
