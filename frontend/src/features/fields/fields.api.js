import { httpClient } from '../../api/httpClient';

export async function fetchFieldsApi(params = {}) {
  const { data } = await httpClient.get('/fields', {
    params: { page: 1, limit: 100, status: 'Active', ...params },
  });
  return { items: data.data, meta: data.meta };
}

/** Admin: không lọc mặc định theo Active — middleware route gán Active chỉ cho khách. */
export async function fetchAdminFieldsApi(params = {}) {
  const { data } = await httpClient.get('/fields', {
    params: { page: 1, limit: 100, ...params },
  });
  return { items: data.data, meta: data.meta };
}

export async function createFieldApi(payload) {
  const { data } = await httpClient.post('/fields', payload);
  return data.data;
}

export async function fetchFieldPricesApi(fieldId) {
  const { data } = await httpClient.get(`/fields/${fieldId}/prices`);
  return data.data;
}

export async function replaceFieldPricesApi(fieldId, items) {
  const { data } = await httpClient.put(`/fields/${fieldId}/prices`, { items });
  return data.data;
}

export async function fetchFieldByIdApi(id) {
  const { data } = await httpClient.get(`/fields/${id}`);
  return data.data;
}

export async function updateFieldApi(id, payload) {
  const { data } = await httpClient.patch(`/fields/${id}`, payload);
  return data.data;
}

export async function deleteFieldApi(id) {
  await httpClient.delete(`/fields/${id}`);
}
