import { httpClient } from '../../api/httpClient';

export async function fetchTimeSlotsApi(params = {}) {
  const { data } = await httpClient.get('/time-slots', {
    params: { page: 1, limit: 100, isActive: true, ...params },
  });
  return data.data;
}

/** Admin: danh sách có meta, có thể lọc theo loại sân. */
export async function fetchAdminTimeSlotsApi(params = {}) {
  const { isActive, fieldTypeId, ...rest } = params;
  const query = { page: 1, limit: 200, ...rest };
  if (fieldTypeId) query.fieldTypeId = Number(fieldTypeId);
  if (isActive !== undefined && isActive !== '') {
    query.isActive = isActive === true || isActive === 'true';
  }
  const { data } = await httpClient.get('/time-slots', { params: query });
  return { items: data.data, meta: data.meta };
}

export async function createTimeSlotApi(payload) {
  const { data } = await httpClient.post('/time-slots', payload);
  return data.data;
}

export async function updateTimeSlotApi(id, payload) {
  const { data } = await httpClient.patch(`/time-slots/${id}`, payload);
  return data.data;
}

export async function deleteTimeSlotApi(id) {
  await httpClient.delete(`/time-slots/${id}`);
}
