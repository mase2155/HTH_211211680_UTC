import { httpClient } from '../../api/httpClient';

export async function loginApi(payload) {
  const { data } = await httpClient.post('/auth/login', payload);
  return data.data;
}

export async function registerApi(payload) {
  const { data } = await httpClient.post('/auth/register', payload);
  return data.data;
}

export async function logoutApi() {
  await httpClient.post('/auth/logout');
}

export async function fetchMeApi() {
  const { data } = await httpClient.get('/auth/me');
  return data.data;
}
