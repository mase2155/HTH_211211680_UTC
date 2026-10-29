import { httpClient } from '../../api/httpClient';

export async function fetchStatsOverviewApi() {
  const { data } = await httpClient.get('/stats/overview');
  return data.data;
}

export async function fetchStatsRevenueApi(params = {}) {
  const { data } = await httpClient.get('/stats/revenue', { params });
  return data.data;
}

export async function fetchStatsFieldsApi() {
  const { data } = await httpClient.get('/stats/fields');
  return data.data;
}
