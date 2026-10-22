import { httpClient } from '../../api/httpClient';

export async function fetchStatsOverviewApi() {
  const { data } = await httpClient.get('/stats/overview');
  return data.data;
}
