import { httpClient } from '../../api/httpClient';

export async function createBookingApi(payload) {
  const { data } = await httpClient.post('/bookings', payload);
  return data.data;
}

export async function fetchMyBookingsApi(params = {}) {
  const { data } = await httpClient.get('/bookings/me', { params: { page: 1, limit: 20, ...params } });
  return { items: data.data, meta: data.meta };
}

export async function fetchBookingByIdApi(id) {
  const { data } = await httpClient.get(`/bookings/${id}`);
  return data.data;
}

export async function payBookingApi(id) {
  const { data } = await httpClient.post(`/bookings/${id}/payment`);
  return data.data;
}

export async function cancelBookingApi(id, reason) {
  const { data } = await httpClient.patch(`/bookings/${id}/cancel`, reason ? { reason } : {});
  return data.data;
}
