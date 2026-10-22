const request = require('supertest');
const app = require('../../src/app');

describe('app (không cần CSDL)', () => {
  test('đường dẫn không tồn tại trả 404 theo đúng định dạng lỗi', async () => {
    const res = await request(app).get('/api/v1/khong-ton-tai');
    expect(res.status).toBe(404);
    expect(res.body).toEqual({
      success: false,
      error: { code: 'ROUTE_NOT_FOUND', message: expect.any(String) },
    });
  });

  test('JSON sai cú pháp trả 400 VALIDATION_ERROR', async () => {
    const res = await request(app)
      .post('/api/v1/khong-ton-tai')
      .set('Content-Type', 'application/json')
      .send('{"a":');
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  test('response có header bảo mật của helmet và X-Request-Id', async () => {
    const res = await request(app).get('/api/v1/khong-ton-tai');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['x-request-id']).toBeDefined();
    expect(res.headers['x-powered-by']).toBeUndefined();
  });
});
