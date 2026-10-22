import { httpClient } from '../../api/httpClient';

export async function fetchTimeSlotsApi(params = {}) {
  const { data } = await httpClient.get('/time-slots', {
    params: { page: 1, limit: 100, isActive: true, ...params },
  });
  return data.data;
}
