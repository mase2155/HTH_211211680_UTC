import { httpClient } from '../../api/httpClient';

export async function fetchFieldTypesApi(params = {}) {
  const { data } = await httpClient.get('/field-types', {
    params: { page: 1, limit: 50, isActive: true, ...params },
  });
  return data.data;
}

/** Admin: danh sách có meta, mặc định gồm cả loại đang tắt. */
export async function fetchAdminFieldTypesApi(params = {}) {
  const { isActive, ...rest } = params;
  const query = { page: 1, limit: 100, ...rest };
  if (isActive !== undefined && isActive !== '') {
    query.isActive = isActive === true || isActive === 'true';
  }
  const { data } = await httpClient.get('/field-types', { params: query });
  return { items: data.data, meta: data.meta };
}

export async function createFieldTypeApi(payload) {
  const { data } = await httpClient.post('/field-types', payload);
  return data.data;
}

export async function updateFieldTypeApi(id, payload) {
  const { data } = await httpClient.patch(`/field-types/${id}`, payload);
  return data.data;
}

export async function deleteFieldTypeApi(id) {
  await httpClient.delete(`/field-types/${id}`);
}
