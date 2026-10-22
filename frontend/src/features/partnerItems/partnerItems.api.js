import { httpClient } from '../../api/httpClient';

export async function fetchPartnerItemsApi(params = {}) {
  const { data } = await httpClient.get('/partner-items', { params: { page: 1, limit: 50, ...params } });
  return { items: data.data, meta: data.meta };
}

export async function createPartnerItemApi(payload) {
  const { data } = await httpClient.post('/partner-items', payload);
  return data.data;
}

export async function updatePartnerItemApi(id, payload) {
  const { data } = await httpClient.patch(`/partner-items/${id}`, payload);
  return data.data;
}

export async function deletePartnerItemApi(id) {
  await httpClient.delete(`/partner-items/${id}`);
}
