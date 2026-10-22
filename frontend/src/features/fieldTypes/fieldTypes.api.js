import { httpClient } from '../../api/httpClient';

export async function fetchFieldTypesApi(params = {}) {
  const { data } = await httpClient.get('/field-types', { params: { page: 1, limit: 50, isActive: true, ...params } });
  return data.data;
}
