import { httpClient } from '../../api/httpClient';

export async function updateProfileApi(payload) {
  const { data } = await httpClient.patch('/users/me', payload);
  return data.data;
}

export async function changePasswordApi(payload) {
  const { data } = await httpClient.patch('/users/me/password', payload);
  return data.data;
}
