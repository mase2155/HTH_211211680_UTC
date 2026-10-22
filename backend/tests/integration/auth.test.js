const request = require('supertest');
const app = require('../../src/app');
const config = require('../../src/config/env');

describe('auth API', () => {
  test('đăng nhập Admin thành công', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({
      email: config.admin.email ?? 'hathehung260923@gmail.com',
      password: process.env.ADMIN_PASSWORD ?? 'Admin@123456',
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
      email: config.admin.email ?? 'hathehung260923@gmail.com',
      password: 'wrong-password',
    });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
  });
});
