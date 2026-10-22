import { httpClient } from '../../api/httpClient';

export async function fetchFieldsApi(params = {}) {
  const { data } = await httpClient.get('/fields', {
    params: { page: 1, limit: 100, status: 'Active', ...params },
  });
  return { items: data.data, meta: data.meta };
}

export async function fetchFieldByIdApi(id) {
  const { data } = await httpClient.get(`/fields/${id}`);
  return data.data;
}

export async function updateFieldApi(id, payload) {
  const { data } = await httpClient.patch(`/fields/${id}`, payload);
  return data.data;
}
