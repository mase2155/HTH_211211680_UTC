const request = require('supertest');
const app = require('../../src/app');
const { addDays, today } = require('../../src/utils/datetime');

const unique = () => `test_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

async function registerAndLogin(agent) {
  const email = `${unique()}@test.local`;
  const password = 'Test@123456';
  await agent.post('/api/v1/auth/register').send({
    fullName: 'Khách test',
    email,
    password,
    phone: '0909000111',
  });
  const login = await agent.post('/api/v1/auth/login').send({ email, password });
  expect(login.status).toBe(200);
  return {
    token: login.body.data.accessToken,
    userId: login.body.data.user.id,
  };
}

async function pickBookableSlot(agent, token) {
  const fieldsRes = await agent
    .get('/api/v1/fields')
    .set('Authorization', `Bearer ${token}`)
    .query({ limit: 5, status: 'Active' });
  expect(fieldsRes.status).toBe(200);
  const field = fieldsRes.body.data?.[0];
  if (!field) return null;

  const slotsRes = await agent
    .get('/api/v1/time-slots')
    .query({ fieldTypeId: field.fieldTypeId });
  expect(slotsRes.status).toBe(200);
  const slot = slotsRes.body.data.find((s) => s.isActive) ?? slotsRes.body.data[0];
  expect(slot).toBeDefined();

  return { field, slot };
}

describe('bookings API (CSDL thật)', () => {
  test('đặt sân và chống trùng khung giờ trả 409', async () => {
    const agent = request(app);
    const { token } = await registerAndLogin(agent);
    const picked = await pickBookableSlot(agent, token);
    if (!picked) {
      // Cần npm run db:seed và CSDL SportBooking
      return;
    }
    const { field, slot } = picked;
    const bookingDate = addDays(today(), 7);

    const payload = {
      fieldId: field.id,
      timeSlotId: slot.id,
      bookingDate,
      customerName: 'Khách test',
      customerPhone: '0909000111',
      paymentMethod: 'Online',
    };

    const first = await agent
      .post('/api/v1/bookings')
      .set('Authorization', `Bearer ${token}`)
      .send(payload);
    expect(first.status).toBe(201);
    expect(first.body.data.bookingCode).toEqual(expect.any(String));

    const { token: token2 } = await registerAndLogin(agent);
    const second = await agent
      .post('/api/v1/bookings')
      .set('Authorization', `Bearer ${token2}`)
      .send(payload);
    expect(second.status).toBe(409);
    expect(second.body.error.code).toBe('SLOT_ALREADY_BOOKED');
  });

  test('hai request đồng thời cùng slot: một 201 và một 409', async () => {
    const agent = request(app);
    const { token: token1 } = await registerAndLogin(agent);
    const { token: token2 } = await registerAndLogin(agent);
    const picked = await pickBookableSlot(agent, token1);
    if (!picked) return;
    const { field, slot } = picked;
    const bookingDate = addDays(today(), 15);

    const payload = {
      fieldId: field.id,
      timeSlotId: slot.id,
      bookingDate,
      customerName: 'Race test',
      customerPhone: '0909000333',
      paymentMethod: 'PayAtField',
    };

    const [first, second] = await Promise.all([
      agent.post('/api/v1/bookings').set('Authorization', `Bearer ${token1}`).send(payload),
      agent.post('/api/v1/bookings').set('Authorization', `Bearer ${token2}`).send(payload),
    ]);

    const statuses = [first.status, second.status].sort((a, b) => a - b);
    expect(statuses).toEqual([201, 409]);
    const conflict = first.status === 409 ? first : second;
    if (conflict.status === 409) {
      expect(conflict.body.error.code).toBe('SLOT_ALREADY_BOOKED');
    }
  });

  test('khách hủy đơn Pending của mình', async () => {
    const agent = request(app);
    const { token } = await registerAndLogin(agent);
    const picked = await pickBookableSlot(agent, token);
    if (!picked) return;
    const { field, slot } = picked;
    const bookingDate = addDays(today(), 8);

    const created = await agent
      .post('/api/v1/bookings')
      .set('Authorization', `Bearer ${token}`)
      .send({
        fieldId: field.id,
        timeSlotId: slot.id,
        bookingDate,
        customerName: 'Khách test',
        customerPhone: '0909000222',
        paymentMethod: 'PayAtField',
      });
    expect(created.status).toBe(201);
    const bookingId = created.body.data.id;

    const cancelled = await agent
      .patch(`/api/v1/bookings/${bookingId}/cancel`)
      .set('Authorization', `Bearer ${token}`)
      .send({ reason: 'Test hủy' });
    expect(cancelled.status).toBe(200);
    expect(cancelled.body.data.status).toBe('Cancelled');
  });
});
