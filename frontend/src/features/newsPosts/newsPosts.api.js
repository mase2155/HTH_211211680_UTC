import { httpClient } from '../../api/httpClient';

export async function fetchNewsPostsApi(params = {}) {
  const { data } = await httpClient.get('/news-posts', { params: { page: 1, limit: 50, ...params } });
  return { items: data.data, meta: data.meta };
}

export async function createNewsPostApi(payload) {
  const { data } = await httpClient.post('/news-posts', payload);
  return data.data;
}

export async function updateNewsPostApi(id, payload) {
  const { data } = await httpClient.patch(`/news-posts/${id}`, payload);
  return data.data;
}

export async function deleteNewsPostApi(id) {
  await httpClient.delete(`/news-posts/${id}`);
}
